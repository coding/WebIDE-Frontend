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
 * @param  {Objec} Tencent Cloud COS instance
 * @param  {Array} current file path
 * @param  {String} CommitId of newest version
 * @return {Promise} Result of uploading
 */
const putObject = (cos, file, commitId) => new Promise((resolve, reject) => {
  cos.putObject({
    Bucket: TENCENT_COS_BUCKET,
    Region: TENCENT_COS_REGION,
    Key: file.replace(STATIC_DIR, commitId),
    Body: fs.createReadStream(file),
    ContentLength: fs.statSync(file).size
  }, (error, data) => {
    if (error) {
      reject(error)
    } else {
      resolve(data)
    }
  })
})


/**
 * Main function to upload
 */
const upload = () => {
  console.log('Start uploading to Tencent Cloud COS...\n')

  const files = walk(STATIC_DIR)
  const total = files.length

  const cos = new COS({
    SecretId: TENCENT_COS_SECRETID,
    SecretKey: TENCENT_COS_SECRETKEY,
  })

  getCommitId(true)
    .then((commitId) => {
      Promise.all(files.map((file, index) => putObject(cos, file, commitId)
        .then(() => {
          console.log(`${index + 1}/${total}, uploading ${file}...`)
        }, (err) => {
          const tip = err.error.Code
            ? `Upload [${file}] Error, ${err.error.Code}: ${err.error.Message}`
            : 'Some error has occurred, please check code or network.'

          console.error(tip)
        })))
        .then(() => {
          console.log('\nComplete uploading to Tencent Cloud COS.')
        })
    }, (error) => {
      console.error(`Get commitid error: ${error}`)
    })
}

if (STATIC_DIR && TENCENT_COS_BUCKET && TENCENT_COS_REGION
 && TENCENT_COS_SECRETID && TENCENT_COS_SECRETKEY) {
  // Start to upload
  upload()
} else {
  console.warn('Require cdn config to upload static files.')
}
