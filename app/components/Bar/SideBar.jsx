/* @flow weak */
import { connect } from 'react-redux'
import cx from 'classnames'
import _ from 'lodash'

const SideBarLabel = ({ label }) => {
  return (
    <div className='side-bar-label'>
      <div className='side-bar-label-container'>
        <div className='side-bar-label-content'>
          <i className={cx('icon', label.icon)}></i>
          <span>{label.text}</span>
        </div>
      </div>
    </div>
  )
}

const _SideBar = ({ side, labels }) => {
  return (
    <div className={'bar side-bar ' + side}>
      {labels.map(label => <SideBarLabel label={label} key={label.name}></SideBarLabel>)}
    </div>
  )
}

export default connect((state, { side }) => {
  const localPackages = state.PackageState.localPackages
  const labels = _.reduce(localPackages, (labels, pkg, pkgName) => {
    if (pkg.type === 'extension' && pkg.ui.position === side)
      labels.push({...pkg.ui.label, name: pkgName})
    return labels
  }, [])
  return { labels }
})(_SideBar)
