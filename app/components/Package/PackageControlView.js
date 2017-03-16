import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { fetchPackageList, fetchPackage, togglePackage } from './actions'
import _ from 'lodash'

class PackageControlView extends Component {
  static propTypes = {
    remotePackages: PropTypes.array,
    localPackages: PropTypes.object,
    dispatch: PropTypes.func,
  }

  componentWillMount () {
    this.props.dispatch(fetchPackageList())
  }

  render () {
    const { remotePackages, localPackages, dispatch } = this.props
    return (
      <div name='container'>
        <div name='remote_extensions'>
          <h3>Available Packages:</h3>
          {_.map(remotePackages, pkg =>
            <div key={pkg.name} style={{ display: 'flex' }}>
              <div>插件名字: {pkg.displayName || pkg.name}</div>
              {false && localPackages[pkg.name]
                ? <button disabled >Installed</button>
                : <button onClick={e => dispatch(fetchPackage(pkg.name, pkg.version))}>
                    Install
                  </button>
              }
            </div>
          )}
        </div>
        <div name='local_packages'>
          <div name='enabled'>
            <h3>Installed Packages:</h3>
            {_.map(localPackages, pkg =>
              <div key={pkg.name} style={{ display: 'flex' }}>
                <div>name: {pkg.name}</div>
                <label><input
                  type='checkbox'
                  onChange={e => dispatch(togglePackage(pkg.name, e.target.checked))}
                  checked={pkg.enabled}
                />
                enabled
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}


export default connect(state => {
  const {
    PackageState: { remotePackages, localPackages }
  } = state
  return ({
    remotePackages,
    localPackages
  })
}
)(PackageControlView)
