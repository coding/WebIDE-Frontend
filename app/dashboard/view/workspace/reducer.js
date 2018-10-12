export const workspaceReducer = (wsState = { ws: [], wsCount: 0, wsLimit: 5, canCreate: true }, action) => {
    if (action.type === 'STORE_WORKSPACE' && action.payload) {
        const canCreate = action.payload.wsCount < wsState.wsLimit;
        return { ...wsState, canCreate, ...action.payload };
    } else {
        return wsState;
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
