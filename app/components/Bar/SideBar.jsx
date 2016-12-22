/* @flow weak */
import { connect } from 'react-redux'
import cx from 'classnames'
import { activateExtenstion } from '../Package/actions'

const SideBarLabel = ({ label, isActive, onClick }) => {
  return (
    <div className='side-bar-label' onClick={onClick} >
      <div className='side-bar-label-container'>
        <div className='side-bar-label-content'>
          <i className={cx('icon', label.icon)}></i>
          <span>{label.text}</span>
        </div>
      </div>
    </div>
  )
}

const _SideBar = ({ labels, side, activeExtenstionId, dispatch }) => {
  return (
    <div className={'bar side-bar ' + side}>
      {labels.map((label, idx) =>
        <SideBarLabel key={label.packageId}
          label={label}
          onClick={e => dispatch(activateExtenstion(label.packageId))}
          isActive={activeExtenstionId ? activeExtenstionId === label.packageId : idx === 0}
        />
      )}
    </div>
  )
}

export default connect((state, { side }) => {
  const localPackages = state.PackageState.localPackages
  const { extensionIds, activeExtenstionId } = state.PackageState.extensionsUIState.panels[side]
  const labels = extensionIds.map(id => {
    let label = localPackages[id].ui.label
    return {...label, packageId: id}
  })
  return { labels, activeExtenstionId }
})(_SideBar)
