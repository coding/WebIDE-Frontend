import React, { Component } from 'react';

import './projectCard.css';

const httpsReg = /http(?:s)?/;

class ProjectCard extends Component {
    render() {
        const { iconUrl, ownerName, name, projectName, filter, handleSeleteProject } = this.props;
        const src = httpsReg.test(iconUrl) ? iconUrl : `https://coding.net${iconUrl}`;
        return (
            <div className={`com-card project-card${projectName === name ? ' seleted' : ''}`} onClick={() => handleSeleteProject({ ownerName, projectName: name })}>
                <div className="inner">
                    <div className="avatar">
                        <img src={src} />
                    </div>
                    <div className="content">
                        <div className="title">{`${ownerName}/${name}`}</div>
                    </div>
                    <div className="mark">
                        <i className="fa fa-check"></i>
                    </div>
                </div>
            </div>
        );
    }
}

export default ProjectCard;
