import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import i18n from '../../../utils/i18n';

class NewPlugin extends Component {
    render() {
        const { canCreate, wsLimit } = this.props;
        return (
            canCreate ? (
                <Link className="ws-card new" to="/dashboard/plugin/create">
                    <div className="avatar"></div>
                    <div className="content">
                        <div className="title">{i18n('plugin.createCSPlugin')}</div>
                        <div className="desc a" onClick={this.handleOpenDoc}>{i18n('plugin.howToCreatePlugin')}</div>
                    </div>
                </Link>
            ) : (
                <div className="ws-card new disabled">
                    <div className="avatar"></div>
                    <div className="content">
                        <div className="title">{i18n('plugin.createCSPlugin')}</div>
                        <div className="desc">{i18n('ws.limitTip', { limit: wsLimit })}</div>
                    </div>
                </div>
            )
        );
    }

    handleOpenDoc = (event) => {
        event.preventDefault();
        window.open('https://studio.dev.tencent.com/plugins-docs');
    }
}

const mapState = (state) => {
    return {
        canCreate: state.wsState.canCreate,
        wsLimit: state.wsState.wsLimit,
    };
}

export default connect(mapState)(NewPlugin);
