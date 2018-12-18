import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import './setting.css';

import Inbox from '../../../share/inbox';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

class Setting extends Component {
    state = {
        pluginName: this.props.pluginName,
        remark: this.props.remark,
        deleteWs: true,
    }

    render() {
        const { pluginName, remark, deleteWs } = this.state;
        const { globalStatus } = this.props;
        const disabled = !pluginName || !remark || remark.length > 255;
        if (globalStatus === 1) {
            return (
                <div className="panel">
                    <div className="panel-sub-title">{i18n('plugin.basicSet')}</div>
                    <div className="com-board">
                        <div className="board-label">{i18n('plugin.pluginName')}*</div>
                        <div className="board-content">
                            <Inbox holder="plugin.inputPluginName" value={pluginName} onChange={this.handlePluginName} />
                        </div>
                    </div>
                    <div className="com-board">
                        <div className="board-label">{i18n('global.desc')}*</div>
                        <div className="board-content">
                            <Inbox type="textarea" holder="plugin.inputPluginDesc" value={remark} onChange={this.handleRemark} />
                        </div>
                    </div>
                    <div className="com-board">
                        <div className="board-label none"></div>
                        <div className="board-content">
                            <button className="com-button primary" disabled={disabled} onClick={this.handleModify}>{i18n('global.save')}</button>
                        </div>
                    </div>
                    <div className="panel-sub-title">{i18n('plugin.otherSet')}</div>
                    <div className="com-board">
                        <div className="board-label">{i18n('plugin.deletePlugin')}</div>
                        <div className="board-content checkbox">
                            <i className={`fa ${deleteWs ? 'fa-check-square' : 'fa-square'}`} onClick={this.handleCheckbox}></i>
                            {i18n('plugin.alsoDeleteWorkspace')}
                        </div>
                    </div>
                    <div className="com-board">
                        <div className="board-label none"></div>
                        <div className="board-content">
                            <button className="com-button warn" onClick={this.handleMask}>{i18n('global.delete')}</button>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="panel">
                    <div className="com-board">
                        <div className="board-label">{i18n('plugin.deletePlugin')}</div>
                        <div className="board-content checkbox">
                            <i className={`fa ${deleteWs ? 'fa-check-square' : 'fa-square'}`} onClick={this.handleCheckbox}></i>
                            {i18n('plugin.alsoDeleteWorkspace')}
                        </div>
                    </div>
                    <div className="com-board">
                        <div className="board-label none"></div>
                        <div className="board-content">
                            <button className="com-button warn" onClick={this.handleMask}>{i18n('global.delete')}</button>
                        </div>
                    </div>
                </div>
            );
        }
    }

    handlePluginName = (event) => {
        this.setState({ pluginName: event.target.value });
    }

    handleRemark = (event) => {
        this.setState({ remark: event.target.value });
    }

    handleCheckbox = () => {
        this.setState(prevState => ({ deleteWs: !prevState.deleteWs }));
    }

    handleModify = () => {
        const { pluginName, remark } = this.state;
        const { pluginId, refresh } = this.props;
        api.modifyPluginInfo({
            pluginId,
            pluginName,
            remark: encodeURI(remark),
        }).then(res => {
            if (res.code === 0) {
                refresh();
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        });
    }

    handleMask = () => {
        const { deleteWs } = this.state;
        const options = {
            message: deleteWs ? i18n('plugin.deletePluginTip1') : i18n('plugin.deletePluginTip2'),
            isWarn: true,
            ccText: i18n('global.cancel'),
            okText: i18n('global.delete'),
            opText: i18n('global.deleting'),
            okHandle: this.handleDeletePlugin,
        };
        this.props.showMask(options);
    }

    handleDeletePlugin = () => {
        const { pluginId, hideMask } = this.props;
        api.deletePlugin(pluginId).then(res => {
            if (res.code === 0) {
                if (this.state.deleteWs) {
                    this.handleFindProject();
                } else {
                    hideMask();
                    this.props.history.push({ pathname: '/dashboard/plugin/mine' });
                }
            } else {
                hideMask();
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        });
    }

    handleFindProject = () => {
        const { createdBy, repoName, hideMask } = this.props;
        api.findProject({ ownerName: createdBy, projectName: repoName }).then(res => {
            const data = res.data;
            if (data && typeof data === 'string') {
                this.handleDeleteWorkspace(data);
            } else {
                hideMask();
                this.props.history.push({ pathname: '/dashboard/plugin/mine' });
            }
        });
    }

    handleDeleteWorkspace = (spaceKey) => {
        const { hideMask } = this.props;
        api.deleteWorkspace(spaceKey).then(res => {
            hideMask();
            this.props.history.push({ pathname: '/dashboard/plugin/mine' });
        });
    }
}

const mapDispatch = (dispatch) => {
    return {
        showMask: (payload) => dispatch({ type: 'SWITCH_MASK_TO_ON', payload }),
        hideMask: () => dispatch({ type: 'SWITCH_MASK_TO_OFF' }),
    }
}

export default connect(null, mapDispatch)(withRouter(Setting));
