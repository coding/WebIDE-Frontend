export const switchLanguageReducer = (language = 'zh_CN', action) => {
    switch (action.type) {
        case 'SWITCH_LANGUAGE_TO_EN':
            return 'en_US';
        case 'SWITCH_LANGUAGE_TO_ZH':
            return 'zh_CN';
        default:
            return language;
    }
}
