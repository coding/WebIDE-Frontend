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
const mapStateToProps = () => {
  const languageSetting = settings.general.language
  const language = languageToCode[languageSetting.value]
  return ({ language })
}

export class CreateI18n {
  constructor ({ customLanguagePool = null }) {
    this.languageDicPool = customLanguagePool || languageDicPool
    this.i18nComponent = this.i18nComponent.bind(this)
    this.translate = this.translate.bind(this)
    this.replaceVariable = this.replaceVariable.bind(this)
    this.getCache = this.getCache.bind(this)
  }
  translate (origin = '', language, variableObj) {
    const dic = this.languageDicPool[language]
    const key = origin.split(separator)[0]
    if (!origin) {
      return origin
    }
    // 当字典里找不到先看是否是开发模式下的:=，如果是就先暂时显示它，不是则原样返回
    if (!_.get(dic, key)) {
      return origin.split(separator)[1] || origin
    }
    return this.replaceVariable(_.get(dic, key) || '', variableObj)
  }
  replaceVariable (translated, variables, formatFunc) {
    return translated.replace(/{(.+?)}/g, (variable) => {
      const transfer = variables[variable.slice(1, -1)]
      if (transfer) {
        return formatFunc ? formatFunc(transfer) : transfer
      }
      return variable.slice(1, -1)
    })
  }
  i18nComponent (template = [], ...values) {
    const translateComponent = ({ language }) => {
      const translatedWords =
      template.reduce((p, v, i) => `${p}${this.translate(v, language, values[i] || {})}`, '')
      return (<span>{translatedWords}</span>)
    }
    translateComponent.propTypes = {
      language: PropTypes.string
    }
    return React.createElement(inject(mapStateToProps)(translateComponent))
  }
  getCache (key, value) {
    const language = languageToCode[settings.general.language.value]
    return this.translate(key, language, value)
  }
  get language () {
    return mapStateToProps().language
  }
}


const defaultInstance = new CreateI18n({})
const i18n = defaultInstance.i18nComponent
i18n.get = defaultInstance.getCache
export default i18n
