import React, { Component } from 'react';

import Inbox from '../../../share/inbox';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

class Modify extends Component {
    state = {
        pluginName: this.props.pluginName,
        remark: this.props.remark,
    }

    render() {
        const { pluginName, remark } = this.state;
        const disabled = !pluginName || !remark || remark.length > 255;
        return (
            <div className="panel">
                <div className="panel-title"></div>
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
                        <button className="com-button primary" disabled={disabled} onClick={this.handleModify}>{i18n('global.modify')}</button>
                    </div>
                </div>
            </div>
        );
    }

    handlePluginName = (event) => {
        this.setState({ pluginName: event.target.value });
    }

    handleRemark = (event) => {
        this.setState({ remark: event.target.value });
    }

    handleModify = () => {
        const { pluginName, remark } = this.state;
        const { pluginId, refresh } = this.props;
        api.modifyPluginInfo({
            pluginId,
            pluginName,
            remark: encodeURI(remark),
        }).then(res => {
            if (res && res.code === 0) {
                refresh();
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }
}

export default Modify;
