import React from 'react';

import './projectCard.css';

const httpsReg = /http(?:s)?/;

const ProjectCard = ({ iconUrl, ownerName, name, selected, filter, handleSeleteProject }) => {
    const { seletedOwnerName, seletedProjectName } = selected;
    const src = httpsReg.test(iconUrl) ? iconUrl : `https://coding.net${iconUrl}`;
    const projectCardClass = `com-card project-card${(seletedOwnerName === ownerName && seletedProjectName === name) ? ' seleted' : ''}`;
    return (
        <div className={projectCardClass} onClick={() => handleSeleteProject({ ownerName, projectName: name })}>
            <div className="inner">
                <div className="avatar">
                    <img src={src} />
                </div>
                <div className="content">
                    <Title ownerName={ownerName} name={name} filter={filter} />
                </div>
                <div className="mark">
                    <i className="fa fa-check"></i>
                </div>
            </div>
        </div>
    );
}

const Title = ({ ownerName, name, filter }) => {
    if (filter) {
        return (
            <div className="title">
                <HighlightMatch value={ownerName} filter={filter} />
                /
                <HighlightMatch value={name} filter={filter} />
            </div>
        );
    } else {
        const title = `${ownerName}/${name}`;
        return <div className="title" title={title}>{title}</div>;
    }
}

const HighlightMatch = ({ value, filter }) => {
    const reg = new RegExp(filter, 'i');
    const match = value.match(reg);
    if (!match) {
        return <span>{value}</span>;
    }
    const index = match.index;
    let [left, center, right] = [value.slice(0, index), match[0], value.slice(index + match[0].length)];
    return (
        <span>
            {left && <span>{left}</span>}
            <span className="highlight">{center}</span>
            {right && <span>{right}</span>}
        </span>
    );
}

export default ProjectCard;
