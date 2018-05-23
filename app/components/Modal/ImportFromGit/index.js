import React, { Component } from 'react';
import Clipboard from 'clipboard';
import api from '../../../backendAPI';
import { dispatchCommand } from '../../../commands';
import { notify } from 'components/Notification/actions';

class ImportFromGit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: '',
      showWarn: false,
      key: '',
      showKey: false,
    };
    this.handleUrl = this.handleUrl.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    return (
      <div className="import-from-git">
        <div className="title">{i18n.get('import.importGit')}</div>
        <div className="form">
          <input className="form-control" type="text" onChange={this.handleUrl} onKeyUp={this.handleEnter} />
          {this.state.showWarn ? <span className="warn">!</span> : ''}
        </div>
        <div className="tip">
          <span>
            {i18n.get('import.beforeKey')}
            &nbsp;
            <span className="link" onClick={this.handleKey}>SSH key</span>
            &nbsp;
            {i18n.get('import.afterKey')}
          </span>
          <span></span>
        </div>
        {
          this.state.showKey
          ?
          <div className="box">
            <i className="clipboard fa fa-copy"></i>
            {this.state.key}
          </div>
          :
          ''
        }
        <div className="control">
          <button className="btn btn-default" onClick={this.handleCancel}>{i18n.get('modal.cancelButton')}</button>
          <button className="btn btn-primary" onClick={this.handleSubmit}>{i18n.get('modal.okButton')}</button>
        </div>
      </div>
    );
  }

  componentDidMount() {
    api.showPublicSshKey().then(res => {
      if (res.code === 0) {
        this.setState({ key: res.data.publicKey });
      } else {
        this.setState({ key: i18n.get('import.fetchKeyFailed') });
      }
    });
    const clipboard = new Clipboard('.clipboard', {
      text: trigger => trigger.parentElement.innerText,
    });
    clipboard.on('success', (e) => {
      notify({message: i18n.get('import.copyKeySuccess')});
    });
    clipboard.on('error', (e) => {
      notify({message: i18n.get('import.copyKeyFailed')});
    });
  }

  handleUrl(e) {
    const value = e.target.value;
    if (!value) {
      return;
    }
    if (!value.startsWith('git')) {
      this.setState({ showWarn: true });
    } else {
      this.setState({ showWarn: false });
    }
    this.setState({ url: value });
  }

  handleKey() {
    this.setState({ showKey: !this.state.showKey });
  }

  handleCancel() {
    dispatchCommand('modal:dismiss');
  }

  handleEnter(e) {
    if (e.keyCode === 13) {
      this.handleSubmit();
    }
  }

  handleSubmit() {
    if (this.state.showWarn) {
      return;
    }
    dispatchCommand('modal:dismiss');
    this.handleImport();
  }

  handleImport() {
    api.gitClone({
      url: this.state.url,
      cpuLimit: 1,
      memory: 128,
      storage: 1,
    }).then(res => {
      if (res.data) {
        window.open(`/ws/${res.data.spaceKey}`, '_self');
      } else {
        notify({ message: `Import failed: ${res.msg}` });
      }
    }).catch(res => {
      notify({ message: `Import failed: ${res.msg}` });
    });
  }
}

export default ImportFromGit;
