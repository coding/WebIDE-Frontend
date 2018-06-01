import languages, { supportLangServer } from './languages'

function findLangueByExt (ext) {
  return languages.find(l => l.exts.some(e => e === ext))
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
      if (data.find(v => v.name === file)) {
        return langConfig.lang
      }
    }
  }
  return ''
}

export {
  findLangueByExt,
  findLanguageByFileName
}
