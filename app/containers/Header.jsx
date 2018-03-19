import React from 'react'

const Header = ({ handleSignout }) => (
  <div className='page-header'>
    <div className='logo'></div>
    <ul className='nav'>
      <li>
        <a href='/intro'>产品介绍</a>
      </li>
      <li>
        <a href='https://coding.net/help/doc/webide' target='_blank' rel='noopener noreferrer'>帮助</a>
      </li>
    </ul>
    {handleSignout && <ul className='nav-right'>
      <a href='javascript:void(0)' onClick={handleSignout}>退出登录</a>
    </ul>}
  </div>
)

export default Header
