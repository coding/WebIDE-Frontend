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
                        plugins.map(plugin => <TCard key={plugin.id} {...plugin} refresh={this.fetchPlugins} />)
                    ) : <NoData />
                }
            </div>
        );
    }

    componentDidMount() {
        this.fetchPlugins();
    }

    fetchPlugins = () => {
        Promise.all([api.getInstalledPlugin(), api.getInstalledDisabledPlugin()]).then(values => {
            const [one, two] = values;
            let originPlugins = [];
            let plugins = [];
            if (one.code === 0) {
                const data = one.data;
                originPlugins = originPlugins.concat(data);
                plugins = plugins.concat(data);
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: one.msg || one.message });
            }
            if (two.code === 0) {
                const data = two.data;
                data.map(item => {
                    item.globalDisabled = true;
                    return item;
                });
                originPlugins = originPlugins.concat(data);
                plugins = plugins.concat(data);
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: two.msg || two.message });
            }
            this.setState({ originPlugins, plugins });
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
