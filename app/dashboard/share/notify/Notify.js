import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NotificationStack } from 'react-notification';

import './notify.css';

const barStyleFactory = (index, style) => {
    return Object.assign({}, style, {
        left: 'initial',
        right: '-100%',
        bottom: 'initial',
        top: `${2 + index * 4}rem`,
        zIndex: 20,
        fontSize: '12px',
        padding: '8px',
    });
}

const activeBarStyleFactory = (index, style) => {
    return Object.assign({}, style, {
        left: 'initial',
        right: '1rem',
        bottom: 'initial',
        top: `${2 + index * 4}rem`,
        fontSize: '12px',
        padding: '8px',
    });
}

class Notify extends Component {
    render() {
        const { notifications, onDismiss } = this.props
        return (
            <NotificationStack notifications={notifications} onDismiss={onDismiss} barStyleFactory={barStyleFactory} activeBarStyleFactory={activeBarStyleFactory} />
        );
    }
}

const mapState = (state) => {
    return {
        notifications: state.notifications,
    }
}

const mapDispatch = (dispatch) => {
    return {
        onDismiss: (payload) => dispatch({ type: 'REMOVE_NOTIFICATION', payload }),
    }
}

export default connect(mapState, mapDispatch)(Notify);
