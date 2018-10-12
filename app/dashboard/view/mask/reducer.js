export const switchMaskReducer = (maskState = { message: '', showMask: false }, action) => {
    switch (action.type) {
        case 'SWITCH_MASK_TO_ON':
            return { ...action.payload, showMask: true };
        case 'SWITCH_MASK_TO_OFF':
            return { message: '', okHandle: () => {}, showMask: false };
        default:
            return maskState;
    }
}
