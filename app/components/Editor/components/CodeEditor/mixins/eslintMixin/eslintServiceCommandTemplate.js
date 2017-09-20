console.log(JSON.stringify((function (runOnFile, filePathOrText) {
  function not (boolean) { return Boolean(boolean) === false }
  try {
    var NO_MODULE_ERROR = { error: true, type: 'NO_MODULE', name: 'eslint' };
    var NO_FILE_ERROR = { error: true, type: 'NO_FILE' };
    var UNKNOWN_ERROR = { error: true, type: 'UNKNOWN' };

    var eslint = require('eslint');
    var engine = new eslint.CLIEngine({ useEslintrc: true, cacheFile: '.eslintcache', ignore: true, allowInlineConfig: true });
    var report = runOnFile ? engine.executeOnFiles(['./' + filePathOrText]) : engine.executeOnText(filePathOrText);
    var singleFileResult = report.results[0];
    if (not(singleFileResult)) return NO_FILE_ERROR;
    delete singleFileResult.source;
    singleFileResult.messages.forEach(function (message) {
      delete message.source;
      delete message.fix;
      delete message.nodeType;
    });
    return singleFileResult;

  } catch (err) {
    var errorMessage = String(err);
    var noModuleKeyword = 'Cannot find module ';
    if (errorMessage.indexOf(noModuleKeyword) > -1) {
      NO_MODULE_ERROR.message = errorMessage;
      return NO_MODULE_ERROR;
    } else {
      UNKNOWN_ERROR.message = errorMessage;
      return UNKNOWN_ERROR
    }
  }
})(BOOL,PARAMS)));
