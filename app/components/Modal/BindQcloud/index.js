import React, { Component } from 'react';
import api from '../../../backendAPI';
import { dispatchCommand } from '../../../commands';

class BindQcloud extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pwd: '',
    };
    this.handlePwd = this.handlePwd.bind(this);
    this.handleEnterKey = this.handleEnterKey.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  handlePwd(e) {
    const value = e.target.value;
    if (!value) {
      return;
    }
    this.setState({pwd: value});
  }

  handleEnterKey(e) {
    if (e.keyCode === 13) {
      this.handleSubmit();
    }
  }

  handleSubmit() {
    api.bindQcloud({
      twoFactorCode: this.state.pwd,
      returnUrl: 'https://studio.coding.net',
    }).then(res => {
      if (res && res.code === 0) {
        window.open(decodeURIComponent(res.data), '_self');
      }
    });
  }

  handleCancel() {
    dispatchCommand('modal:dismiss');
  }

  render() {
    return (
      <div className="bind-qcloud-modal">
        <div className="title">{i18n.get('modal.pwdRequired')}</div>
        <div className="warn"><i className="fa fa-warning"></i>&nbsp;{i18n.get('modal.dangerousOperation')}</div>
        <div><input type="password" onChange={this.handlePwd} onKeyUp={this.handleEnterKey} /></div>
        <div><button className="submit" onClick={this.handleSubmit}>{i18n.get('modal.okButton')}</button></div>
        <div><button className="cancel" onClick={this.handleCancel}>{i18n.get('modal.cancelButton')}</button></div>
      </div>
    );
  }
}

export default BindQcloud;
