// auditStatus: 1 审核中; 2 审核成功; 3 审核失败
// buildStatus: 1 构建中; 2 构建成功; 3 构建失败
function getStatus(auditStatus, buildStatus) {
    let status = 'plugin.statusPublished';
    if (auditStatus === 1) {
        // 审核中
        status = 'plugin.statusPending';
    } else if (auditStatus === 2) {
        if (buildStatus === 1) {
            // 审核中(其实是构建中)
            status = 'plugin.statusPending';
        } else if (buildStatus === 2) {
            // 发布成功
            status = 'plugin.statusPublished';
        } else if (buildStatus === 3) {
            // 构建失败
            status = 'plugin.statusBuildFail';
        }
    } else if (auditStatus === 3) {
        // 审核失败
        status = 'plugin.statusAuditFail';
    }
    return status;
}

export default getStatus;
