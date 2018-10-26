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

/*
 * 0.0分到0.0分 0颗星
 * 0.1分到1.4分 1颗星
 * 1.5分到2.4分 2颗星
 * 2.5分到3.4分 3颗星
 * 3.5分到4.4分 4颗星
 * 4.5分到5.0分 5颗星
 */
const Star = ({ score }) => {
    const round = score % 1 >= 0.5;
    const integer = Number.parseInt(score);
    const m = round ? integer + 1 : integer;
    const n = score === 0 ? 0 : m === 0 ? m + 1 : m;
    const full = buildArray(n);
    const empty = buildArray(topScore - n);
    return (
        <div className="dash-star">
            {full.map(star => <i className="star fa fa-star" key={star}></i>)}
            {empty.map(star => <i className="star fa fa-star-o" key={star}></i>)}
        </div>
    );
}

export default Star;
