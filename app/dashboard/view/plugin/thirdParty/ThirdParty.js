import React, { Component } from 'react';

import './thirdParty.css';

import api from '../../../api';
import Card from '../card';

const plugins = [
    {
        "userId": 1417308,
        "pluginName": "解放路口时尽量发的是看了就看到健身房克鲁赛德付款了的设计费看来大家快来辅导费第三方了会计师的考虑富家大室奋斗开始就分开了第三方卡兰蒂斯",
        "repoName": "plugin-git",
        "repoUrl": "https://git.dev.tencent.com/ddd_bs/plugin-git.git",
        "globalStatus": 1,
        "status": 1,
        "currentVersion": "1.1.1.1",
        "lastDeployDate": 1539742204000,
        "remark": "git 相关插件",
        "pluginTypeId": 0,
        "avgScore": 3,
        "countScoreUser": 1,
        "id": 0,
        "src": "https://dn-coding-net-production-static.codehub.cn/98276be2-66ac-4ce2-9088-6c6ffb27c8f2.png?imageMogr2/auto-orient/format/png/crop/!800x800a0a0",
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
        "remark": "解放路口时尽量发的是看了就看到健身房克鲁赛德付款了的设计费看来大家快来辅导费第三方了会计师的考虑富家大室奋斗开始就分开了第三方卡兰蒂斯附近路口等数据库莲富大厦克劳福德看来风刀霜剑开了房绝对是快乐放得开了是否就开了多少电视剧付款了的纠纷金发卡兰蒂斯就开了多少看来大家思考来访接待室",
        "pluginTypeId": 0,
        "avgScore": 3,
        "countScoreUser": 1,
        "id": 1,
        "src": "https://dn-coding-net-production-static.codehub.cn/98276be2-66ac-4ce2-9088-6c6ffb27c8f2.png?imageMogr2/auto-orient/format/png/crop/!800x800a0a0",
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
        "src": "https://dn-coding-net-production-static.codehub.cn/98276be2-66ac-4ce2-9088-6c6ffb27c8f2.png?imageMogr2/auto-orient/format/png/crop/!800x800a0a0",
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
        "src": "https://dn-coding-net-production-static.codehub.cn/98276be2-66ac-4ce2-9088-6c6ffb27c8f2.png?imageMogr2/auto-orient/format/png/crop/!800x800a0a0",
        "createdBy": "ddd_bs",
        "createdDate": 1539739359000,
        "lastModifiedBy": "ddd_bs",
        "lastModifiedDate": 1539742679000,
        "version": 4
    },
];

class ThirdParty extends Component {
    state = {
        filter: '',
    }

    render() {
        return (
            <div className="dash-installed view">
                {plugins.map(plugin => <Card key={plugin.id} {...plugin} belong={1} />)}
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

export default ThirdParty;
