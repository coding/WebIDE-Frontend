import React, { Component } from 'react';
import { actions as Modal } from '../index';
import FileSelector from '../FileSelector';

class PluginUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            step: 1,
            account: '',
            password: '',
            submitter: '',
            department: '',
            name: '',
            description: '',
            dependency: '',
            plugin: '',
            submitable: false,
        };
        this.prevStep = this.prevStep.bind(this);
        this.nextStep = this.nextStep.bind(this);
        this.accountHandle = this.accountHandle.bind(this);
        this.passwordHandle = this.passwordHandle.bind(this);
        this.submitterHandle = this.submitterHandle.bind(this);
        this.departmentHandle = this.departmentHandle.bind(this);
        this.nameHandle = this.nameHandle.bind(this);
        this.descriptionHandle = this.descriptionHandle.bind(this);
        this.dependencyHandle = this.dependencyHandle.bind(this);
        this.generateFileSelector = this.generateFileSelector.bind(this);
        this.submit = this.submit.bind(this);
    }

    render() {
        return (
            <div className="plugin-upload">
                {
                    this.state.step === 1 ? (
                        <div>
                            <div className="title">身份验证</div>
                            <div className="title-desc">请输入插件商城的用户名和密码</div>
                            <div className="form">
                                <div className="form-group">
                                    <label>用户名:</label>
                                    <input className="form-control account" type="text" onChange={this.accountHandle} value={this.state.account} />
                                </div>
                                <div className="form-group">
                                    <label>密码:</label>
                                    <input className="form-control password" type="password" onChange={this.passwordHandle} value={this.state.password} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="title">插件上传</div>
                            <div className="title-desc">请填写插件信息并上传</div>
                            <div className="form">
                                <div className="form-group">
                                    <label>提交人:</label>
                                    <input className="form-control submitter" type="text" onChange={this.submitterHandle} value={this.state.submitter} />
                                </div>
                                <div className="form-group">
                                    <label>所属部门:</label>
                                    <input className="form-control department" type="text" onChange={this.departmentHandle} value={this.state.department} />
                                </div>
                                <div className="form-group">
                                    <label>插件名称:</label>
                                    <input className="form-control name" type="text" onChange={this.nameHandle} value={this.state.name} />
                                </div>
                                <div className="form-group">
                                    <label>插件介绍:</label>
                                    <input className="form-control description" type="text" onChange={this.descriptionHandle} value={this.state.description} />
                                </div>
                                <div className="form-group">
                                    <label>依赖插件:</label>
                                    <input className="form-control dependency" type="text" onChange={this.dependencyHandle} value={this.state.dependency} />
                                </div>
                                <div className="form-group">
                                    <input className="form-control plugin" type="text" value={this.state.plugin} readOnly />
                                    <button className="btn btn-default" onClick={this.generateFileSelector}>选择插件</button>
                                </div>
                            </div>
                        </div>
                    )
                }
                <div className="control">
                    <button className="btn btn-default" onClick={this.prevStep} disabled={this.state.step === 1}>上一步</button>
                    <button className="btn btn-default" onClick={this.nextStep} disabled={this.state.step === 2}>下一步</button>
                    <button className="btn btn-primary" onClick={this.submit} disabled={!this.state.submitable}>完成</button>
                </div>
            </div>
        )
    }

    generateFileSelector() {
        Modal.addModal('FileSelectorView', {
            title: '请选择文件',
            onlyDir: false,
        }).then(node => {
            this.setState({
                plugin: node.id,
            });
        });
    }

    prevStep() {
        this.setState({
            step: 1,
        });
    }

    nextStep() {
        this.setState({
            step: 2,
        });
    }

    accountHandle(e) {
        const value = e.target.value.trim();
        this.setState({
            account: value,
        });
        if (value && this.state.password && this.state.submitter && this.state.department && this.state.name && this.state.description && this.state.dependency && this.state.plugin) {
            this.setState({
                submitable: true,
            });
        } else {
            this.setState({
                submitable: false,
            });
        }
    }

    passwordHandle(e) {
        const value = e.target.value.trim();
        this.setState({
            password: value,
        });
        if (value && this.state.account && this.state.submitter && this.state.department && this.state.name && this.state.description && this.state.dependency && this.state.plugin) {
            this.setState({
                submitable: true,
            });
        } else {
            this.setState({
                submitable: false,
            });
        }
    }

    submitterHandle(e) {
        const value = e.target.value.trim();
        this.setState({
            submitter: value,
        });
        if (value && this.state.account && this.state.password && this.state.department && this.state.name && this.state.description && this.state.dependency && this.state.plugin) {
            this.setState({
                submitable: true,
            });
        } else {
            this.setState({
                submitable: false,
            });
        }
    }

    departmentHandle(e) {
        const value = e.target.value.trim();
        this.setState({
            department: value,
        });
        if (value && this.state.account && this.state.password && this.state.submitter && this.state.name && this.state.description && this.state.dependency && this.state.plugin) {
            this.setState({
                submitable: true,
            });
        } else {
            this.setState({
                submitable: false,
            });
        }
    }

    nameHandle(e) {
        const value = e.target.value.trim();
        this.setState({
            name: value,
        });
        if (value && this.state.account && this.state.password && this.state.submitter && this.state.department && this.state.description && this.state.dependency && this.state.plugin) {
            this.setState({
                submitable: true,
            });
        } else {
            this.setState({
                submitable: false,
            });
        }
    }

    descriptionHandle(e) {
        const value = e.target.value.trim();
        this.setState({
            description: value,
        });
        if (value && this.state.account && this.state.password && this.state.submitter && this.state.department && this.state.name && this.state.dependency && this.state.plugin) {
            this.setState({
                submitable: true,
            });
        } else {
            this.setState({
                submitable: false,
            });
        }
    }

    dependencyHandle(e) {
        const value = e.target.value.trim();
        this.setState({
            dependency: value,
        });
        if (value && this.state.account && this.state.password && this.state.submitter && this.state.department && this.state.name && this.state.description && this.state.plugin) {
            this.setState({
                submitable: true,
            });
        } else {
            this.setState({
                submitable: false,
            });
        }
    }

    submit() {
        console.log(this.state);
    }
}

export default PluginUpload;
