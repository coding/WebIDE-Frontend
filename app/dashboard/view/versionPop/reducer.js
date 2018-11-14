export function versionPopReducer(state = { isPopOn: false }, action) {
    switch (action.type) {
        case 'SHOW_VERSION_POP':
            return { ...action.payload, isPopOn: true };
        case 'HIDE_VERSION_POP':
            return {
                isPopOn: false,
                type: 1,
                desc: '',
                log: '',
                action: '',
                method: () => {},
            };
        default:
            return state;
    }
}
