import React, { Component } from 'react';

import './thirdParty.css';

import api from '../../../api';
import Card from '../card';
import NoData from '../../../share/noData';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

class ThirdParty extends Component {
    state = {
        plugins: [],
    }

    render() {
        const { plugins } = this.state;
        return (
            <div className="dash-thirdparty view">
                {
                    plugins.length ? (
                        plugins.map(plugin => <Card key={plugin.id} {...plugin} refresh={this.fetchThirdParty} belong={1} />)
                    ) : <NoData />
                }
            </div>
        );
    }

    componentDidMount() {
        this.fetchThirdParty();
    }

    fetchThirdParty = () => {
        api.getEnablePlugin().then(res => {
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

export default ThirdParty;
