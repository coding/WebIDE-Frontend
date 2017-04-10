/* eslint no-console: 0 */
require('dotenv').config();
const qiniu = require('qiniu');
const fs = require('fs');
const path = require('path');
const {
    STATIC_DIR,
    QINIU_ACCESS_KEY,
    QINIU_SECRET_KEY,
    QINIU_BUCKET,
} = process.env;

qiniu.conf.ACCESS_KEY = QINIU_ACCESS_KEY;
qiniu.conf.SECRET_KEY = QINIU_SECRET_KEY;

let totalCount = 0,
    uploadedCount = 0;
const retryCountMap = new Map(),
    SINGLE_RETRY_COUNT_LIMIT = 10;

function uptoken(bucket, key) {
    const putPolicy = new qiniu.rs.PutPolicy(`${bucket}:${key}`);
    return putPolicy.token();
}

function getKey(fullpath) {
    return path.relative(STATIC_DIR, fullpath).replace(/^\w+\//, '');
}

function deduplicateFiles(files = [], bucket) {
    const entries = files.map(getKey)
        .map(key => new qiniu.rs.EntryPath(bucket, key));
    console.info('[INFO] Qiniu upload file detect file duplication');
    return new Promise((resolve, reject) => {
        const client = new qiniu.rs.Client();
        client.batchStat(entries, (err, res) => {
            if (err) {
                reject(err);
                console.error(
                    '[FAIL] Qiniu upload file detect file duplication fail' +
                    ` (Response Code: ${err.code})`
                );
                const retryCount = retryCountMap.get('deduplicate') || 0;
                if (retryCount < SINGLE_RETRY_COUNT_LIMIT) {
                    const nextRetryCount = retryCount + 1;
                    retryCountMap.set('deduplicate', nextRetryCount);
                    console.info(
                        '[INFO] Qiniu upload file detect retry' +
                        `(${nextRetryCount}/${SINGLE_RETRY_COUNT_LIMIT})`
                    );
                    return deduplicateFiles(files, bucket);
                }
                process.exit(1);
            }
            const fileStats = res.map(r => r.code === 200);
            const handled = files.reduce((all, file, index) => {
                if (!fileStats[index]) {
                    all.push(file);
                } else {
                    console.info(`[INFO] Qiniu upload file ignored - ${getKey(file)}`);
                }
                return all;
            }, []);
            return resolve(handled);
        });
    });
}

function uploadSingleFile(token, key, file) {
    const size = fs.statSync(file).size;
    return new Promise(resolve => {
        const extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(token, key, file, extra, (err, ret) => {
            if (err) {
                // 用 Promise.all 来跟踪这个 promise 队列, reject 之后的所有 promise
                // 其实依然会执行，只是 catch 会立马拿到这个 err
                console.error(
                    '[FAIL] Qiniu upload file fail ' +
                    `(Response Code: ${err.code}, Msg: ${err.error}): ${key}`
                );
                const retryCount = retryCountMap.get(key) || 0;
                if (retryCount < SINGLE_RETRY_COUNT_LIMIT) {
                    const nextRetryCount = retryCount + 1;
                    retryCountMap.set(key, nextRetryCount);
                    console.info(
                        '[INFO] Qiniu upload file retry' +
                        `(${nextRetryCount}/${SINGLE_RETRY_COUNT_LIMIT}): ${key} - (${size})`
                    );
                    return uploadSingleFile(token, key, file)
                        .then(resolve);
                }
                process.exit(1);
                return Promise.reject();
            }
            const percentage = Math.ceil((++uploadedCount * 100) / totalCount);
            console.info(`[${percentage}%] Qiniu upload file success: ${key} - (${size})`);
            return resolve(ret);
        });
    });
}

function promiseUpload(localFile) {
    const key = getKey(localFile);
    const token = uptoken(QINIU_BUCKET, key);

    return uploadSingleFile(token, key, localFile);
}

function walk(parent, pathname, fileHandler) {
    const filepath = path.join(parent, pathname);
    const stats = fs.statSync(filepath);

    if (stats.isFile()) {
        fileHandler(filepath);
    } else if (stats.isDirectory()) {
        fs.readdirSync(filepath).forEach(name => {
            walk(filepath, name, fileHandler);
        });
    }
}

function uploadParallelCount(queue, parallelCount) {
    totalCount = queue.length;
    const slices = Math.floor(totalCount / parallelCount);
    const remains = queue.length % parallelCount;
    let promiseQueue = Promise.resolve();

    for (let i = 0; i < slices; i++) {
        promiseQueue = promiseQueue
            .then(() => {
                const start = parallelCount * i;

                return Promise.all(
                    queue.slice(start, start + parallelCount).map(promiseUpload)
                );
            });
    }

    return promiseQueue
        .then(() => Promise.all(queue.slice(-remains).map(promiseUpload)))
        .then(() => console.info('Qiniu upload completed'));
}

function upload(parallelCount = 10) {
    const queue = [];
    const ignorePattern = /\.gz$/;

    try {
        walk('', path.resolve(STATIC_DIR), filepath => {
            if (ignorePattern.test(filepath)) return;
            queue.push(filepath);
        });

        return deduplicateFiles(queue, QINIU_BUCKET)
            .then((handled) => uploadParallelCount(handled, parallelCount));
    } catch (err) {
        console.error('Upload to qiniu unknown exception: %o', err);
        return Promise.reject(err);
    }
}

console.log('start upload built bundles to cdn')

if (QINIU_BUCKET && STATIC_DIR && QINIU_ACCESS_KEY && QINIU_SECRET_KEY) {
    upload()
} else {
     console.warn('require cdn config to upload static files');
}