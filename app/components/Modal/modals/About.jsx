
import React from 'react'
import i18n from 'utils/createI18n'
import { dismissModal } from '../actions'

const Alert = (props) => {
  const { meta, content } = props
  return (
    <div className='modal-content about'>
      <div className='title'>
        <div className='logo'></div>
      </div>
      <div className='logos'>
        <div className='logo-item'>
          <div className='coding-logo'>
            <a href='https://coding.net' target='_blank' rel='noopener noreferrer' >
              <img src='https://dn-coding-net-production-pp.qbox.me/600bb772-e8ae-462c-966f-fef4637cb2bb.png' alt='Coding Logo' />
            </a>
          </div>
          <div className='info'>出品</div>
        </div>
        <div className='logo-item'>
          <div className='tencent-logo'>
            <a href='https://cloud.tencent.com/' target='_blank' rel='noopener noreferrer'>
              <img src='https://dn-coding-net-production-pp.qbox.me/ebeeacca-4e0e-4348-ab33-168eb069afcb.png' alt='Tecent Logo' />
            </a>
          </div>
          <div className='info'>提供计算支持</div>
        </div>
      </div>
      <div className='links'>
        <a href='/intro' className='link-item' target='_blank' rel='noopener noreferrer'>产品介绍</a>
        <a href='https://coding.net/help/doc/cloud-studio' className='link-item' target='_blank' rel='noopener noreferrer' >帮助文档</a>
        <a href='https://feedback.coding.net' className='link-item' target='_blank' rel='noopener noreferrer'>意见反馈</a>
      </div>
      Copyright @ 2015-2018. All Rights Reserved. 扣钉网络 版权所有
    </div>
  )
}

export default Alert
