module.exports = {
  
  css: {
    entry: [
      'vs/language/css/monaco.contribution',
    ],
    worker: {
      id: 'vs/language/css/cssWorker',
      entry: 'vs/language/css/css.worker',
      output: 'css.worker.js',
      fallback: 'vs/language/css/cssWorker',
    },
    alias: undefined,
  },
  
  html: {
    entry: [
      'vs/language/html/monaco.contribution',
    ],
    worker: {
      id: 'vs/language/html/htmlWorker',
      entry: 'vs/language/html/html.worker',
      output: 'html.worker.js',
      fallback: 'vs/language/html/htmlWorker',
    },
    alias: undefined,
  },
  
  json: {
    entry: 'vs/language/json/monaco.contribution',
    worker: {
      id: 'vs/language/json/jsonWorker',
      entry: 'vs/language/json/json.worker',
      output: 'json.worker.js',
      fallback: 'vs/language/json/jsonWorker',
    },
    alias: undefined,
  }
};
