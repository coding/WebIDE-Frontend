import { createStore, combineReducers } from 'redux';

import { switchLanguageReducer } from './view/config/reducer';
import { switchMaskReducer } from './view/mask/reducer';
import { userReducer } from './view/home/setting/reducer';
import { workspaceCountReducer } from './view/workspace/reducer';
import { tooltipReducer } from './share/toolTip/reducer';

const reducers = combineReducers({
    language: switchLanguageReducer,
    maskState: switchMaskReducer,
    userState: userReducer,
    workspaceCount: workspaceCountReducer,
    tooltipState: tooltipReducer,
});

const languageStorage = localStorage.getItem('cloudstudio-dashboard-language') || 'zh_CN';

const store = createStore(reducers, { language: languageStorage });

export default store;
