import React, { Component, PropTypes } from 'react'
import { createI18n } from '../utils'

export default class ThemeProvider extends Component {
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
    console.log(i18n`titleBar_01:=File${123}`)
    return {
      // theme: this.props.theme,
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
