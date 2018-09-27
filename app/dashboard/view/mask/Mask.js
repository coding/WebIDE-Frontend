import React, { Component } from 'react';
import { connect } from 'react-redux';

import './mask.css';

import i18n from '../../utils/i18n';

class Mask extends Component {
    render() {
        const { maskState, switchMaskToOff } = this.props;
        const { showMask, message, isWarn, okText, okHandle } = maskState;
        return (
            <div className={`dash-mask${showMask ? ' active' : ''}`} onClick={switchMaskToOff}>
                <div className="prompt" onClick={event => event.stopPropagation()}>
                    <div className="message">{message}</div>
                    <div className="control">
                        <button className="com-button default" onClick={switchMaskToOff}>{i18n('global.cancel')}</button>
                        <button className={`com-button${isWarn ? ' warn' : ' primary'}`} onClick={okHandle}>{okText}</button>
                    </div>
                </div>
            </div>
        );
    }
}

const mapState = (state) => {
    return {
        maskState: state.maskState,
    }
}

const mapDispatch = (dispatch) => {
    return {
        switchMaskToOff: () => dispatch({ type: 'SWITCH_MASK_TO_OFF' }),
    }
}

export default connect(mapState, mapDispatch)(Mask);
