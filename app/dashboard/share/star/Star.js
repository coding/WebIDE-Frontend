import React from 'react';

import './star.css';

const topScore = 5;
const buildArray = (num) => {
    const arr = [];
    for (let i = 1; i <= num; i++) {
        arr.push(i);
    }
    return arr;
}

const Star = ({ score }) => {
    const full = buildArray(score);
    const empty = score < topScore ? buildArray(topScore - score) : [];
    return (
        <div className="dash-star">
            {full.map(star => <i className="star fa fa-star" key={star}></i>)}
            {empty.map(star => <i className="star fa fa-star-o" key={star}></i>)}
        </div>
    );
}

export default Star;
