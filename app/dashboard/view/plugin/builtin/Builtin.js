import React, { Component } from 'react';

import './builtin.css';

import NoData from '../../../share/noData';
import Topbar from '../topbar';

import api from 'dashboard/api/index';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

class Builtin extends Component {
    state = {
        plugins: [],
    }

    render() {
        const { plugins } = this.state;
        return (
            <div className="dash-builtin plugin-list">
                <Topbar />
                {
                    plugins.length ? (
                        plugins.map(plugin => <Card key={plugin.id} {...plugin} />)
                    ) : <NoData />
                }
            </div>
        );
    }

    componentDidMount() {
        this.handleFetch();
    }

    handleFetch = () => {
        api.getBuiltinPlugin().then(res => {
            if (Array.isArray(res)) {
                const plugins = [];
                for (let i = 0; i < res.length; i++) {
                    const item = res[i];
                    const plugin = {};
                    plugin.id = item.id;
                    plugin.pluginName = item.displayName;
                    plugin.remark = item.description;
                    plugins.push(plugin);
                }
                this.setState({ plugins });
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg || res.message });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }
}

const Card = ({ pluginName, remark }) => {
    return (
        <div className="built-card">
            <div className="name">{pluginName}</div>
            <div className="desc">{remark}</div>
        </div>
    );
}

export default Builtin;
