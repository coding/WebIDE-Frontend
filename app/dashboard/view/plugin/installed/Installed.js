import React, { Component } from 'react';

import './installed.css';

import api from '../../../api';
import Card from '../card';

const plugins = [
    {
        "userId": 1417308,
        "pluginName": "git 插件",
        "repoName": "plugin-git",
        "repoUrl": "https://git.dev.tencent.com/ddd_bs/plugin-git.git",
        "globalStatus": 1,
        "status": 1,
        "currentVersion": "1.1",
        "lastDeployDate": 1539742204000,
        "remark": "git 相关插件",
        "pluginTypeId": 0,
        "avgScore": 3,
        "countScoreUser": 1,
        "id": 0,
        "createdBy": "ddd_bs",
        "createdDate": 1539739359000,
        "lastModifiedBy": "ddd_bs",
        "lastModifiedDate": 1539742679000,
        "version": 4
    },
    {
        "userId": 1417308,
        "pluginName": "git 插件",
        "repoName": "plugin-git",
        "repoUrl": "https://git.dev.tencent.com/ddd_bs/plugin-git.git",
        "globalStatus": 1,
        "status": 1,
        "currentVersion": "1.1",
        "lastDeployDate": 1539742204000,
        "remark": "git 相关插件，git 相关插件，git 相关插件，git 相关插件",
        "pluginTypeId": 0,
        "avgScore": 3,
        "countScoreUser": 1,
        "id": 1,
        "createdBy": "ddd_bs",
        "createdDate": 1539739359000,
        "lastModifiedBy": "ddd_bs",
        "lastModifiedDate": 1539742679000,
        "version": 4
    },
    {
        "userId": 1417308,
        "pluginName": "git 插件",
        "repoName": "plugin-git",
        "repoUrl": "https://git.dev.tencent.com/ddd_bs/plugin-git.git",
        "globalStatus": 1,
        "status": 1,
        "currentVersion": "1.1",
        "lastDeployDate": 1539742204000,
        "remark": "git 相关插件",
        "pluginTypeId": 0,
        "avgScore": 5,
        "countScoreUser": 1,
        "id": 2,
        "createdBy": "ddd_bs",
        "createdDate": 1539739359000,
        "lastModifiedBy": "ddd_bs",
        "lastModifiedDate": 1539742679000,
        "version": 4
    },
    {
        "userId": 1417308,
        "pluginName": "git 插件",
        "repoName": "plugin-git",
        "repoUrl": "https://git.dev.tencent.com/ddd_bs/plugin-git.git",
        "globalStatus": 1,
        "status": 1,
        "currentVersion": "1.1",
        "lastDeployDate": 1539742204000,
        "remark": "git 相关插件",
        "pluginTypeId": 0,
        "avgScore": 1,
        "countScoreUser": 1,
        "id": 3,
        "createdBy": "ddd_bs",
        "createdDate": 1539739359000,
        "lastModifiedBy": "ddd_bs",
        "lastModifiedDate": 1539742679000,
        "version": 4
    },
];

class Installed extends Component {
    state = {
        filter: '',
    }

    render() {
        return (
            <div className="dash-installed view">
                {plugins.map(plugin => <Card key={plugin.id} {...plugin} />)}
            </div>
        );
    }

    componentDidMount() {
        // this.handleFetch();
    }

    componentDidUpdate() {
        const filter = this.props.filter;
        if (filter !== this.state.filter) {
            this.setState({ filter });
        }
    }

    handleFetch() {
        api.getInstalledPlugin().then(res => {
            console.log(res);
        });
    }
}

export default Installed;
