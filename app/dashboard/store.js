import { createStore, combineReducers } from 'redux';

import { switchLanguageReducer } from './view/setting/reducer';
import { switchMaskReducer } from './view/mask/reducer';
import { switchLoadingReducer } from './view/loading/reducer';
import { userReducer } from './view/home/profile/reducer';
import { workspaceReducer, hasWorkspaceOpendReducer } from './view/workspace/reducer';
import { switchMbarReducer } from './share/stripe/reducer';
import { versionPopReducer } from './view/versionPop/reducer';

const reducers = combineReducers({
    language: switchLanguageReducer,
    maskState: switchMaskReducer,
    loadingState: switchLoadingReducer,
    userState: userReducer,
    wsState: workspaceReducer,
    hasWorkspaceOpend: hasWorkspaceOpendReducer,
    isMbarOn: switchMbarReducer,
    versionPop: versionPopReducer,
});

const languageStorage = localStorage.getItem('cloudstudio-dashboard-language') || 'zh_CN';

const store = createStore(reducers, { language: languageStorage });

export default store;
