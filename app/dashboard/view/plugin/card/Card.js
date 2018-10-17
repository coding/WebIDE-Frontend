import React, { Component } from 'react';

import './card.css';

import Star from '../../../share/star';
import i18n from '../../../utils/i18n';

class Card extends Component {
    render() {
        const { pluginName, currentVersion, remark, avgScore, countScoreUser, src, createdBy } = this.props;
        return (
            <div className="plugin-card">
                <div className="top">
                    <div className="name">{pluginName}</div>
                    <div className="version">V {currentVersion}</div>
                </div>
                <div className="desc">{remark}</div>
                <div className="score">
                    <Star score={avgScore} />
                    <span className="score-count">{avgScore}</span>
                    <span className="user-count">{countScoreUser} 人评分</span>
                </div>
                <div className="low">
                    <div className="author">
                        <img src={src} />
                        <span>{createdBy}</span>
                    </div>
                    <div className="control">
                        <button>{i18n('global.uninstall')}</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Card;
