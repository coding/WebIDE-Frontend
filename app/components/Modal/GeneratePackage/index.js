import React, { Component } from 'react';
import { dispatchCommand } from '../../../commands';
import { notify } from '../../Notification/actions';
import api from '../../../backendAPI';

class GeneratePackage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            path: '',
        };
        this.pathHandle = this.pathHandle.bind(this);
        this.submit = this.submit.bind(this);
    }

    render() {
        return (
            <div className="plugin-upload">
                <div className="form">
                    <div className="form-group">
                        <label><span className="dot">*</span>输入路径:</label>
                        <input className="form-control account" type="text" onChange={this.pathHandle} value={this.state.path} />
                    </div>
                </div>
                <div className="control">
                    <button className="btn btn-primary" onClick={this.submit} disabled={!this.state.path}>打包</button>
                </div>
            </div>
        );
    }

    pathHandle(e) {
        const value = e.target.value;
        if (!value) {
            return;
        }
        this.setState({path: value});
    }

    submit() {
        api.generatePackage(this.state.path).then(res => {
            if (res.code === 0) {
                dispatchCommand('modal:dismiss');
            }
            notify({message: res.msg});
        });
    }
}

export default GeneratePackage;
