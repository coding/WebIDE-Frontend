const defaultV = {
    version: '0.0.0',
    versionId: '',
    status: 0,
};

function parseStatus(pluginVersions) {
    const len = pluginVersions.length;
    const currV = pluginVersions[len - 1];
    const lastV = pluginVersions[len - 2] || defaultV;
    if (len === 0) {
        // 尚未发布
        return defaultV;
    }
    const auditStatus = currV.auditStatus; // 1 审核中; 2 审核成功; 3 审核失败
    const buildStatus = currV.auditStatus; // 1 构建中; 2 构建成功; 3 构建失败
    if (auditStatus === 1) {
        if (!currV.isPreDeploy) {
            // 审核中
            return {
                version: currV.buildVersion,
                versionId: currV.id,
                status: 1,
            };
        } else {
            // 预发布
            return {
                version: currV.buildVersion,
                versionId: currV.id,
                status: 5,
            };
        }
    }
    if (auditStatus === 2) {
        if (buildStatus === 1) {
            // 审核中(其实是构建中)
            return {
                version: currV.buildVersion,
                versionId: currV.id,
                isPrePublish: currV.isPreDeploy,
                status: 1,
            };
        }
        if (buildStatus === 2) {
            // 发布成功
            return {
                version: currV.buildVersion,
                versionId: currV.id,
                status: 3,
            };
        }
        if (buildStatus === 3) {
            // 构建失败
            return {
                version: currV.buildVersion,
                versionId: currV.id,
                status: 4,
            };
        }
    }
    if (auditStatus === 3) {
        // 审核失败
        return {
            version: lastV.buildVersion,
            versionId: lastV.id,
            status: 2,
        };
    }
}

export default parseStatus;
