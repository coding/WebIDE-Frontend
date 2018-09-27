export const switchMaskReducer = (maskState, action) => {
    switch (action.type) {
        case 'SWITCH_MASK_TO_ON':
            return { ...action.payload, showMask: true };
        case 'SWITCH_MASK_TO_OFF':
            return { message: '', isWarn: false, okText: '', okHandle: () => {}, showMask: false };
        default:
            return { message: '', isWarn: false, okText: '', okHandle: () => {}, showMask: false };
    }
}
