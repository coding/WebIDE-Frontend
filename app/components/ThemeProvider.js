import { Component, PropTypes } from 'react'
import { createI18n } from '../utils'
import { connect } from 'react-redux'

const codeTranslate = (language) => {
  const dic = {
    English: 'en_US',
    Chinese: 'zh_CN'
  }
  if (dic[language]) return dic[language]
  if (Object.keys(dic).map(e => dic[e]).includes(language)) return language
  return 'en_US'
}

class ThemeProvider extends Component {
  static propTypes = {
    children: PropTypes.node,
    // theme: PropTypes.object,
    language: PropTypes.string,
  };

  static childContextTypes = {
    i18n: PropTypes.func
  };

  getChildContext () {
    const i18n = createI18n(codeTranslate[this.props.language])
    return {
      i18n
    }
  }

  render () {
    // const { theme, language } = this.props;
    return (
      this.props.children
    )
  }
}

const mapStateToProps = (state) => {
  const languageSettings = state.SettingState.data.tabs.GENERAL.items;
  const languageSetting = languageSettings.find(e => e.name === 'Language');
  return ({ language: languageSetting.value })
}
export default connect(mapStateToProps, null)(ThemeProvider)

