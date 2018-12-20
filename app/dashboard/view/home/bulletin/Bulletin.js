import React from 'react';

import './bulletin.css';

const Bulletin = ({ close }) => {
    return (
        <div className="dash-bulletin">
            <div className="top">
                <div className="title">
                    <i className="fa fa-bullhorn"></i>
                    <span>维护通知</span>
                </div>
                <span className="close" onClick={close}>＋</span>
            </div>
            <div className="content">
                为提供更好的体验，我们将于 12 月 20 日 24:00 至 12 月 21 日 03:00 之间进行系统维护，请避免在此时间段内使用 Cloud Studio 服务。维护完毕之后，如遇见账户或使用问题，请尝试刷新和重新登录，或前往 <a href="https://feedback.coding.net/" target="blank" rel="noopener">feedback</a> 进行反馈。
            </div>
        </div>
    );
}

export default Bulletin;
