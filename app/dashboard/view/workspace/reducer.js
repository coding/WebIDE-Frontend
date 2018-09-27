export const workspaceCountReducer = (workspaceCount = 0, action) => {
    if (action.type === 'STORE_WORKSPACE_COUNT' && action.payload) {
        return action.payload;
    } else {
        return workspaceCount;
    }
}
