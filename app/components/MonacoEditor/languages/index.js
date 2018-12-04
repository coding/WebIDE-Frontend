const customLanguages = [
  'markdown'
]

const languageConfigs = [
  'azcli', 'bat', 'c', 'cpp', 'clojure', 'coffeescript', 'csharp', 'css', 'dockerfile', 'fsharp', 'go', 'handlebars', 'html', 'ini', 'java', 'javascript', 'json', 'lua', 'mysql', 'objective-c', 'perl', 'php', 'powershell', 'pug', 'python', 'r', 'razor', 'ruby', 'rust', 'scss', 'shellscript', 'sql', 'swift', 'typescript', 'typescriptreact', 'vb', 'vue', 'xml', 'yaml'
]

function registerCustomLanguages () {
  customLanguages.forEach(async (v) => {
    const language = await import(`./${v}/${v}.contribution`)
    monaco.languages.register(language.default)

    monaco.languages.onLanguage(language.default.id, () => {
      language.default.loader()
        .then((mod) => {
          monaco.languages.setMonarchTokensProvider(language.default.id, mod.language)
          monaco.languages.setLanguageConfiguration(language.default.id, mod.conf)
        })
    })
  })

  languageConfigs.forEach(async (v) => {
    const languageConfig = await import(`./${v}.config`)
    monaco.languages.onLanguage(v, () => {
      monaco.languages.setLanguageConfiguration(v, languageConfig.default)
    })
  })
}

export default registerCustomLanguages
