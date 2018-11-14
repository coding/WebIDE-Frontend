// wsCount 去除别人邀请自己的工作空间数量
// wsLimit 创建工作空间的数量限制
// canCreate 能否继续创建
export const workspaceReducer = (state = { wsCount: 0, wsLimit: 5, canCreate: true }, action) => {
    if (action.type === 'STORE_WORKSPACE' && action.payload) {
        const count = action.payload.wsCount;
        const canCreate = count ? count < state.wsLimit : true;
        return { ...state, canCreate, ...action.payload };
    } else {
        return state;
    }
}

export const hasWorkspaceOpendReducer = (hasWorkspaceOpend = false, action) => {
    switch (action.type) {
        case 'HAS_WORKSPACE_OPEND':
            return true;
        case 'NO_WORKSPACE_OPEND':
            return false;
        default:
            return hasWorkspaceOpend;
    }
}
