import React, { PropTypes } from 'react'
import settings from 'settings'
import { inject } from 'mobx-react'
import * as languageDicPool from '../i18n'

const separator = ':='
// const transferredMeaning = '\\'

const getMappedDic = () => {
  const result = {}
  Object.keys(languageDicPool).forEach((lan) => {
    const tmp = languageDicPool[lan]
    Object.keys(tmp).forEach((key) => {
      if (!result[key]) result[key] = {}
      if (lan === 'en_US') result[key].template = tmp[key]
      result[key][lan] = tmp[key]
    })
  })
  return result
}

const translate = (origin = '', language) => {
  const dic = getMappedDic()
  const key = origin.split(separator)[0]
  if (!origin || !dic[key]) {
    return origin
  }
  return dic[key][language] || ''
}

const mapStateToProps = (state) => {
  const languageToCode = {
    English: 'en_US',
    Chinese: 'zh_CN'
  }
  const languageSetting = settings.general.language
  const language = languageToCode[languageSetting.value]
  return ({ language })
}

export default (template = [], ...values) => {
  const translateComponent = ({ language }) => {
    const translatedWords = template.reduce((p, v, i) => `${p}${p ? values[i - 1] : ''}${translate(v, language)}`, '')
    return (<span>{translatedWords}</span>)
  }
  translateComponent.propTypes = {
    language: PropTypes.string
  }
  return React.createElement(inject(mapStateToProps)(translateComponent))
}
