import React, { Component } from 'react';

import './mine.css';

import Card from '../card';
import NoData from '../../../share/noData';
import Topbar from '../topbar';

import api from 'dashboard/api/index';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

class Mine extends Component {
    state = {
        plugins: [],
    }

    render() {
        const { plugins } = this.state;
        return (
            <div className="dash-mine plugin-list">
                <Topbar />
                {
                    plugins.length ? (
                        plugins.map(plugin => <Card key={plugin.id} {...plugin} belong={3} />)
                    ) : <NoData />
                }
            </div>
        );
    }

    componentDidMount() {
        api.getMyPlugin().then(res => {
            if (res.code === 0) {
                this.setState({ plugins: res.data });
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg || res.message });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }
}

export default Mine;
