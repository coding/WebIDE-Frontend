export const switchMbarReducer = (isMbarOn = false, action) => {
    switch (action.type) {
        case 'SWITCH_MBAR_TO_ON':
            return true;
        case 'SWITCH_MBAR_TO_OFF':
            return false;
        default:
            return isMbarOn;
    }
}
