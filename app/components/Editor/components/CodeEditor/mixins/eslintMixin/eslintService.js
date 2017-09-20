import api from 'backendAPI'
import baseNodeScript from '!raw-loader!uglify-loader?{"compress":{"booleans": false}}!./eslintServiceCommandTemplate.js'

const getCommand = (runOnFile, filePathOrText) => {
  let nodeScript = runOnFile ? baseNodeScript.replace('BOOL,PARAMS', `true, "${filePathOrText}"`)
    : baseNodeScript.replace('BOOL,PARAMS', `false, "${JSON.stringify(filePathOrText)}"`)
  return `cd /home/coding/workspace && node -e ${JSON.stringify(nodeScript)}`
}

const eslintService = {
  executeOnFile (filePath) {
    return api.execShellCommand(getCommand(true, filePath)).then(data => data.stdout)
  },

  executeOnText (text) {
    return api.execShellCommand(getCommand(false, text)).then(data => data.stdout)
  },
}

export default eslintService
