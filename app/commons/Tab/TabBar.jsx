import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { dnd } from 'utils'
import { defaultProps } from 'utils/decorators'
import TabLabel from './TabLabel'
import Menu from 'components/Menu'
import ContextMenu from 'components/ContextMenu'
import i18n from 'utils/createI18n'
import * as SideBar from 'components/Panel/SideBar/actions'
import config from 'config'
import * as Panel from 'components/Panel/actions'
import panelState from 'components/Panel/state'

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
    const size = panelState.panels.get('PANEL_BOTTOM').size

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
        {(!config.isPad || tabGroup.id !== 'terminalGroup')
          && <div className='tab-show-list'
          style={{ marginBottom: '-2px' }}
          onClick={e => { 
            e.stopPropagation()
            this.setState({ showDropdownMenu: !this.state.showDropdownMenu }) 
          }}
        >
          <i className='fa fa-ellipsis-h' />
          {this.renderDropdownMenu(size)}
        </div>}
        {tabGroup.id === 'terminalGroup' &&
        <div className='tab-show-list'
          style={{ marginBottom: size ? '4px' : '-6px' }}
          onClick={e => { 
            e.stopPropagation()
            !size ? Panel.expandPanel('PANEL_BOTTOM') 
                  : Panel.shrinkPanel('PANEL_BOTTOM')
          }}
        >
          <i className={`fa fa-sort-${size ? 'desc' : 'asc'}`} />
        </div>}
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

    const rects = e.target.getBoundingClientRect()
    const isPad = config.isPad

    this.setState({
      showContextMenu: true,
      contextMenuPos: { 
        x: isPad ? rects.x : e.clientX, 
        y: isPad ? rects.y : e.clientY
      },
      contextMenuContext: context,
    })
  }

  renderDropdownMenu (size) {
    if (!this.state.showDropdownMenu) return null
    const dropdownMenuItems = this.makeDropdownMenuItems()
    if (!dropdownMenuItems.length) return null
    return (<Menu className={`${size ? 'top-down' : 'bottom-top'} to-left`}
      style={{ bottom: size ? 'initial' : '15px', right: '2px' }}
      items={dropdownMenuItems}
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
