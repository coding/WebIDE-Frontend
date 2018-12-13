import React, { Component } from 'react'
import { autorun } from 'mobx';
import VideoCover from 'react-video-cover'
// import i18n from 'utils/createI18n'
import api from '../backendAPI'
import Header from './Header'
import cx from 'classnames'
import config from 'config'

const searchUrl = window.location.search.slice(1);

class Login extends Component {
  constructor (props) {
    super(props)
    this.timer = null;
    this.state = {
      password: '',
      account: '',
      captcha: '',
      remember_me: false,
      code: '',
      mode: 'login',
      accountError: false,
      pwdError: false,
      captchaError: false,
      captchaUrl: '',
      codeError: false,
      errHint: '',
      popUp: false,
    }
  }
  componentDidMount () {
    this.checkCaptcha();
    autorun(() => {
      if (config.globalKey) {
        this.handleUrl();
      }
    });
  }
  handleUrl() {
    if (searchUrl.indexOf('hasJump') !== -1) {
      return;
    }
    if (searchUrl.startsWith('return_url')) {
      const suffix = searchUrl.slice(11);
      const url = suffix.indexOf('&') === -1 ? `${suffix}?hasJump=true` : `${suffix.replace('&', '?')}&hasJump=true`;
      window.open(url, '_self');
    } else {
      const url = searchUrl ? `${window.location.origin}/dashboard?${searchUrl}&hasJump=true` : `${window.location.origin}/dashboard?hasJump=true`;
      window.open(url, '_self');
    }
  }
  checkCaptcha = () => {
    api.hasCaptcha().then((res) => {
      if (res.code === 0) {
        if (res.showCaptcha) {
          this.setState({
            captchaUrl: `${config.baseURL}/captcha?${new Date().getMilliseconds()}`
          })
        } else {
          this.setState({
            captchaUrl: ''
          })
        }
      }
    })
  }
  handleCaptchaChange = (e) => {
    this.setState({
      captcha: e.target.value,
      captchaError: false,
    })
  }
  handleAccountChange = (e) => {
    this.setState({
      account: e.target.value,
      accountError: false,
    })
  }
  handlePwdChange = (e) => {
    this.setState({
      password: e.target.value,
      pwdError: false,
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
    api.login({
      password: this.state.password,
      email: this.state.account,
      captcha: this.state.captcha,
      remember_me: this.state.remember_me,
    }).then((res) => {
      if (res.code === 3205) {
        this.setState({
          mode: 'code'
        })
      } else if (res.code === 0) {
        console.log('Login Succeed.')
      } else {
        if (/\（(.+)\）/.test(res.msg)) {
          this.setState({
            errHint: res.msg,
            accountError: true,
          });
        } else if (res.msg === '你输入的图片验证码有误') {
          this.setState({
            errHint: res.msg,
            captchaError: true,
          });
        } else {
          this.setState({
            errHint: res.msg,
            pwdError: true,
          });
        }
        this.popUp();
        this.checkCaptcha();
      }
    })
  }
  handleCodeChange = (e) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({
      code: e.target.value,
      codeError: false,
    })
  }
  handleCode = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (this.state.code) {
      api.loginCode({ code: this.state.code }).then((res) => {
        if (res.code) {
          this.setState({
            errHint: '两步验证码错误',
            codeError: true,
          });
          this.popUp();
        }
      })
    } else {
      this.setState({
        errHint: '请输入两步验证码',
        codeError: true,
      });
      this.popUp();
    }
  }
  popUp() {
    this.setState({
      popUp: true
    });
    this.timer = setTimeout(() => {
      this.setState({popUp: false});
    }, 3000);
  }
  componentWillUnmount() {
    clearTimeout(this.timer);
  }
  render () {
    let loginForm = null
    let tencentLogin = null
    if (self != top) {
      tencentLogin = (
        <a href='https://cloud.tencent.com/open/authorize?scope=login&app_id=100000788006&redirect_url=https%3A%2F%2Fcoding.net%2Fapi%2Foauth%2Fqcloud%2Fstudio_login' target='_top' >
          <i className='logo-qcloud' />使用腾讯云账号登录
        </a>
      )
    } else {
      tencentLogin = (
        <a href='https://coding.net/api/oauth/qcloud/rebind?return_url=https://studio.coding.net'>
          <i className='logo-qcloud' />使用腾讯云账号登录
        </a>
      )
    }
    if (this.state.mode === 'login') {
      loginForm = (
        <div className='login-panel'>
          <form>
            <div className='login-panel-input'>
              <div className='title'>CODING 账号登录</div>
              <div className='login-panel-line'>
                <input type='text' autoComplete='username' autoFocus className={cx('form-control', { error: this.state.accountError})} onChange={this.handleAccountChange} placeholder='用户名／手机／邮箱' />
              </div>
              <div className='login-panel-line'>
                <input type='password' autoComplete='current-password' className={cx('form-control', { error: this.state.pwdError })} onChange={this.handlePwdChange} placeholder='密码' />
              </div>
              { this.state.captchaUrl && <div className='login-panel-line'>
                <input type='text' className={cx('form-control', { error: this.state.captchaError })} onChange={this.handleCaptchaChange} placeholder='验证码' />
                <img className='captchaPic' src={this.state.captchaUrl} onClick={this.checkCaptcha} />
              </div> }
              <div className='checkbox'>
                <label>
                  <input type='checkbox' onChange={this.handleRemembarChange} checked={this.state.remember_me} />
                  记住我
                </label>
              </div>
              <button className='btn btn-primary' type='submit' onClick={this.handleLogin}>登录</button>
              <div className='links'>
                <a href='https://coding.net/password/forget'>找回密码</a>
                <div className='input-right'>还没有账号？<a href='https://coding.net/register'>马上注册</a></div>
              </div>
            </div>
            <div className='login-panel-tencent'>
              {tencentLogin}
            </div>
          </form>
        </div>
      )
    } else if (this.state.mode === 'code') {
      loginForm = (
        <div className='login-panel'>
          <form>
            <div className='login-panel-input'>
              <div className='title'>两步验证</div>
              <input type='text' autoFocus className={cx('form-control', { error: this.state.codeError })} onChange={this.handleCodeChange} placeholder='两步验证码' />

              <button className='btn btn-primary' type='submit' onClick={this.handleCode}>登录</button>
              <div className='links'>
                <a href='https://coding.net/twofa/close'>关闭两步验证</a>
                <div className='input-right'><a href='https://coding.net/help/doc/account/2fa.html'>两步验证遇到问题？</a></div>
              </div>
            </div>
            <div className='login-panel-tencent'>
              {tencentLogin}
            </div>
          </form>
        </div>
      )
    }
    return (
      <div className='login-page'>
        <div className='login-bg'>
          <VideoCover videoOptions={{
            src: '//cs-res.codehub.cn/DemoVideo/ide-login.mp4',
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
          {loginForm}
        </div>
        <Header />
        <div className={cx('login-pop', { active: this.state.popUp})}>{this.state.errHint}</div>
      </div>
    )
  }
}

export default Login;
