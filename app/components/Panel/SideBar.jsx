/* @flow weak */
import { connect } from 'react-redux'
import cx from 'classnames'
import { activateExtenstion } from '../Package/actions'
import { activateSidePanelView } from './actions'

/* shape of label
label = {
  text: String,
  icon: String,
  viewId: String,
}
*/
const SideBarLabel = ({ label, isActive, onClick }) => {
  return (
    <div className={cx('side-bar-label', {
      active: isActive
    })} onClick={onClick} >
      <div className='side-bar-label-container'>
        <div className='side-bar-label-content'>
          <i className={cx('icon', label.icon)}></i>
          <span>{label.text}</span>
        </div>
      </div>
    </div>
  )
}

const _SideBar = ({ labels=[], side, activeViewId, activateView }) => {
  return (
    <div className={'bar side-bar ' + side}>
      {labels.map((label, idx) =>
        <SideBarLabel key={label.viewId}
          label={label}
          onClick={e => activateView(label.viewId)}
          isActive={activeViewId === label.viewId}
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
    return {...label, viewId: id}
  })
  return { side, labels, activeViewId: activeExtenstionId }
}, dispatch => ({
  activateView: viewId => dispatch(activateExtenstion(viewId))
}))(_SideBar)



export const SideBar2 = connect((state, { side }) => {
  const sidePanelViews = state.PanelState.sidePanelViews[side]
  const { labels, activeViewId } = sidePanelViews
  return { side, labels, activeViewId }
}, dispatch => ({
  activateView: viewId => dispatch(activateSidePanelView(viewId))
}))(_SideBar)
