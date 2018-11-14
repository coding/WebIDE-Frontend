import React, { Component } from 'react';
import { connect } from 'react-redux';

import './prePublish.css';

import ToolTip from '../../../share/toolTip';

import i18n from '../../../utils/i18n';

class PrePublish extends Component {
    state = {
        isTTOn: false,
    }

    render() {
        const { isTTOn } = this.state;
        const { hasPrePublish, preStatus } = this.props;
        return (
            <div>
                <div className="panel-sub-title">
                    {i18n('plugin.prePublish')}
                    <span className="prepublish-tooltip">
                        <i className="fa fa-question-circle" onMouseEnter={this.handleTT} onMouseLeave={this.handleTT}></i>
                        <ToolTip on={isTTOn} message={isTTOn ? i18n('plugin.prePublishTip') : ''} placement="left" />
                    </span>
                </div>
                {!hasPrePublish && (
                    <div className="prepublish-status">
                        {i18n('plugin.preStat0')}
                        <span className="click" onClick={this.popForPrePublish}>{i18n('plugin.preStat0Click')}</span>
                        {i18n('global.period')}
                    </div>
                )}
                {hasPrePublish && preStatus === 1 && (
                    <div className="prepublish-status">
                        {i18n('plugin.preStat1')}
                    </div>
                )}
                {hasPrePublish && preStatus === 2 && (
                    <div className="prepublish-status">
                        {i18n('plugin.preStat2')}
                        <span className="click" onClick={this.popForHasPrePublish}>{i18n('plugin.preStat2Click')}</span>
                        {i18n('global.period')}
                    </div>
                )}
                {hasPrePublish && preStatus === 3 && (
                    <div className="prepublish-status">
                        {i18n('plugin.preStat3')}
                        <span className="click" onClick={this.popForPrePublishBuildingFail}>{i18n('plugin.preStat3Click')}</span>
                        {i18n('global.period')}
                    </div>
                )}
            </div>
        );
    }

    handleTT = () => {
        this.setState(prevState => ({ isTTOn: !prevState.isTTOn }));
    }

    popForPrePublish = () => {
        this.props.showVersionPop({
            type: 1,
            desc: i18n('plugin.preStat0Desc'),
            action: i18n('plugin.preStat0Action'),
            method: this.handlePrePublish,
        });
    }

    popForPrePublishBuildingFail = () => {
        this.props.showVersionPop({
            type: 1,
            desc: i18n('plugin.preStat3Desc'),
            log: this.props.preLog,
            action: i18n('plugin.preStat3Action'),
            method: this.handlePrePublish,
        });
    }

    popForHasPrePublish = () => {
        this.props.showVersionPop({
            type: 1,
            desc: i18n('plugin.preStat2Desc'),
            action: i18n('plugin.preStat2Action'),
            method: this.props.cancelRelease,
        });
    }

    handlePrePublish = () => {
        const { release, hideVersionPop } = this.props;
        // 预发布与发布是同一个接口，isPreDeploy字段不同
        const option = {
            version: '',
            description: '[pre publish]',
            isPreDeploy: true,
        }
        release(option);
        hideVersionPop();
    }
}

const mapDispatch = (dispatch) => {
    return {
        showVersionPop: (payload) => dispatch({ type: 'SHOW_VERSION_POP', payload }),
        hideVersionPop: () => dispatch({ type: 'HIDE_VERSION_POP' }),
    }
}

export default connect(null, mapDispatch)(PrePublish);
