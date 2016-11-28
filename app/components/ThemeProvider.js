import { Component, PropTypes } from 'react'
import { createI18n } from '../utils'
import { connect } from 'react-redux'

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
    const i18n = createI18n(this.props.language)
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
  const languageToCode = {
    English: 'en_US',
    Chinese: 'zh_CN'
  }
  const languageSettings = state.SettingState.data.tabs.GENERAL.items;
  const languageSetting = languageSettings.find(e => e.name === 'Language');
  const language = languageToCode[languageSetting.value]
  console.log('languageSetting', language)
  return ({ language })
}
export default connect(mapStateToProps, null)(ThemeProvider)

