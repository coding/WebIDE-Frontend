import * as languageDicPool from '../i18n'

const separator = ':='
// const transferredMeaning = '\\'

const getMappedDic = () => {
  const result = {}
  Object.keys(languageDicPool).forEach(lan => {
    const tmp = languageDicPool[lan]
    Object.keys(tmp).forEach(key => {
      if (!result[key]) result[key] = {}
      if (lan === 'en_US') result[key].template = tmp[key]
      result[key][lan] = tmp[key]
    })
  })
  return result
}


// 'hide ok|this is a test'  first is template and second is template
// use case

const translate = (origin = '', language) => {
  console.log('language12', language)
  // language = 'zh_CN'
  const dic = getMappedDic()
  const key = origin.split(separator)[0]
  if (!origin || !dic[key]) {
    return origin
  }
  return dic[key][language] || ''
}

export default (language) => {
  console.log('test', language)
  return (template = [], ...values) =>{
  console.log('lande', language)
  return template.reduce((p, v, i) => `${p}${p ? values[i - 1] : ''}${translate(v, language)}`, '')
}
}
