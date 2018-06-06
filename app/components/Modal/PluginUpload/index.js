import React, { Component } from 'react';
import { actions as Modal } from '../index';
import FileSelector from '../FileSelector';
import { dispatchCommand } from '../../../commands';
import { notify } from '../../Notification/actions';
import api from '../../../backendAPI';

class PluginUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            step: 1,
            accountVerified: false,
            account: '',
            password: '',
            name: '',
            version: '',
            intro: '',
            type: '',
            dependency: '',
            big: '',
            small: '',
            bigTip: '',
            smallTip: '',
            plugins: [],
            dependenceFile: '',
            submitable: false,
        };
        this.form = ['account', 'password', 'name', 'version', 'intro', 'big', 'small', 'plugins'];
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
                                    <label><span className="dot">*</span>用户名:</label>
                                    <input className="form-control account" type="text" onChange={this.accountHandle} value={this.state.account} />
                                </div>
                                <div className="form-group">
                                    <label><span className="dot">*</span>密码:</label>
                                    <input className="form-control password" type="password" onChange={this.passwordHandle} onKeyUp={this.accountEnterHandle} value={this.state.password} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="title">插件上传</div>
                            <div className="title-desc">请填写插件信息并上传</div>
                            <div className="form">
                                <div className="form-group">
                                    <label><span className="dot">*</span>插件名称:</label>
                                    <input className="form-control name" type="text" onChange={this.nameHandle} value={this.state.name} />
                                </div>
                                <div className="form-group">
                                    <label><span className="dot">*</span>版本号:</label>
                                    <input className="form-control version" type="text" onChange={this.versionHandle} value={this.state.version} />
                                </div>
                                <div className="form-group">
                                    <label><span className="dot">*</span>插件介绍:</label>
                                    <textarea className="form-control intro" type="text" onChange={this.introHandle} value={this.state.intro}></textarea>
                                </div>
                                <div className="form-group">
                                    <label><span className="dot">*</span>插件类型:</label>
                                    <select className="form-control" onChange={this.typeHandle} value={this.state.type.name}>
                                        {
                                            this.pluginTypeList.map(item => <option key={item.id}>{item.name}</option>)
                                        }
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>依赖插件:</label>
                                    <textarea className="form-control dependency" onChange={this.dependencyHandle} value={this.state.dependency}></textarea>
                                </div>
                                <div className="form-group type">
                                    <span className="dot">*</span>
                                    <button className="btn btn-default" onClick={this.generateFileSelector}>选择插件(可多次选择)</button>
                                    <br/>
                                    <br/>
                                    <div className="plugin-tag-box">
                                        {
                                            this.state.plugins.map((value, index) => <PluginTag key={index} name={value} delete={this.deletePluginTag} />)
                                        }
                                    </div>
                                </div>
                                <div className="form-group upload-logo">
                                    <div className="upload-item">
                                        <label><span className="dot">*</span>上传插件大图(250*150):</label>
                                        <input className="form-control big" type="file" onChange={this.bigLogoHandle} accept="image/png,image/jpg,image/jpeg" />
                                        <div className="logo-wrap big-wrap" ref="big"></div>
                                        <div className="logo-tip">{this.state.bigTip}</div>
                                    </div>
                                    <div className="upload-item">
                                        <label><span className="dot">*</span>上传插件小图(24*24):</label>
                                        <input className="form-control small" type="file" onChange={this.smallLogoHandle} accept="image/png,image/jpg,image/jpeg" />
                                        <div className="logo-wrap small-wrap" ref="small"></div>
                                        <div className="logo-tip">{this.state.smallTip}</div>
                                    </div>
                                </div>
                                <div className="form-group upload-dependence">
                                    <label><span className="dot">*</span>上传依赖</label>
                                    <input className="form-control" type="file" onChange={this.dependenceHandle} />
                                </div>
                            </div>
                        </div>
                    )
                }
                <div className="control">
                    <button className="btn btn-default" onClick={this.prevStep} disabled={this.state.step === 1}>上一步</button>
                    <button className="btn btn-default" onClick={this.nextStep} disabled={this.state.step === 2}>下一步</button>
                    <button className="btn btn-primary" onClick={this.submit} disabled={!this.state.submitable}>上传</button>
                </div>
            </div>
        )
    }

    componentWillMount() {
        api.getPluginType().then(res => {
            if (res && res.pluginTypeList) {
                const pluginTypeList = res.pluginTypeList;
                const list = [];
                for (let i = 0, n = pluginTypeList.length; i < n; i++) {
                    const item = pluginTypeList[i];
                    list.push({id: item.ID, name: item.TYPE_NAME});
                }
                this.pluginTypeList = list;
                this.setState({type: this.pluginTypeList[0]});
            } else {
                notify({message: res.msg || '获取插件类型失败'});
            }
        });
    }

    prevStep = () => {
        this.setState({
            step: 1,
        });
    }

    nextStep = () => {
        if (this.state.accountVerified) {
            this.setState({
                step: 2,
            });
            return;
        }
        api.checkGuoruiLogin({
            username: this.state.account,
            password: this.state.password,
        }).then((res) => {
            if (res.code && res.code === 1) {
                this.setState({
                    step: 2,
                    accountVerified: true,
                });
                notify({message: '登录成功'});
            } else {
                notify({message: '用户名或者密码错误，请重新登录'});
            }
        });
    }

    accountHandle = (e) => {
        const value = e.target.value.trim();
        this.setState({
            account: value,
        });
        if (this.verifyForm(value, 'account')) {
            this.setState({
                submitable: true,
            });
        } else {
            this.setState({
                submitable: false,
            });
        }
    }

    passwordHandle = (e) => {
        const value = e.target.value.trim();
        this.setState({
            password: value,
        });
        if (this.verifyForm(value, 'password')) {
            this.setState({
                submitable: true,
            });
        } else {
            this.setState({
                submitable: false,
            });
        }
    }

    accountEnterHandle = (e) => {
        if (e.keyCode === 13) {
            this.nextStep();
        }
    }

    nameHandle = (e) => {
        const value = e.target.value.trim();
        this.setState({
            name: value,
        });
        if (this.verifyForm(value, 'name')) {
            this.setState({
                submitable: true,
            });
        } else {
            this.setState({
                submitable: false,
            });
        }
    }

    versionHandle = (e) => {
        const value = e.target.value.trim();
        this.setState({
            version: value,
        });
        if (this.verifyForm(value, 'version')) {
            this.setState({
                submitable: true,
            });
        } else {
            this.setState({
                submitable: false,
            });
        }
    }

    introHandle = (e) => {
        const value = e.target.value.trim();
        this.setState({
            intro: value,
        });
        if (this.verifyForm(value, 'intro')) {
            this.setState({
                submitable: true,
            });
        } else {
            this.setState({
                submitable: false,
            });
        }
    }

    typeHandle = (e) => {
        const value = e.target.value.trim();
        const item = this.pluginTypeList.filter((item) => {
            return item.name === value;
        })[0];
        this.setState({
            type: item,
        });
    }

    dependencyHandle = (e) => {
        const value = e.target.value.trim();
        this.setState({
            dependency: value,
        });
    }

    bigLogoHandle = (e) => {
        const file = e.target.files[0];
        if (file.size > 102400) {
            this.setState({bigTip: '插件大图不能大于100K，请重新上传'});
            return;
        } else {
            this.setState({bigTip: ''});
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const div = this.refs.big;
            const img = document.createElement('img');
            const data = e.target.result;
            img.src = data;
            div.appendChild(img);
            this.setState({big: file});
            if (this.verifyForm(file, 'big')) {
                this.setState({
                    submitable: true,
                });
            } else {
                this.setState({
                    submitable: false,
                });
            }
        }
    }

    smallLogoHandle = (e) => {
        const file = e.target.files[0];
        if (file.size > 10240) {
            this.setState({smallTip: '插件小图不能大于10K，请重新上传'});
            return;
        } else {
            this.setState({smallTip: ''});
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const div = this.refs.small;
            const img = document.createElement('img');
            const data = e.target.result;
            img.src = data;
            div.appendChild(img);
            this.setState({small: file});
            if (this.verifyForm(file, 'small')) {
                this.setState({
                    submitable: true,
                });
            } else {
                this.setState({
                    submitable: false,
                });
            }
        }
    }

    dependenceHandle = (e) => {
        const file = e.target.files[0];
        this.setState({
            dependenceFile: file,
        });
    }

    generateFileSelector = () => {
        Modal.addModal('FileSelectorView', {
            title: '请选择文件',
            onlyDir: false,
        }).then(node => {
            dispatchCommand('modal:dismiss');
            const tags = this.state.plugins;
            const item = node.id;
            if (tags.includes(item)) {
                return;
            }
            tags.push(item);
            this.setState({
                plugins: tags,
            });
            if (this.verifyForm(tags, 'plugins')) {
                this.setState({
                    submitable: true,
                });
            } else {
                this.setState({
                    submitable: false,
                });
            }
        });
    }

    deletePluginTag = (name) => {
        const tags = this.state.plugins;
        for (let i = 0, n = tags.length; i < n; i++) {
            if (tags[i] === name) {
                tags.splice(i, 1);
                this.setState({
                    plugins: tags,
                });
                if (this.verifyForm(tags, 'plugins')) {
                    this.setState({
                        submitable: true,
                    });
                } else {
                    this.setState({
                        submitable: false,
                    });
                }
                break;
            }
        }
    }

    verifyForm(value, exclude) {
        for (let key in this.state) {
            if (this.state.hasOwnProperty(key) && this.form.includes(key) && key !== exclude) {
                if (!this.state[key] || this.state[key].length === 0) {
                    return false;
                }
            }
        }
        if (!value || value.length === 0) {
            return false;
        }
        return true;
    }

    submit = () => {
        const formdata = new FormData();
        formdata.append('username', this.state.account);
        formdata.append('password', this.state.password);
        formdata.append('jarName', this.state.name);
        formdata.append('version', this.state.version);
        formdata.append('intro', this.state.intro);
        formdata.append('type', this.state.type.id);
        formdata.append('dependence', this.state.dependency);
        formdata.append('jarPath', this.state.plugins.join(','));
        formdata.append('bigLogo', this.state.big);
        formdata.append('smallLogo', this.state.small);
        formdata.append('dependenceJar', this.state.dependenceFile);
        formdata.append('pluginSource', 2);
        api.uploadPlugin(formdata).then(res => {
            if (res.code === 1) {
                notify({message: '上传成功'});
                dispatchCommand('modal:dismiss');
            } else {
                notify({message: res.msg});
            }
        });
    }
}

class PluginTag extends Component {
    render() {
        return (
            <div className="plugin-tag">
                <span className="tag-name">{this.props.name}</span>
                <span className="tag-close" onClick={this.delete}><i className="fa fa-close"></i></span>
            </div>
        );
    }

    delete = () => {
        this.props.delete(this.props.name);
    }
}

export default PluginUpload;
