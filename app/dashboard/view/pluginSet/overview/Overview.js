import React, { Component } from 'react';
import { connect } from 'react-redux';

import './overview.css';

import Star from '../../../share/star';

import i18n from '../../../utils/i18n';
import kilo from '../../../utils/kilo';
import config from '../../../utils/config';

class Overview extends Component {
    render() {
        const { pluginId, pluginName, remark, version, pluginType, avgScore, countScoreUser, createdBy, repoName, repoUrl, globalStatus } = this.props;
        const { status, auditRemark, hasPrePublish, preStatus } = this.props;
        const { cancelRelease } = this.props;
        const repoHref = `${config.devOrigin}/u/${createdBy}/p/${repoUrl.split('/').pop().split('.').join('/')}`;
        const marketHref = window === window.top ? `${window.location.origin}/plugins/detail/${pluginId}` : `${config.studioOrigin}/plugins/detail/${pluginId}`;
        const wsHref = `${window === window.top ? window.location.origin : config.studioOrigin}/ws/?ownerName=${createdBy}&projectName=${repoName}`;
        return (
            <div className="overview">
                <div className="top">
                    <div className="name">
                        <div>{pluginName}</div>
                        <div className="tag">{i18n('plugin.disabled')}</div>
                    </div>
                    <div>
                        <a className="goto" href={repoHref} target="_blank" rel="noopener noreferrer">{i18n('plugin.codeRepo')}</a>
                        <a className="goto" href={wsHref} target="_blank" rel="noopener noreferrer">{i18n('global.workspace')}</a>
                    </div>
                </div>
                <div className="desc">{remark}</div>
                <div className="info">
                    <div className="item">
                        <span className="key">{i18n('plugin.currentRelease')}:</span>
                        <span>{version ? `v${version}` : 'null'}</span>
                    </div>
                    <div className="item">
                        <span className="key">{i18n('global.category')}:</span>
                        <span>{pluginType}</span>
                    </div>
                    <div className="item">
                        <Star score={avgScore} />
                        <span className="rate-user-count">({kilo(countScoreUser)} {i18n('plugin.userCount')})</span>
                    </div>
                </div>
                {globalStatus === 1 ? (
                    <div className="status">
                        {i18n(`plugin.status${status}`, { version, reason: auditRemark })}
                        {status === 5 && (
                            <span>
                                <a href={marketHref} target="_blank" rel="noopener noreferrer">{i18n('plugin.status5Click')}</a>
                                {i18n('plugin.status5After')}
                            </span>
                        )}
                        {status === 4 && (
                            <span>
                                <span className="click" onClick={this.popForBuildingFail}>{i18n('plugin.status4Click')}</span>
                                {i18n('global.period')}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="status disabled">
                        <i className="fa fa-exclamation-triangle"></i>
                        {i18n('plugin.pluginDisabledStatus')}
                    </div>
                )}
                {hasPrePublish && preStatus === 2 && (
                    <div className="pre">
                        <i className="fa fa-exclamation-circle"></i>
                        {i18n('plugin.nowPrePublish')}
                        <span className="click" onClick={cancelRelease}>{i18n('plugin.cancelPrePublish')}</span>
                        {i18n('global.period')}
                    </div>
                )}
            </div>
        );
    }

    popForBuildingFail = () => {
        this.props.showVersionPop({
            type: 2,
            desc: i18n('plugin.status4Desc', { version: this.props.version }),
            log: this.props.log,
        });
    }
}

const mapDispatch = (dispatch) => {
    return {
        showVersionPop: (payload) => dispatch({ type: 'SHOW_VERSION_POP', payload }),
    }
}

export default connect(null, mapDispatch)(Overview);
