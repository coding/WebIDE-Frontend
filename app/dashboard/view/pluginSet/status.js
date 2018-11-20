const defaultOption = {
    historyVersions: [],
    version: '0.0.0',
    versionId: '',
    status: 0,
    hasPrePublish: false,
    preStatus: 0,
    preVersionId: '',
}

function parseStatus(pluginVersions) {
    const len = pluginVersions.length;
    if (len === 0) {
        // 尚未发布
        return defaultOption;
    }
    const pub = [];
    let hasPrePublish = false;
    let preStatus = 0;
    let preVersionId = '';
    let preLog = '';
    for (let i = 0; i < len; i++) {
        const item = pluginVersions[i];
        // 预发布的版本。isPreDeploy = true 代表 已经预发布，isPreDeploy = false 并且 isDeleted = true 代表已经取消预发布
        if (item.isPreDeploy || item.isDeleted) {
            // 构建失败时，也会标记删除
            hasPrePublish = item.isPreDeploy || (item.isDeleted && item.buildStatus === 3);
            preStatus = item.buildStatus;
            preVersionId = item.id;
            preLog = item.buildLog;
        } else {
            pub.unshift(item);
        }
    }
    const v = pub[0];
    if (!v || typeof v !== 'object') {
        // 尚未正式发布
        return {
            ...defaultOption,
            hasPrePublish,
            preStatus,
            preVersionId,
            preLog,
        };
    }
    const auditStatus = v.auditStatus; // 1 审核中; 2 审核成功; 3 审核失败
    const buildStatus = v.buildStatus; // 1 构建中; 2 构建成功; 3 构建失败
    let status = 0;
    if (auditStatus === 1) {
        // 审核中
        status = 1;
    } else if (auditStatus === 2) {
        if (buildStatus === 1) {
            // 构建中
            status = 3;
        } else if (buildStatus === 2) {
            // 发布成功
            status = 5;
        } else if (buildStatus === 3) {
            // 构建失败
            status = 4;
        }
    } else if (auditStatus === 3) {
        // 审核失败
        status = 2;
    }
    return {
        historyVersions: pub,
        status,
        version: v.buildVersion,
        versionId: v.id,
        log: v.buildLog,
        auditRemark: v.auditRemark || '未知',
        hasPrePublish,
        preStatus,
        preVersionId,
        preLog,
    };
}

export default parseStatus;