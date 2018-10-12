import React, { Component } from 'react';

import './card.css';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import { tencentOrigin } from '../../../utils/config';
import { getModifiedDate, getDeletedTime } from '../../../utils/date';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

class Card extends Component {
    render() {
        const { spaceKey, ownerName, projectName, lastModifiedDate, workingStatus, hasWorkspaceOpend } = this.props;
        const stopOption = {
            message: i18n('global.stopTip'),
            isWarn: true,
            okText: i18n('global.stop'),
            okHandle: this.handleStop,
        }
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
        const title = `${ownerName}/${projectName}`;
        return (
            <Href invalid={workingStatus === 'Invalid'} spaceKey={spaceKey} hasWSOpend={hasWorkspaceOpend} handleMask={this.handleMask} handleStop={this.handleStop}>
                <div className="inner">
                    <div className="title" title={title}>{title}</div>
                    <div className="desc">
                        {workingStatus !== 'Invalid' ? getModifiedDate(Date.now(), lastModifiedDate) : getDeletedTime(Date.now(), lastModifiedDate)}
                    </div>
                    <div className={`online${workingStatus !== 'Online' ? ' invisible' : ''}`}>
                        <span className="dot"></span>
                        <span>{i18n('global.running')}</span>
                    </div>
                </div>
                {
                    workingStatus !== 'Invalid' ? (
                        <div className="control">
                            {
                                workingStatus === 'Online' && (
                                    <div className="act" onClick={(event) => this.handleMask(stopOption, event)}>
                                        <i className="fa fa-stop-circle-o"></i>
                                        <span>{i18n('global.stop')}</span>
                                    </div>
                                )
                            }
                            <div className="act" onClick={(event) => this.handleMask(deleteOption, event)}>
                                <i className="fa fa-trash-o"></i>
                                <span>{i18n('global.delete')}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="control">
                            <div className="act" onClick={(event) => this.handleMask(restoreOption, event)}>
                                <i className="fa fa-undo"></i>
                                <span>{i18n('global.restore')}</span>
                            </div>
                        </div>
                    )
                }
            </Href>
        );
    }

    handleMask = ({ message, isWarn, noCancel, cancelText, okText, okHandle }, event) => {
        event.preventDefault();
        event.stopPropagation();
        this.props.showMask({
            message,
            isWarn,
            noCancel,
            cancelText,
            okText,
            okHandle,
        });
    }

    handleStop = () => {
        const { opendSpaceKey, spaceKey, hideMask, handleFetch } = this.props;
        api.quitWorkspace(opendSpaceKey || spaceKey).then(res => {
            if (res.code === 0) {
                hideMask();
                handleFetch();
                notify({ message: res.msg });
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }

    handleDelete = () => {
        const { spaceKey, hideMask, handleFetch } = this.props;
        api.deleteWorkspace(spaceKey).then(res => {
            if (res.code === 0) {
                handleFetch();
                hideMask();
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }

    handleRestore = () => {
        const { spaceKey, hideMask, handleFetch } = this.props;
        api.restoreWorkspace(spaceKey).then(res => {
            hideMask();
            if (!res.code) {
                handleFetch();
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }
}

const Href = ({ invalid, spaceKey, hasWSOpend, handleMask, handleStop, children }) => {
    const url = window === window.top ? `/ws/${spaceKey}` : `${tencentOrigin}/ws/${spaceKey}`;
    const hasWorkspaceOpendOption = {
        message: i18n('global.hasWorkspaceOpendTip'),
        isWarn: true,
        cancelText: i18n('global.ok'),
        okText: i18n('global.stop'),
        okHandle: handleStop,
    }
    if (hasWSOpend) {
        return <div className="ws-card" onClick={(event) => handleMask(hasWorkspaceOpendOption, event)}>{children}</div>;
    }
    if (invalid) {
        return <div className="ws-card">{children}</div>;
    } else {
        return <a className="ws-card" href={url} target="_blank" rel="noopener noreferrer">{children}</a>;
    }
}

export default Card;
