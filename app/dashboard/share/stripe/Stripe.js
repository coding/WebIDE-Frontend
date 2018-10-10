import React, { Component } from 'react';
import { connect } from 'react-redux';

import './stripe.css';

class Stripe extends Component {
    render() {
        const { isMbarOn, handleSwitchMbar } = this.props;
        return (
            <div className={`dash-stripe${isMbarOn ? ' on' : ''}`} onClick={() => handleSwitchMbar(isMbarOn)}></div>
        );
    }
}

const mapState = (state) => {
    return {
        isMbarOn: state.isMbarOn,
    };
}

const mapDispatch = (dispatch) => {
    return {
        handleSwitchMbar: (isMbarOn) => {
            if (isMbarOn) {
                dispatch({ type: 'SWITCH_MBAR_TO_OFF' });
            } else {
                dispatch({ type: 'SWITCH_MBAR_TO_ON' });
            }
        },
    };
}

export default connect(mapState, mapDispatch)(Stripe);
