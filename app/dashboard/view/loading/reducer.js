export const switchLoadingReducer = (loadingState = { message: '', showLoading: false }, action) => {
    switch (action.type) {
        case 'SWITCH_LOADING_TO_ON':
            return { ...action.payload, showLoading: true };
        case 'SWITCH_LOADING_TO_OFF':
            return { message: '', showLoading: false };
        default:
            return loadingState;
    }
}
