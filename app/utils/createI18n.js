import React, { PropTypes } from 'react'
import settings from 'settings'
import _ from 'lodash'
import { inject } from 'mobx-react'
import languageDicPool from '../i18n'

const separator = ':='
// const transferredMeaning = '\\'
const languageToCode = {
  English: 'en_US',
  Chinese: 'zh_CN'
}

// support shape
// name: i18n`menuBarItems.file.main:=file${{ file: 1 }}`

const replaceVariable = (translated, variables, formatFunc) => {
  return translated.replace(/{(.+?)}/g, (variable) => {
    const transfer = variables[variable.slice(1, -1)]
    if (transfer) {
      return formatFunc ? formatFunc(transfer) : transfer
    }
    return variable.slice(1, -1)
  })
}

const translate = (origin = '', language, variableObj) => {
  const dic = languageDicPool[language]
  const key = origin.split(separator)[0]
  if (!origin) {
    return origin
  }
  // console.log('dic', dic, origin, _.get(dic, key))
  if (!_.get(dic, key)) {
    return origin.split(separator)[1] || origin
  }
  return replaceVariable(_.get(dic, key) || '', variableObj)
}

const mapStateToProps = () => {
  const languageSetting = settings.general.language
  const language = languageToCode[languageSetting.value]
  return ({ language })
}


const createI18n = (template = [], ...values) => {
  const translateComponent = ({ language }) => {
    const translatedWords = template.reduce((p, v, i) => `${p}${translate(v, language, values[i] || {})}`, '')
    return (<span>{translatedWords}</span>)
  }
  translateComponent.propTypes = {
    language: PropTypes.string
  }
  return React.createElement(inject(mapStateToProps)(translateComponent))
}


createI18n.get = (key, value) => {
  const language = languageToCode[settings.general.language.value]
  return translate(key, language, value)
}

export default createI18n

