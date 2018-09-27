export const userReducer = (userState = {}, action) => {
    switch (action.type) {
        case 'USER_LOG_IN':
            return { ...action.payload };
        case 'USER_LOG_OUT':
            return {};
        default:
            return userState;
    }
}
