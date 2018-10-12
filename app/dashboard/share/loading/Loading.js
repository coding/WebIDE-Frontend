import React, { Component } from 'react';
import { connect } from 'react-redux';

import './loading.css';

class Loading extends Component {
    render() {
        const { showLoading, message } = this.props;
        return (
            <div className={`dash-loading${showLoading ? ' on' : ''}`}>
                <div className="loading">
                    <i className="fa fa-cog fa-spin"></i>
                    {message}
                </div>
            </div>
        );
    }
}

const mapState = (state) => {
    return {
        showLoading: state.loadingState.showLoading,
        message: state.loadingState.message,
    }
}

export default connect(mapState)(Loading);
