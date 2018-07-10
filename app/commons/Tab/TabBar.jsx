import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { observer } from 'mobx-react'
import { dnd } from 'utils'
import { defaultProps } from 'utils/decorators'
import TabLabel from './TabLabel'
import Menu from 'components/Menu'
import ContextMenu from 'components/ContextMenu'
import i18n from 'utils/createI18n'


@defaultProps(props => ({
  addTab: () => props.tabGroup.addTab(),
}))
@observer
class TabBar extends Component {
  static propTypes = {
    tabGroup: PropTypes.object.isRequired,
    contextMenuItems: PropTypes.array.isRequired,
    addTab: PropTypes.func,
    closePane: PropTypes.func,
    fullScreenActiveContent: PropTypes.bool,
    handleFullScreen: PropTypes.func,
  };

  constructor (props) {
    super(props)
    this.state = {
      showDropdownMenu: false,
      showContextMenu: false,
      contextMenuPos: {},
      contextMenuContext: null,
    }
  }

  render () {
    const {
      tabGroup,
      addTab,
      contextMenuItems,
      fullScreenActiveContent,
      handleFullScreen,
    } = this.props

    const tabBarId = `tab_bar_${tabGroup.id}`

    return (
      <div id={tabBarId}
        className='tab-bar'
        data-droppable='TABBAR'
      >
        <ul className='tab-labels'>
          {tabGroup.tabs.map(tab =>
            <TabLabel
              tab={tab}
              key={tab.id}
              openContextMenu={this.openContextMenu}
              isFullScreen={fullScreenActiveContent}
              dbClickHandler={handleFullScreen}
            />
          )}
        </ul>
        {dnd.target.id === tabBarId ? <div className='tab-label-insert-pos' /> : null}
        <div className='tab-add-btn' onClick={addTab} >
          <svg viewBox='0 0 12 16' version='1.1' aria-hidden='true'>
            <path fillRule='evenodd' d='M12 9H7v5H5V9H0V7h5V2h2v5h5z' />
          </svg>
        </div>
        <div onDoubleClick={addTab} className='tab-dbclick-area' />
        <div className='tab-show-list'
          onClick={(e) => { e.stopPropagation(); this.setState({ showDropdownMenu: true }) }}
        >
          <i className='fa fa-sort-desc' />
          {this.renderDropdownMenu()}
        </div>
        <ContextMenu
          items={contextMenuItems}
          isActive={this.state.showContextMenu}
          pos={this.state.contextMenuPos}
          context={this.state.contextMenuContext}
          deactivate={() => this.setState({ showContextMenu: false })}
        />
      </div>
    )
  }

  openContextMenu = (e, context) => {
    e.stopPropagation()
    e.preventDefault()

    this.setState({
      showContextMenu: true,
      contextMenuPos: { x: e.clientX, y: e.clientY },
      contextMenuContext: context,
    })
  }

  renderDropdownMenu () {
    if (!this.state.showDropdownMenu) return null
    const dropdownMenuItems = this.makeDropdownMenuItems()
    if (!dropdownMenuItems.length) return null
    return (<Menu className='top-down to-left'
      items={dropdownMenuItems}
      style={{ right: '2px' }}
      deactivate={e => this.setState({ showDropdownMenu: false })}
    />)
  }

  makeDropdownMenuItems = () => {
    const baseItems = this.props.closePane && this.props.tabGroup.siblings ?
    [{
      name: i18n`tab.makeDropdownMenuItems.close`,
      command: this.props.closePane,
    }]
    : []
    const tabs = this.props.tabGroup.tabs
    const tabLabelsItem = tabs && tabs.map(tab => ({
      name: tab.title || i18n`tab.makeDropdownMenuItems.untitledTab`,
      command: e => tab.activate(),
    }))

    let dropdownMenuItems
    if (tabLabelsItem.length) {
      if (!baseItems.length) return tabLabelsItem
      dropdownMenuItems = baseItems.concat({ isDivider: true }, tabLabelsItem)
    } else {
      dropdownMenuItems = baseItems
    }

    if (!dropdownMenuItems.length) {
      dropdownMenuItems = [{ name: i18n`tab.makeDropdownMenuItems.noTabs`, isDisabled: true }]
    }
    return dropdownMenuItems
  }
}

export default TabBar
