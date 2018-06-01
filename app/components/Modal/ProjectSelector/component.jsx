import React, { Component } from 'react';
import api from '../../../backendAPI';
import * as Modal from 'components/Modal/actions';
import i18n from 'utils/createI18n';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';
import * as maskActions from 'components/Mask/actions';

class ProjectSelector extends Component {
  constructor (props) {
    super(props);
    this.state = {
      allRepos: [],
      displayRepos: [],
      activeRepo: {},
      isLoading: true,
    };
  }

  componentDidMount () {
    this.handleFetch();
  }

  handleFetch = () => {
    this.setState({ isLoading: true });
    api.syncProject().then(syncRes => {
      api.fetchProjects().then(res => {
        if (res.length > 0) {
          this.setState({
            allRepos: res,
            displayRepos: res,
            activeRepo: res[0],
          });
        }
        this.setState({ isLoading: false });
      }).catch(res => {
        this.setState({ isLoading: false });
        notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
      });
    }).catch(res => {
      this.setState({ isLoading: false });
      notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
    });
  }

  handleSearch = (e) => {
    const s = e.target.value;
    if (!s) {
      this.setState({ displayRepos: this.state.allRepos });
      return;
    }
    const result = this.state.allRepos.filter(repo => repo.name.includes(s));
    this.setState({ displayRepos: result });
  }

  handleCreate = () => {
    const { activeRepo } = this.state;
    maskActions.showMask({ message: i18n`global.preparing` });
    Modal.dismissModal();
    api.findCodingProject({
      projectName: activeRepo.name,
      ownerName: activeRepo.ownerName,
    }).then(res => {
      if (res.data) {
        maskActions.hideMask();
        notify({ message: i18n`import.projectExist`, notifyType: NOTIFY_TYPE.INFO });
      } else {
        api.createWorkspace({
          cpuLimit: 1,
          memory: 128,
          storage: 1,
          source: 'Coding',
          ownerName: activeRepo.ownerName,
          projectName: activeRepo.name,
        }).then(res => {
          if (!res.code) {
            setTimeout(() => {
              maskActions.hideMask();
              window.location = `/ws/${res.spaceKey}`;
            }, 3000);
          } else {
            maskActions.hideMask();
            notify({ message: res.msg || `code: ${res.code}`, notifyType: NOTIFY_TYPE.ERROR });
          }
        }).catch(e => {
          maskActions.hideMask();
          const msg = e.response ? e.response.data.msg : e.message;
          notify({ message: msg || `code: ${e.code}`, notifyType: NOTIFY_TYPE.ERROR });
        });
      }
    });
  }

  handleCancel = () => Modal.dismissModal();

  setActiveRepo = repo => this.setState({ activeRepo: repo });

  render () {
    const { isLoading, displayRepos, activeRepo } = this.state;
    return (
      <div className="import-from-coding">
        <div className="title">{i18n`import.importCoding`}</div>
        <input className="form-control" type="text" onChange={this.handleSearch} />
        <div className="main">
          <div className="repos">
            {
              isLoading
              ?
              <div className="loading">
                <i className="fa fa-spinner fa-pulse fa-spin"></i>
                  <span>Loading...</span>
              </div>
              :
              displayRepos.map(repo => <Repo key={repo.projectId} repo={repo} activeRepo={activeRepo} setActiveRepo={this.setActiveRepo} />)
            }
          </div>
        </div>
        <div className="control">
          <button className="btn btn-default" onClick={this.handleCancel}>{i18n`modal.cancelButton`}</button>
          <button className="btn btn-primary" disabled={!activeRepo.projectId} onClick={this.handleCreate}>{i18n`modal.okButton`}</button>
        </div>
      </div>
    )
  }
}

function Repo({ repo, activeRepo, setActiveRepo }) {
  return (
    <div className={repo.projectId === activeRepo.projectId ? 'repo active' : 'repo'} onClick={() => setActiveRepo(repo)}>
      <i className='octicon octicon-repo'></i>
      <span>{repo.name}</span>
    </div>
  )
}

export default ProjectSelector;
