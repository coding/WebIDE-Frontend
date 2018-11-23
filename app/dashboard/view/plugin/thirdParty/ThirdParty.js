import React, { Component } from 'react';

import './thirdParty.css';

import TCard from '../tCard';
import Inbox from '../../../share/inbox';
import NoData from '../../../share/noData';
import Topbar from '../topbar';

import api from '../../../api';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

class ThirdParty extends Component {
    state = {
        originPlugins: [],
        plugins: [],
        search: '',
    }

    render() {
        const { plugins, search } = this.state;
        return (
            <div className="dash-thirdparty plugin-list">
                <Topbar />
                <div className="search">
                    <Inbox holder="plugin.searchPlugin" value={search} onChange={this.handleSearch} />
                </div>
                {
                    plugins.length ? (
                        plugins.map(plugin => <TCard key={plugin.id} {...plugin} refresh={this.fetchThirdParty} />)
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
                const data = res.data;
                this.setState({
                    originPlugins: data,
                    plugins: data,
                });
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg || res.message });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }

    handleSearch = (event) => {
        const search = event.target.value.toLowerCase();
        const { originPlugins } = this.state;
        if (!search) {
            this.setState({
                plugins: originPlugins,
                search,
            });
        } else {
            this.setState({
                plugins: originPlugins.filter(p => p.pluginName.toLowerCase().includes(search)),
                search,
            });
        }
    }
}

export default ThirdParty;
