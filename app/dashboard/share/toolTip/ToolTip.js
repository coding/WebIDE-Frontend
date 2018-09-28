import React, { Component } from 'react';
import { connect } from 'react-redux';

import './toolTip.css';

class ToolTip extends Component {
    state = {
        left: -300,
        top: -300,
        message: '',
    }
    render() {
        const { left, top } = this.state;
        const { message } = this.props;
        return (
            <div className="com-tooltip" ref={el => this.ref = el} style={{ left, top }}>{message}</div>
        );
    }

    componentDidUpdate() {
        const { clientX, clientY, message, handleToolTipOff } = this.props;
        if (this.state.message === message) {
            return;
        }
        const rect = this.ref.getBoundingClientRect();
        this.setState({ left: clientX - rect.width / 2, top: clientY - rect.height - 20, message });
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.setState({ left: -300, top: -300, message: '' });
            handleToolTipOff({ clientX: -300, clientY: -300, message: '' });
        }, 3000);
    }
}

const mapState = (state) => {
    return {
        clientX: state.tooltipState.clientX,
        clientY: state.tooltipState.clientY,
        message: state.tooltipState.message,
    }
}

const mapDispatch = (dispatch) => {
    return {
        handleToolTipOff: (payload) => dispatch({ type: 'TOOLTIP_OFF', payload }),
    }
}

export default connect(mapState, mapDispatch)(ToolTip);
