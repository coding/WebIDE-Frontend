import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { syncProject, fetchProjects } from 'backendAPI/projectAPI'
import notification from 'components/Notification'

class ImportFromCoding extends PureComponent {
  static propTypes = {
    setActiveRepo: PropTypes.func,
    activeRepo: PropTypes.object
  }
  state = {
    allRepos: [],
    displayRepos: [],
    activeRepo: {},
    isLoading: true
  }

  componentDidMount () {
    this.handleFetch()
  }

  handleSearch = (e) => {
    const s = e.target.value
    if (!s) {
      this.setState({ displayRepos: this.state.allRepos })
      return
    }
    const result = this.state.allRepos.filter(repo => repo.name.includes(s))
    this.setState({ displayRepos: result })
  }

  handleFetch = () => {
    this.setState({ isLoading: true })
    syncProject()
      .then(fetchProjects)
      .then((res) => {
        if (res.length > 0) {
          this.setState({
            allRepos: res,
            displayRepos: res
          })
          this.props.setActiveRepo(res[0])
        }
      })
      .catch((res) => {
        notification.error({
          description: res.msg
        })
      })
      .finally(() => {
        this.setState({ isLoading: false })
      })
  }

  render () {
    const { setActiveRepo, activeRepo } = this.props
    const { isLoading, displayRepos } = this.state

    return (
      <div className='import-from-coding'>
        <input
          className='form-control'
          type='text'
          placeholder={i18n.get('import.placeholder')}
          onChange={this.handleSearch}
        />
        <div className='main'>
          <div className='repos'>
            {isLoading ? (
              <div className='loading'>
                <i className='fa fa-spinner fa-pulse fa-spin' />
                <span>{i18n`global.loading`}</span>
              </div>
            ) : (
              displayRepos.map(repo => (
                <Repo
                  key={repo.projectId}
                  repo={repo}
                  activeRepo={activeRepo}
                  setActiveRepo={setActiveRepo}
                />
              ))
            )}
          </div>
        </div>
      </div>
    )
  }
}

const Repo = ({ repo, activeRepo, setActiveRepo }) => (
  <div
    className={repo.projectId === activeRepo.projectId ? 'repo active' : 'repo'}
    onClick={() => setActiveRepo(repo)}
  >
    <i className='octicon octicon-repo' />
    <span>{repo.name}</span>
  </div>
)

export default ImportFromCoding
