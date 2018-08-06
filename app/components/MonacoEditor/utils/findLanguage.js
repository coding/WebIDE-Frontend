import languages, { supportLangServer } from './languages'
import modeInfos from './modeInfos'

function findLangueByExt (ext) {
  return languages.find(l => l.exts.some(e => e === ext))
}

function findLanguageByextensions (ext) {
  let currentExt = ext
  if (!currentExt.startsWith('.')) currentExt = `.${currentExt}`
  for (let i = 0; i < modeInfos.length; i++) {
    const info = modeInfos[i]
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
      if (data.find(v => v.name === file)) {
        return langConfig.lang
      }
    }
  }
  return ''
}


function findModeByName (name) {
  name = name.toLowerCase()
  for (let i = 0; i < modeInfos.length; i++) {
    const info = modeInfos[i]
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
  findModeByName
}
