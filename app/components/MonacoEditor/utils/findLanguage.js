import languages, { supportLangServer } from './languages'

function findLangueByExt (ext) {
  return languages.find(l => l.exts.some(e => e === ext))
}

function findLanguageByextensions (ext) {
  let currentExt = ext
  const monacoLanguages = monaco.languages.getLanguages()
  if (!currentExt.startsWith('.')) currentExt = `.${currentExt}`
  for (let i = 0; i < monacoLanguages.length; i++) {
    const info = monacoLanguages[i]
    if (info.extensions) {
      for (let j = 0; j < info.extensions.length; j++) {
        if (info.extensions[j] === currentExt) return info
      }
    }
  }
  return { id: 'plaintext' }
}
/**
 * 根据文件列表粗略判断当前项目语言，以启动相应的语言服务器
 * @param data 指定目录下文件列表
 */
function findLanguageByFileName (data) {
  for (let i = 0; i < supportLangServer.length; i += 1) {
    const langConfig = supportLangServer[i]
    for (let j = 0; j < langConfig.files.length; j += 1) {
      const file = langConfig.files[j]
      const sourceFile = data.find(v => v.name === file)
      if (sourceFile) {
        return langConfig.lang
      }
    }
  }
  return ''
}

/**
 * 识别文件列表中可能存在的所有语言特征文件(pom.xml,package.json)
 */
function findLanguagesByFileList (files) {
  return files.reduce((pre, cur) => {
    for (let i = 0; i < supportLangServer.length; i += 1) {
      const langConfig = supportLangServer[i]
      const { name } = cur
      if (langConfig.files.includes(name)) {
        pre.push(langConfig.lang)
      }
    }
    return pre
  }, [])
}

function findModeByName (name) {
  name = name.toLowerCase()
  const monacoLanguages = monaco.languages.getLanguages()
  for (let i = 0; i < monacoLanguages.length; i++) {
    const info = monacoLanguages[i]
    if (info.id.toLowerCase() === name) return info
    if (info.aliases) {
      for (let j = 0; j < info.aliases.length; j++) {
        if (info.aliases[j].toLowerCase() === name) return info
      }
    }
  }
  return null
}

export {
  findLangueByExt,
  findLanguageByFileName,
  findLanguageByextensions,
  findModeByName,
  findLanguagesByFileList,
}
