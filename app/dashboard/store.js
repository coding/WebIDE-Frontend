import { createStore, combineReducers } from 'redux';

import { switchLanguageReducer } from './view/config/reducer';
import { notifyReducer } from './share/notify/reducer';
import { switchMaskReducer } from './view/mask/reducer';
import { switchLoadingReducer } from './view/loading/reducer';
import { userReducer } from './view/home/setting/reducer';
import { workspaceReducer, hasWorkspaceOpendReducer } from './view/workspace/reducer';
import { switchMbarReducer } from './share/stripe/reducer';

const reducers = combineReducers({
    language: switchLanguageReducer,
    notifications: notifyReducer,
    maskState: switchMaskReducer,
    loadingState: switchLoadingReducer,
    userState: userReducer,
    wsState: workspaceReducer,
    hasWorkspaceOpend: hasWorkspaceOpendReducer,
    isMbarOn: switchMbarReducer,
});

const languageStorage = localStorage.getItem('cloudstudio-dashboard-language') || 'zh_CN';

const store = createStore(reducers, { language: languageStorage });

export default store;
