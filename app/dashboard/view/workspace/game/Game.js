import React, { Component } from 'react';

import './game.css';

import i18n from '../../../utils/i18n';

class Game extends Component {
    render() {
        return (
            <div className="dash-game">
                <i className="fa fa-bullhorn"></i>
                {i18n('plugin.gameTip')}
                <a href="https://studio.dev.tencent.com/campaign/favorite-plugins/" target="_blank" rel="noopener noreferrer">{i18n('global.more')}</a>
            </div>
        );
    }
}

export default Game;
