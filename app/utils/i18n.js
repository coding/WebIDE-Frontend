const separator = ':='
// const transferredMeaning = '\\'

const dic = {
  test_01: {
    template: 'good morning',
    ch_ZN: '你好',
    en: ''
  },
  test_02: {
    template: 'good morning',
    ch_ZN: '你好哦',
    en: ''
  }
}

const language = 'ch_ZN' || 'en'


// 'hide ok|this is a test'  first is template and second is template
// use case

const translate = (origin = '') => {
  const key = origin.split(separator)[0]
  if (!origin || !dic[key]) {
    return origin
  }
  return dic[key][language] || ''
}

export default (template = [], ...values) => {
  return template.reduce((p, v, i) => `${p}${p ? values[i - 1] : ''}${translate(v)}`, '')
}
