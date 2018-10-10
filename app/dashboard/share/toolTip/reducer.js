export const tooltipReducer = (tooltipState = { width: 120, clientX: -300, clientY: -300 }, action) => {
    if (action.type === 'TOOLTIP_ON' && action.payload) {
        return action.payload;
    } else if (action.type === 'TOOLTIP_OFF' && action.payload) {
        return action.payload;
    } else {
        return tooltipState;
    }
}
