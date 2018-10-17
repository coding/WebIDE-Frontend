export const switchMaskReducer = (maskState = { message: '', isMaskOn: false }, action) => {
    switch (action.type) {
        case 'SWITCH_MASK_TO_ON':
            return { ...action.payload, isMaskOn: true };
        case 'SWITCH_MASK_TO_OFF':
            return { message: '', okHandle: () => {}, isMaskOn: false };
        default:
            return maskState;
    }
}
