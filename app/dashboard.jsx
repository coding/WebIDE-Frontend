import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import './dashboard/index.css';
import './dashboard/common.css';

import store from './dashboard/store';

import Home from './dashboard/view/home';
import Mask from './dashboard/view/mask';
import Notification from 'components/Notification';
import ToolTip from './dashboard/share/toolTip';
import Utilities from './containers/Utilities';

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <div style={{ height: '100%' }}>
                <Switch>
                    <Route path="/dashboard" component={Home}></Route>
                </Switch>
                <Mask />
                <Notification />
                <ToolTip />
                <Utilities />
            </div>
        </BrowserRouter>
    </Provider>
    ,
    document.getElementById('root')
);
