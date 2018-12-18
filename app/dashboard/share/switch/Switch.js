import React, { PureComponent } from 'react';

import './switch.css';

class Switch extends PureComponent {
    state = {
        on: this.props.on,
        loading: false,
    }

    render() {
        const { loading } = this.state;
        const { on } = this.props;
        return (
            <div className={`dash-switch${on ? ' on' : ''}${loading ? ' loading' : ''}`} onClick={this.handleClick}>
                <div className="circle">
                    <div className="moon"></div>
                </div>
            </div>
        );
    }

    handleClick = () => {
        const { on, handler } = this.props;
        this.setState({ on, loading: true });
        handler();
    }

    componentDidUpdate() {
        const { on, loading } = this.state;
        if (on !== this.props.on && loading) {
            this.setState({ loading: false });
        }
    }
}

export default Switch;
