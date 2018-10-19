import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './card.css';

import i18n from '../../../utils/i18n';

class Card extends Component {
    render() {
        const { pluginName, remark, src, createdBy, belong } = this.props;
        return (
            <div className="plugin-card">
                <div className="top">
                    <Link className="name" to="/">{pluginName}</Link>
                    <div className="author">
                        <img src={src} />
                        <span>{createdBy}</span>
                    </div>
                </div>
                <div className="desc">{remark}</div>
                {belong === 1 && (
                    <div className="control">
                        <button className="button">{i18n('global.uninstall')}</button>
                    </div>
                )}
                {belong === 3 && (
                    <div className="control">
                        <Link className="button" to="/dashboard/plugin/developedbyme/config">{i18n('global.setting')}</Link>
                        <button className="button">{i18n('global.workspace')}</button>
                    </div>
                )}
            </div>
        );
    }
}

export default Card;
