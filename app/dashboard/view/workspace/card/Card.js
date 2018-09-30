import React, { Component } from 'react';

import './card.css';

import api from '../../../api';
import { tencentOrigin } from '../../../utils/config';
import { getModifiedDate, getDeletedTime } from '../../../utils/date';

const httpsReg = /http(?:s)?/;

class Card extends Component {
    render() {
        const { spaceKey, projectIconUrl, ownerName, projectName, lastModifiedDate, workingStatus } = this.props;
        const deleteOption = {
            message: '删除后该工作空间自动为您保留到次日凌晨 2 点，在此之前您可以随时恢复，否则将被永久删除。请确认是否删除？',
            isWarn: true,
            okText: '删除',
            okHandle: this.handleDelete,
        }
        const restoreOption = {
            message: '请确认是否恢复？',
            isWarn: false,
            okText: '恢复',
            okHandle: this.handleRestore,
        }
        const src = httpsReg.test(projectIconUrl) ? projectIconUrl : `https://coding.net${projectIconUrl}`;
        return (
            <Href invalid={workingStatus === 'Invalid'} spaceKey={spaceKey}>
                <div className="avatar">
                    <img src={src} />
                    {workingStatus === 'Online' && <div className="dot"></div>}
                </div>
                <div className="content">
                    <div className="title">{`${ownerName}/${projectName}`}</div>
                    {workingStatus !== 'Invalid' && <div className="desc">最后更新于 {getModifiedDate(Date.now(), lastModifiedDate)}</div>}
                    {workingStatus === 'Invalid' && <div className="desc">删除于 {getDeletedTime(Date.now(), lastModifiedDate)}</div>}
                </div>
                <div className="control">
                    {workingStatus !== 'Invalid' && <i className="fa fa-trash-o" onClick={(event) => this.handleMask(deleteOption, event)}></i>}
                    {workingStatus === 'Invalid' && <i className="fa fa-undo" onClick={(event) => this.handleMask(restoreOption, event)}></i>}
                </div>
            </Href>
        );
    }

    handleMask = ({ message, isWarn, okText, okHandle }, event) => {
        event.preventDefault();
        event.stopPropagation();
        this.props.switchMaskToOn({
            message,
            isWarn,
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

const Href = ({ invalid, spaceKey, children }) => {
    if (invalid) {
        return <div className="ws-card">{children}</div>;
    } else {
        return <a className="ws-card" href={`${tencentOrigin}/ws/${spaceKey}`} target="_blank" rel="noopener noreferrer">{children}</a>;
    }
}

export default Card;
