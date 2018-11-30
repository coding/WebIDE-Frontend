import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PluginArea from 'components/Plugins/component'
import { SIDEBAR } from 'components/Plugins/constants'
import { observer } from 'mobx-react'
import { toggleSidePanelView } from './actions'


/* shape of label
label = {
  text: String,
  icon: String,
  viewId: String,
  onlyIcon: Boolean
}
*/

class SideBarLabel extends Component {
  state = {
    originWidth: 0,
    width: 'auto',
  }
  textRef = null;

  render() {
    const { width } = this.state;
    const { label, isActive, onClick } = this.props;
    return (
      <div className={`side-bar-label${isActive ? ' active' : ''}`} onClick={onClick}>
        <div className='side-bar-label-container'>
          <div className="side-bar-label-content" onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
            <i className={`icon${label.icon ? ` ${label.icon}` : ''}`} />
            <span className="text" ref={this.handleTextRef} style={{ width }}>{label.text}</span>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.computeOriginWidth();
  }

  componentDidUpdate() {
    this.computeOriginWidth();
  }

  computeOriginWidth() {
    if (this.props.label.onlyIcon && this.state.width === 'auto') {
      const originWidth = this.textRef.getBoundingClientRect().height;
      this.setState({ originWidth, width: 0 });
    }
  }

  handleTextRef = (ref) => {
    this.textRef = ref;
  }

  mouseEnter = () => {
    if (this.props.label.onlyIcon) {
      this.setState({ width: this.state.originWidth });
    }
  }

  mouseLeave = () => {
    if (this.props.label.onlyIcon) {
      this.setState({ width: 0 });
    }
  }
}

SideBarLabel.propTypes = {
  isActive: PropTypes.bool,
  onClick: PropTypes.func
}

const SideBar = observer(({ side }) => (
  <div className="side-bar-container">
    <PluginArea
      className={`bar side-bar ${side}`}
      position={SIDEBAR[side.toUpperCase()]}
      filter={plugin => !plugin.status.hidden}
      getChildView={plugin => (
        <SideBarLabel
          key={plugin.viewId}
          label={plugin.label}
          onClick={() => toggleSidePanelView(plugin.viewId)}
          isActive={plugin.status.get('active')}
        />
        )}
    />
  </div>))


SideBar.propTypes = {
  // labels: labelsShape,
  side: PropTypes.string,
  activeViewId: PropTypes.string,
  activateView: PropTypes.func
}


export default SideBar
