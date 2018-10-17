import React, { Component } from 'react';
import { connect } from 'react-redux';

import './mask.css';

import i18n from '../../utils/i18n';

class Mask extends Component {
    state = { operating: false }

    render() {
        const { operating } = this.state;
        const { isMaskOn, message, isWarn, ccText, okText, opText, hideMask } = this.props;
        return (
            <div className={`dash-mask${isMaskOn ? ' active' : ''}`} onClick={hideMask}>
                <div className="prompt" onClick={event => event.stopPropagation()}>
                    <div className="message">{message}</div>
                    <div className="control">
                        {ccText ? <button className="com-button default" onClick={hideMask}>{ccText}</button> : ''}
                        <button className={`com-button${isWarn ? ' warn' : ' primary'}`} onClick={this.handleOKButton}>{!operating ? okText : opText}</button>
                    </div>
                </div>
            </div>
        );
    }

    handleOKButton = () => {
        let { ccText, okHandle, hideMask } = this.props;
        okHandle = ccText ? okHandle : hideMask;
        if (this.state.operating === false) {
            this.setState({ operating: true });
        }
        okHandle();
    }

    componentDidUpdate() {
        if (this.state.operating === true && !this.props.message) {
            this.setState({ operating: false });
        }
    }
}

const mapState = (state) => {
    const maskState = state.maskState;
    return {
        isMaskOn: maskState.isMaskOn,
        message: maskState.message,
        isWarn: maskState.isWarn,
        ccText: maskState.ccText,
        okText: maskState.okText || i18n('global.ok'),
        opText: maskState.opText || maskState.okText,
        okHandle: maskState.okHandle,
    }
}

const mapDispatch = (dispatch) => {
    return {
        hideMask: () => dispatch({ type: 'SWITCH_MASK_TO_OFF' }),
    }
}

export default connect(mapState, mapDispatch)(Mask);
