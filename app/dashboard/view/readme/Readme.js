import React from 'react';

import './readme.css';
import json from './readme.json';

const Readme = () => {
    return (
        <div className="dash-readme">
            {json.map((item, index) => <Row key={index} {...item} />)}
        </div>
    );
}

const Row = ({ zh, en, isHead }) => {
    return (
        <div className={isHead ? 'head' : 'line'}>{zh}</div>
    );
}

export default Readme;
