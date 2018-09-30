export const workspaceCountReducer = (workspaceCount = 0, action) => {
    if (action.type === 'STORE_WORKSPACE_COUNT' && action.payload) {
        return action.payload;
    } else {
        return workspaceCount;
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
