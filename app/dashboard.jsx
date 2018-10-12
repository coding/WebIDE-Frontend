import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import './dashboard/index.css';
import './dashboard/common.css';

import store from './dashboard/store';

import Home from './dashboard/view/home';
import Mask from './dashboard/view/mask';
import Loading from './dashboard/share/loading';
import Notification from 'components/Notification';

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <div style={{ height: '100%' }}>
                <Switch>
                    <Route path="/dashboard" component={Home}></Route>
                </Switch>
                <Mask />
                <Loading />
                <Notification />
            </div>
        </BrowserRouter>
    </Provider>
    ,
    document.getElementById('dashboard')
);
