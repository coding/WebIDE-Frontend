 const customLanguages = []

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
}

export default registerCustomLanguages
