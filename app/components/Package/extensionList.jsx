import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { togglePackage, fetchPackageList } from './actions'
const Card = props => (
  <div className='card'>
    <div className='title'>
      {props.name}
      <span>{props.version}</span>
    </div>
    <div className='desc'>
      {props.desc}
    </div>
    <div className='author'>
      <div className='icon' />
      <div className='text'>
        {props.author}
      </div>
    </div>
    <div className='buttons'>
      <div className='label'>
        {/* <button>settings</button>*/}
        {/* <button>uninstall</button>*/}
        {props.requirement !== 'Required' ? (
          <button
            onClick={e => props.dispatch(togglePackage(props.name, !props.enabled))}
          >
            {props.enabled
                                ? 'disable'
                                : 'enable'}
          </button>
                        ) : null}
      </div>
    </div>
  </div>
    )

class ExtensionList extends Component {
  state = {
    searchKey: ''
  }
  componentWillMount () {
    this.props.dispatch(fetchPackageList())
  }
  render () {
    const { data, dispatch } = this.props
    return (
      <div className='settings-extension-container'>
        <div>
          <input
            type='text'
            className='search form-control'
            value={this.state.searchKey}
            placeholder='filter extension by name'
            onChange={(e) => {
              this.setState({ searchKey: e.target.value })
            }}
          />
        </div>
        <div className='lists'>
          {data
                    .filter((card) => {
                      if (this.state.searchKey) {
                        if (card.name.includes(this.state.searchKey)) {
                          return true
                        }
                        return false
                      }
                      return true
                    })
                    .map((card, idx) => (<Card {...card} dispatch={dispatch} />))
}
        </div>
      </div>
    )
  }
}

export default connect((state) => {
  const {
        PackageState: {
            localPackages = {}
        }
    } = state
  const data = Object
        .keys(localPackages)
        .map(key => ({
          name: localPackages[key].name,
          desc: localPackages[key].description,
          author: localPackages[key].author,
          version: localPackages[key].version,
          enabled: localPackages[key].enabled,
          requirement: localPackages[key].requirement
        }))
  return ({ data })
})(ExtensionList)
