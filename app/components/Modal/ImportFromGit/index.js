import React, { Component } from 'react';
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
          {i18n.get('import.beforeKey')}
          &nbsp;
          <span className="link" onClick={this.handleKey}>SSH key</span>
          &nbsp;
          {i18n.get('import.afterKey')}
        </div>
        {this.state.showKey ? <div className="box">{this.state.key}</div> : ''}
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

  async handleImport() {
    const cloneRes = await api.gitClone({
      url: this.state.url,
      cpuLimit: 1,
      memory: 128,
      storage: 1,
    });
    console.log('clone', cloneRes);
    if (cloneRes.code !== 0) {
      notify({ message: `Import failed: ${cloneRes.msg}` });
      return;
    }
    const data = cloneRes.data;
    const wsRes = await api.createWorkspace({
      cpuLimit: 1,
      memory: 128,
      storage: 1,
      source: data.projectSource,
      ownerName: data.ownerName,
      projectName: data.projectName,
    });
    console.log('ws', wsRes);
    if (wsRes.code === 0) {
      window.open(`${window.location.href}/ws/default`, '_self');
    } else {
      notify({ message: `Import failed: ${wsRes.msg}` });
    }
  }
}

export default ImportFromGit;
