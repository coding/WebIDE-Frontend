import React, { Component } from 'react';
import api from '../../../backendAPI';
import { dispatchCommand } from '../../../commands';
import { notify } from 'components/Notification/actions';

class ProjectFromGit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: '',
      key: '',
      showKey: '',
      projectName: '',
      ownerName: '',
    };
    this.handleUrl = this.handleUrl.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    return (
      <div className="git-project-from-git">
        <div className="title">{i18n.get('import.importGit')}</div>
        <input className="form-control" type="text" onChange={this.handleUrl} />
        <div className="tip">（请确保将<span className="link" onClick={this.handleKey}>SSH key</span>添加到了目标仓库的信任列表）</div>
        {this.state.showKey ? <div className="box">{this.state.key}</div> : ''}
        <div className="control">
          <button className="btn btn-default" onClick={this.handleCancel}>{i18n.get('modal.cancelButton')}</button>
          <button className="btn btn-primary" onClick={this.handleSubmit}>{i18n.get('modal.okButton')}</button>
        </div>
      </div>
    );
  }

  handleUrl(e) {
    const value = e.target.value;
    if (!value) {
      return;
    }
    this.setState({url: value});
  }

  handleKey() {
    if (this.state.key) {
      this.setState({showKey: !this.state.showKey});
    } else {
      api.showPublicSshKey().then(res => {
        if (res.code === 0) {
          this.setState({
            key: res.data.publicKey,
            showKey: true,
          });
        }
      });
    }
  }

  handleCancel() {
    dispatchCommand('modal:dismiss');
  }

  handleSubmit() {
    dispatchCommand('modal:dismiss');
    const url = encodeURIComponent(this.state.url);
    api.findGitProject(url).then(res => {
      if (res.code === 0) {
        api.gitClone({
          url: this.state.url,
          cpuLimit: 1,
          memory: 128,
          storage: 1,
        }).then(res => {
          if (res.code === 0) {
            return res.data;
          }
        }).then(res => {
          api.createWorkspace({
            cpuLimit: 1,
            memory: 128,
            storage: 1,
            source: res.projectSource,
            ownerName: res.ownerName,
            projectName: res.projectName,
          }).then(res => {
            console.log(res);
            if (res.code === 0) {
              notify({ message: 'Import success' });
            } else {
              notify({ message: `Import success ${res.msg}` });
            }
          });
        });
      }
    });
  }
}

export default ProjectFromGit;
