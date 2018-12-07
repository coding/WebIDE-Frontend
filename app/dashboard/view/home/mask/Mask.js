import React from 'react';

import './mask.css';
import img from '../../../static/globalkey.png';

const Mask = () => {
    return (
        <div className="dash-globalmask">
            <div className="panel">
                <div className="title">请先设置用户名</div>
                <div className="line">1. 前往「个人设置」页面，找到用户名 (不是用户昵称) ，修改并保存。</div>
                <img src={img} alt="" />
                <div className="line">2. 返回并刷新该页面。</div>
                <div className="control">
                    <a href="https://dev.tencent.com/user/account" target="_blank" rel="noopener noreferrer">
                        <button className="com-button primary">前往设置用户名</button>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Mask;
