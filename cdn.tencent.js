/* eslint no-console: 0 */
require('dotenv').config()
const fs = require('fs')
const COS = require('cos-nodejs-sdk-v5')
const path = require('path')
const { exec } = require('child_process')

const {
  STATIC_DIR,
  TENCENT_COS_REGION,
  TENCENT_COS_BUCKET,
  TENCENT_COS_SECRETID,
  TENCENT_COS_SECRETKEY
} = process.env

/**
 * @param  {Bool} Use short commitid or not
 * @return {Promise} Output of terminal
 */
const getCommitId = (useShortId) => {
  const shell = `git rev-parse ${useShortId ? '--short' : ''} HEAD`
  return new Promise((resolve, reject) => {
    exec(shell, (error, stdout, stderr) => {
      if (error || stderr) {
        //
        reject(error)
        return
      }

      resolve(stdout.replace('\n', ''))
    })
  })
}

/**
 * @param  {String} The path for traversing
 * @return {Array} Array of children files
 */
const walk = (dir) => {
  const files = []

  const readDir = (innerDir) => {
    const pa = fs.readdirSync(innerDir)
    pa.forEach((file) => {
      const filePath = path.join(innerDir, file)
      const info = fs.statSync(filePath)

      if (info.isDirectory()) {
        readDir(filePath)
      } else {
        files.push(filePath)
      }
    })
  }

  readDir(dir)
  return files
}

/**
 * Slice files arrays to smallers
 * @param  {Array} initial files array
 * @param  {Number} sliceCount
 * @return {Array} sliced files array
 */
const sliceFiles = (arr, sliceCount = 20) => {
  const files = []
  for (let i = 0; i < arr.length; i += sliceCount) {
    files.push(arr.slice(i, i + sliceCount))
  }

  return files
}

/**
 * Main function to upload
 */
const upload = (files) => {
  const total = files.length
  const errList = []
  let index = 0

  const cos = new COS({
    SecretId: TENCENT_COS_SECRETID,
    SecretKey: TENCENT_COS_SECRETKEY,
    FileParallelLimit: 20,
    ChunkParallelLimit: 10,
    ChunkSize: 1024 * 1024 * 1024,
  })

  getCommitId(true)
    .then((commitId) => {
      // sliceFiles(files).map((arr) => {
      const filesArr = files.map(item => ({
        Key: item.replace(STATIC_DIR, commitId),
        Bucket: TENCENT_COS_BUCKET,
        Region: TENCENT_COS_REGION,
        FilePath: item
      }))

      cos.uploadFiles({
        files: filesArr,
        SliceSize: 1024 * 1024 * 10,
        onProgress: (info) => {
          const percent = parseInt(info.percent * 10000, 10) / 100
          const speed = parseInt(info.speed / 1024 / 1024 * 100, 10) / 100
          console.log('进度：' + percent + '%; 速度：' + speed + 'Mb/s;')
        },
        onFileFinish (err, data, options) {
          index++
          console.log(
            `${index}/${total}, ${options.FilePath} upload ${err ? 'failed' : 'completed'}`
          )

          if (err) {
            errList.push(options.FilePath)
          }

          if (index === total) {
            if (errList.length) {
              console.log('\n\x1b[31m[ERROR] Failed to upload some files.\x1b[0m\n')
              console.log('[INFO] Retry to upload...\n')

              upload(errList)
            } else {
              console.log('\n\x1b[32m[INFO] Complete uploading to Tencent Cloud COS.\x1b[0m\n')
              console.timeEnd('timer')
            }
          }
        },
      }, (err) => {
        if (err) {
          throw new Error(err)
        }
      })

      return cos
      // })
    })
}

if (STATIC_DIR && TENCENT_COS_BUCKET && TENCENT_COS_REGION
 && TENCENT_COS_SECRETID && TENCENT_COS_SECRETKEY) {
  // Start to upload
  console.time('timer')
  const files = walk(STATIC_DIR)
  console.log('[INFO] Start uploading to Tencent Cloud COS...\n')
  upload(files)
} else {
  console.warn('Require cdn config to upload static files.')
}
