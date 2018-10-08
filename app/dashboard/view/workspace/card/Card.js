import React, { Component } from 'react';

import './card.css';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import { tencentOrigin } from '../../../utils/config';
import { getModifiedDate, getDeletedTime } from '../../../utils/date';

const httpsReg = /http(?:s)?/;

class Card extends Component {
    render() {
        const { spaceKey, projectIconUrl, ownerName, projectName, lastModifiedDate, workingStatus, hasWorkspaceOpend } = this.props;
        const deleteOption = {
            message: i18n('global.deleteTip'),
            isWarn: true,
            okText: i18n('global.delete'),
            okHandle: this.handleDelete,
        }
        const restoreOption = {
            message: i18n('global.restoreTip'),
            isWarn: false,
            okText: i18n('global.restore'),
            okHandle: this.handleRestore,
        }
        const src = httpsReg.test(projectIconUrl) ? projectIconUrl : `https://coding.net${projectIconUrl}`;
        const title = `${ownerName}/${projectName}`;
        return (
            <Href invalid={workingStatus === 'Invalid'} online={workingStatus === 'Online'} spaceKey={spaceKey} hasWorkspaceOpend={hasWorkspaceOpend} handleMask={this.handleMask}>
                <div className="avatar">
                    <img src={src} />
                    {workingStatus === 'Online' && <div className="dot"></div>}
                </div>
                <div className="content">
                    <div className="title" title={title}>{title}</div>
                    {workingStatus !== 'Invalid' && <div className="desc">{getModifiedDate(Date.now(), lastModifiedDate)}</div>}
                    {workingStatus === 'Invalid' && <div className="desc">{getDeletedTime(Date.now(), lastModifiedDate)}</div>}
                </div>
                <div className="control">
                    {workingStatus !== 'Invalid' && <i className="fa fa-trash-o" onClick={(event) => this.handleMask(deleteOption, event)}></i>}
                    {workingStatus === 'Invalid' && <i className="fa fa-undo" onClick={(event) => this.handleMask(restoreOption, event)}></i>}
                </div>
            </Href>
        );
    }

    handleMask = ({ message, isWarn, noCancel, okText, okHandle }, event) => {
        event.preventDefault();
        event.stopPropagation();
        this.props.switchMaskToOn({
            message,
            isWarn,
            noCancel,
            okText,
            okHandle,
        });
    }

    handleDelete = () => {
        const { spaceKey, switchMaskToOff, handleFetch } = this.props;
        api.deleteWorkspace(spaceKey).then(res => {
            if (res.code === 0) {
                handleFetch();
                switchMaskToOff();
            }
        });
    }

    handleRestore = () => {
        const { spaceKey, switchMaskToOff, handleFetch } = this.props;
        api.restoreWorkspace(spaceKey).then(res => {
            handleFetch();
            switchMaskToOff();
        })
    }
}

const Href = ({ invalid, spaceKey, hasWorkspaceOpend, handleMask, children, online }) => {
    const url = window === window.top ? `/ws/${spaceKey}` : `${tencentOrigin}/ws/${spaceKey}`;
    let classname = 'ws-card';
    if (online) {
        classname += ' online';
    }
    const hasWorkspaceOpendOption = {
        message: '你有一个已打开的工作空间，如果想打开另一个，请关闭已打开工作空间的浏览器页面，并刷新 dashboard 重试',
        isWarn: false,
        noCancel: true,
        okText: i18n('global.ok'),
        okHandle: () => {},
    }
    if (hasWorkspaceOpend) {
        return <div className={classname} onClick={() => handleMask(hasWorkspaceOpendOption, event)}>{children}</div>;
    }
    if (invalid) {
        return <div className={classname}>{children}</div>;
    } else {
        return <a className={classname} href={url} target="_blank" rel="noopener noreferrer">{children}</a>;
    }
}

export default Card;
