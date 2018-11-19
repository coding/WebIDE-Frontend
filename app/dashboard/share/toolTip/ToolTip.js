import React, { Component } from 'react';

import './toolTip.css';

class ToolTip extends Component {
    state = {
        on: false,
    }

    render() {
        const { on } = this.state;
        const { message, placement = 'center', children } = this.props;
        return (
            <div className="dash-tooltip" onMouseEnter={this.handler} onMouseLeave={this.handler}>
                {children}
                <div className={`tooltip ${placement}${on ? ' on' : ''}`}>{message}</div>
            </div>
        );
    }

    handler = () => {
        this.setState(prevState => ({ on: !prevState.on }));
    }
}

export default ToolTip;
