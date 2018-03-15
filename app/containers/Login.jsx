import React, { Component } from 'react'
import VideoCover from 'react-video-cover'
import i18n from 'utils/createI18n'
import api from '../backendAPI'
import Header from './Header'

class Login extends Component {
  constructor (props) {
    super(props)
    this.state = {
      password: '',
      email: '',
      captcha: '',
      remember_me: false
    }
  }
  componentDidMount () {
    api.hasCaptcha().then((res) => {
      console.log('res', res)
    })
  }
  handleEmailChange = (e) => {
    this.setState({
      email: e.target.value
    })
  }
  handlePwdChange = (e) => {
    this.setState({
      password: e.target.value
    })
  }
  handleRemembarChange = (e) => {
    this.setState({
      remember_me: e.target.checked
    })
  }
  handleLogin = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('handleLogin', this.state.email, this.state.password)
    api.login(this.state).then((res) => {
      console.log('login', res)
    })
  }
  render () {
    return (
      <div className='login-page'>
        <div className='login-bg'>
          <VideoCover videoOptions={{
            src: '//webide-1255989204.cos.ap-chengdu.myqcloud.com/DemoVideo/ide-login.mp4',
            autoPlay: true,
            loop: true,
            // ref: (videoRef) => {
            //   this.videoRef = videoRef
            //   this.videoRef.play()
            // }
          }}
          />
          <div className='login-bg-cover'></div>
        </div>
        <div className='login-container'>
          <div className='login-panel'>
            <div className='login-panel-input'>
              <div className='title'>用户登录</div>
              <input type='text' className='form-control' onChange={this.handleEmailChange} placeholder='用户名／手机／邮箱' value={this.state.email} />
              <input type='password' className='form-control' onChange={this.handlePwdChange} placeholder='密码' />
              <div className='checkbox'>
                <label>
                  <input type='checkbox'
                    onChange={this.handleRemembarChange}
                    checked={this.state.remember_me}
                  />
                  记住我
                </label>
              </div>
              <button className='btn btn-primary' onClick={this.handleLogin}>登录</button>
              <div className='links'>
                <a href='https://coding.net/password/forget'>找回密码</a>
                <div className='input-right'>还没有账号？<a href='https://coding.net/register'>马上注册</a></div>
              </div>
            </div>
            <div className='login-panel-tencent'>
              <a href='https://coding.net/api/oauth/qcloud/rebind?return_url=https://ide.coding.net'>
                <i className='logo-qcloud' />使用腾讯云账号登录
              </a>
            </div>
          </div>
        </div>
        <Header />
      </div>
    )
  }
}

export default Login
