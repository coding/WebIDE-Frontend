import React, { Component } from 'react'
import i18n from 'utils/createI18n'

class Login extends Component {
  render () {
    return (
      <div className='login-container'>
        <div className='login-panel'>
          <div className='monkey splash-logo'></div>
          <div className='login-info'>
            <h1>Coding WebIDE</h1>
            <h2>Coding Anytime Anywhere</h2>
          </div>
          <button className='btn btn-default' onClick={this.handleCodingLogin} >{i18n`login.loginCoding`}</button>
        </div>
      </div>
    )
  }
  handleCodingLogin (e) {
    e.preventDefault()
    e.stopPropagation()
    // window.location.href = `/login?return_url=${window.location.href}`
  }
}

export default Login
