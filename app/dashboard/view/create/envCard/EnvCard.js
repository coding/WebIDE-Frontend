import React from 'react';

import './envCard.css';
import c from './img/c.svg';
import dotnet from './img/dotnet.svg';
import elixir from './img/elixir.svg';
import go from './img/go.svg';
import hexo from './img/hexo.svg';
import java from './img/java.svg';
import jekyll from './img/jekyll.svg';
import machinelearning from './img/machinelearning.svg';
import nodejs from './img/nodejs.svg';
import php from './img/php.svg';
import ruby from './img/ruby.svg';
import share from './img/share.svg';
import ubuntu from './img/ubuntu.svg';

const svgs = {
    'nodejs': nodejs,
    'jekyll': jekyll,
    'hexo': hexo,
    'php-mysql': php,
    'rvm': ruby,
    'rbenv': ruby,
    'java': java,
    'dotnet': dotnet,
    'machine-learning': machinelearning,
    'go': go,
    'c-cpp': c,
}

const match = (label) => {
    if (label.includes('php-python-java')) {
        return ubuntu;
    }
    for (let key in svgs) {
        if (svgs.hasOwnProperty(key)) {
            if (label.includes(key)) {
                return svgs[key];
            }
        }
    }
    return ubuntu;
}

const EnvCard = ({ name, displayName, description, descriptionCN, envId, language, handleSeleteEnv }) => {
    const desc = language === 'zh_CN' ? descriptionCN : description;
    return (
        <div className={`com-card env-card${envId === name ? ' seleted' : ''}`} onClick={() => handleSeleteEnv(name)}>
            <div className="inner">
                <div className="main">
                    <img src={match(name)} alt="avatar" />
                    <span title={displayName}>{displayName}</span>
                </div>
                <div className="desc">{desc}</div>
                <div className="mark">
                    <i className="fa fa-check"></i>
                </div>
            </div>
        </div>
    );
}

export default EnvCard;
