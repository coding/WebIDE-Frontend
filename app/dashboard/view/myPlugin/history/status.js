// auditStatus: 1 审核中; 2 审核成功; 3 审核失败
// buildStatus: 1 构建中; 2 构建成功; 3 构建失败
function getStatus(auditStatus, buildStatus) {
    let status = 'plugin.state0';
    if (auditStatus === 1) {
        // 审核中
        status = 'plugin.state1';
    } else if (auditStatus === 2) {
        if (buildStatus === 1) {
            // 是构建中
            status = 'plugin.state3';
        } else if (buildStatus === 2) {
            // 发布成功
            status = 'plugin.state5';
        } else if (buildStatus === 3) {
            // 构建失败
            status = 'plugin.state4';
        }
    } else if (auditStatus === 3) {
        // 审核失败
        status = 'plugin.state2';
    }
    return status;
}

export default getStatus;
