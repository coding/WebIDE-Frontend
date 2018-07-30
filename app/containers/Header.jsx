import React, { Component } from 'react'
import config from 'config'
import api from '../backendAPI'
import cx from 'classnames'

class User extends Component {
  constructor (props) {
    super(props)
    this.state = {
      open: false,
    }
  }
  componentDidMount () {
    api.getUserProfile().then((res) => {
      const data = res.data
      if (data) {
        config.globalKey = data.global_key
        if (!/^(http|https):\/\/[^ "]+$/.test(data.avatar)) {
          data.avatar = `https://coding.net${data.avatar}`
        }
        config.userProfile = data
        this.setState({
          userProfile: data
        })
      }
    })

    // window.document.addEventListener('mousedown', e => {
      // const that = this
      // this.blurTimeout = setTimeout(() => that.handleBlur(), 100)
      // return true
    // })
  }

  componentWillUnmount () {
    // window.document.removeEventListener('mousedown', this.handleBlur)
  }
  // handleLogout = () => {

  // }

  handleToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // if (this.blurTimeout) {
      // clearTimeout(this.blurTimeout)
    // }
    this.setState({
      open: !this.state.open
    })
  }
  handleBlur = () => {
    this.setState({
      open: false
    })
  }
  render () {
    if (this.state.userProfile) {
      const { userProfile, open } = this.state
      return (
        <div className="user">
          <div className="user-info">
            <a href="https://coding.net/user/account" target='_blank' rel="noopener noreferrer" >
              <img src={userProfile.avatar} alt={userProfile.name} className="avatar" />
            </a>
            <div className={cx('dropdown', { open })}>
              <button className="btn btn-default dropdown-toggle" id='dropdownMenu1' data-toggle='dropdown'
                aria-haspopup='true' aria-expanded='true' type='button' onClick={this.handleToggle} >
                { userProfile.name }
                <span className="caret"></span>
              </button>
              <ul className='dropdown-menu' aria-labelledby='aria-labelledby'>
                <li>
                  <a href="https://coding.net" target='_blank' rel="noopener noreferrer" >Coding.net</a>
                </li>
                <li>
                  <a href="javascript:void(0)" onClick={(e) => {
                    e.preventDefault()
                    api.signout()
                  }}>Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
    return <div></div>
  }
}

// const User = ({ handleSignout, userProfile }) => {
//   console.log('config', config)
//   if (handleSignout && userProfile) {
//     return (
//       <div className="user">
//         <div className="user-info">
//           <a href="https://coding.net/user/account">
//             <img src={userProfile.avatar} alt={userProfile.name} />
//           </a>
//           <div className="dropdown">

//           </div>
//         </div>
//       </div>
//       // <ul className='nav-right'>
//       //   <a href='javascript:void(0)' onClick={handleSignout}>退出登录</a>
//       // </ul>
//     )
//   }
//   return (
//     <div></div>
//   )
// }

const Header = ({ handleSignout, userProfile }) => (
  <div className='page-header'>
    <a href='/' className='logo'>Cloud Studio</a>
    <ul className='nav'>
      <li>
        <a href='/intro'>产品介绍</a>
      </li>
      <li>
        <a href='https://coding.net/help/doc/cloud-studio' target='_blank' rel='noopener noreferrer'>帮助</a>
      </li>
      {/* <li>
        <a href='/changelog'>更新日志</a>
      </li> */}
    </ul>
    <User />
  </div>
)

export default Header
