import React from 'react';

const year = new Date().getFullYear();

const Alert = () => {
  return (
    <div className='modal-content about'>
      <div className='title'>
        <div className='logo'></div>
        <span className='beta'>beta</span>
      </div>
      <div className='logos'>
        <div className='logo-item'>
          <div className='coding-logo'>
            <a href='https://coding.net' target='_blank' rel='noopener noreferrer' >
              <img src='https://dn-coding-net-production-pp.codehub.cn/600bb772-e8ae-462c-966f-fef4637cb2bb.png' alt='Coding Logo' />
            </a>
          </div>
          <div className='info'>出品</div>
        </div>
        <div className='logo-item'>
          <div className='tencent-logo'>
            <a href='https://cloud.tencent.com/' target='_blank' rel='noopener noreferrer'>
              <img src='https://dn-coding-net-production-pp.codehub.cn/ebeeacca-4e0e-4348-ab33-168eb069afcb.png' alt='Tecent Logo' />
            </a>
          </div>
          <div className='info'>提供计算支持</div>
        </div>
      </div>
      <div className='links'>
        <a href='/intro' className='link-item' target='_blank' rel='noopener noreferrer'>产品介绍</a>
        <a href='https://dev.tencent.com/help/doc/cloud-studio' className='link-item' target='_blank' rel='noopener noreferrer' >帮助文档</a>
        <a href='https://feedback.coding.net' className='link-item' target='_blank' rel='noopener noreferrer'>意见反馈</a>
      </div>
      <div>Copyright @ 2015-{year}. All Rights Reserved. 扣钉网络 版权所有</div>
    </div>
  )
}

export default Alert;
