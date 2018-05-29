import languages from './languages'

function findLangueByExt (ext) {
  return languages.find(l => l.exts.some(e => e === ext))
}

export {
  findLangueByExt
}
