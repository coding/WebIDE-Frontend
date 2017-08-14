import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as GitActions from '../Git/actions'
import moment from 'moment'
import { Table, Column, Cell } from 'fixed-data-table-2'
import cx from 'classnames'
import ContextMenu from '../ContextMenu'
import { emitter, E } from 'utils'
import i18n from 'utils/createI18n'


const items = [
  {
    name: i18n`git.historyView.compare`,
    icon: '',
    command: 'git:history:compare'
  }, {
    name: i18n`git.historyView.compareWithLocal`,
    icon: '',
    command: 'git:history:compare_local'
  }, {
    name: i18n`git.historyView.listChanges`,
    // icon: 'fa fa-files-o',
    icon: '',
    command: 'git:history:all_effected'
  }, {
    name: <span className='clipboard'>{i18n`git.historyView.copyRevision`}</span>,
    // icon: 'fa fa-clipboard',
    icon: '',
  }
]


const TextCell = ({rowIndex, data, columnKey, selectedRow, onContextMenu, ...props}) => (
  <Cell {...props}
    onContextMenu={e => onContextMenu(e, rowIndex, data)}
    className={cx({selected: rowIndex == selectedRow})}
  >
    {data[rowIndex][columnKey]}
  </Cell>
);

class History extends Component {
  constructor (props) {
    super(props)
    this.state = {
      path: this.props.focusedNode ? this.props.focusedNode.path : '/',
      page: 0,
      size: this.props.history.size,
      isEnd: this.props.history.isEnd,
      selectedRow: 0,
      tableHeight: 0,
      tableWidth: 0,
      historyRows: this.parseRows(this.props.history.data),
      columnWidths: {
        shortName: 100,
        commitTime: 200,
        author: 160,
        shortMessage: 400
      },
      isLoading: false,
      clipboard: null
    }

    this.rowGetter = this.rowGetter.bind(this)
    this._onColumnResizeEndCallback = this._onColumnResizeEndCallback.bind(this)
    this.fitHistoryTable = this.fitHistoryTable.bind(this)
    this._onRowClick = this._onRowClick.bind(this)
    this._onScrollEnd = this._onScrollEnd.bind(this)
    this.fetchHistory = this.fetchHistory.bind(this)
    this._onRowDoubleClick = this._onRowDoubleClick.bind(this)
    this._onRowContextMenu = this._onRowContextMenu.bind(this)
  }

  componentWillMount () {
    emitter.on(E.PANEL_RESIZED, this.fitHistoryTable)
  }
  componentDidMount () {
    this.fetchHistory({ reset: true })
    this.fitHistoryTable()
  }

  componentWillUnmount () {
    emitter.removeListener(E.PANEL_RESIZED, this.fitHistoryTable)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.history !== this.props.history) {
      this.setState({
        historyRows: this.parseRows(nextProps.history.data),
        // page: this.props.history.page,
        size: this.props.history.size,
        isEnd: this.props.history.isEnd,
        isLoading: false
      })
      this.fitHistoryTable()
    }
    if (nextProps.focusedNode && nextProps.focusedNode.path !== this.state.path) {
      this.state.path = nextProps.focusedNode ? nextProps.focusedNode.path : '/'
      this.fetchHistory({ reset: true })
    }
  }

  fitHistoryTable () {
    setTimeout(() => {
      if (this.historyDOM.clientWidth > 0) {
        this.setState({
          tableHeight: this.historyDOM.clientHeight - 22,
          tableWidth: this.historyDOM.clientWidth
        })
      }
    }, 0)
  }

  render () {
    const { focusedNode, openContextMenu, closeContextMenu } = this.props
    const { contextMenu } = this.props.history
    return (
      <div className='ide-history' ref={(dom) => this.historyDOM = dom}>
        <div className='history-container'>
          <div className='history-title'>
            History: {focusedNode ? focusedNode.path : '/'}
          </div>
          <div className='history-table' ref={(table) => { this.historyTable = table }}>
            <Table
              rowHeight={24}
              onColumnResizeEndCallback={this._onColumnResizeEndCallback}
              onRowClick={this._onRowClick}
              onRowDoubleClick={this._onRowDoubleClick}
              onScrollEnd={this._onScrollEnd}
              isColumnResizing={false}
              rowsCount={this.state.historyRows.length}
              maxHeight={this.state.tableHeight}
              width={this.state.tableWidth}
              height={this.state.tableHeight}
              headerHeight={24}
            >
              <Column
                columnKey="shortName"
                header={<Cell>{i18n`git.historyView.version`}</Cell>}
                cell={
                  <TextCell
                    data={this.state.historyRows}
                    selectedRow={this.state.selectedRow}
                    onContextMenu={this._onRowContextMenu}
                  />
                }
                isResizable={true}
                width={this.state.columnWidths.shortName}
              >
              </Column>
              <Column
                columnKey="commitTime"
                header={<Cell>{i18n`git.historyView.date`}</Cell>}
                // cell={this.renderCell}
                cell={
                  <TextCell
                    data={this.state.historyRows}
                    selectedRow={this.state.selectedRow}
                    onContextMenu={this._onRowContextMenu}
                  />
                }
                isResizable={true}
                width={this.state.columnWidths.commitTime}
              >
              </Column>
              <Column
                columnKey="author"
                header={<Cell>{i18n`git.historyView.author`}</Cell>}
                // cell={this.renderCell}
                cell={
                  <TextCell
                    data={this.state.historyRows}
                    selectedRow={this.state.selectedRow}
                    onContextMenu={this._onRowContextMenu}
                  />
                }
                isResizable={true}
                width={this.state.columnWidths.author}
              >
              </Column>
              <Column
                columnKey="shortMessage"
                header={<Cell>{i18n`git.historyView.message`}</Cell>}
                // cell={this.renderCell}
                cell={
                  <TextCell
                    data={this.state.historyRows}
                    selectedRow={this.state.selectedRow}
                    onContextMenu={this._onRowContextMenu}
                  />
                }
                isResizable={true}
                width={this.state.columnWidths.shortMessage}
              >
              </Column>
            </Table>
          </div>
        </div>
        <ContextMenu
          items={items}
          isActive={contextMenu.isActive}
          pos={contextMenu.pos}
          context={contextMenu.contextNode}
          deactivate={closeContextMenu}
        />
      </div>
    )
  }

  _onColumnResizeEndCallback (newColumnWidth, columnKey) {
    this.setState(({ columnWidths }) => ({
      columnWidths: {
        ...columnWidths,
        [columnKey]: newColumnWidth,
      }
    }))
  }

  _onRowClick (e, rowIndex, rowData) {
    this.setState({ selectedRow: rowIndex })
  }

  _onRowDoubleClick (e, rowIndex, rowData) {
    const data = this.rowGetter(rowIndex)
    if (!this.props.focusedNode || this.props.focusedNode.isDir) {
      this.props.gitCommitDiff({
        rev: data.shortName,
        title: i18n`git.historyView.showCommit`,
        oldRef: `${data.shortName}^`
      })
    } else {
      this.props.diffFile({
        path: this.props.focusedNode.path,
        newRef: data.shortName,
        oldRef: `${data.shortName}^`
      })
    }
  }

  _onRowContextMenu (e, rowIndex, rowData) {
    this.setState({ selectedRow: rowIndex })
    items[0].visible = () => !(!this.props.focusedNode || this.props.focusedNode.isDir)
    const data = this.rowGetter(rowIndex)
    data.focusedNode = this.props.focusedNode
    this.props.openContextMenu(e, data)
  }

  _onScrollEnd (x, y) {
    const scrollbar = this.historyTable.childNodes[0].childNodes[1]
    const scrollbarH = parseInt(scrollbar.style.height, 10)
    const scrollbarFace = scrollbar.childNodes[0]
    const scrollbarFaceH = parseInt(scrollbarFace.style.height, 10)
    const scrollTop = parseInt(scrollbarFace.style.transform.split('px, ')[1], 10)
    if ((scrollTop + scrollbarFaceH + 14) >= scrollbarH) {
      if (!this.state.isLoading && !this.state.isEnd) {
        this.setState({
          page: this.state.page + 1
        })
        this.fetchHistory({ reset: false })
      }
    }
  }

  parseRows (data) {
    const rows = []
    data.map((item, i) => {
      const row = {
        shortName: item.shortName,
        commitTime: moment(item.commitTime, 'X').format('YYYY/MM/DD HH:mm:ss'),
        author: item.commiterIdent.name,
        shortMessage: item.shortMessage,
        name: item.name
      }
      return rows.push(row)
    })
    return rows
  }

  renderCell (selectedRow, cellData, cellDataKey, rowData, rowIndex, columnData, width) {
    return (
      <div
        onContextMenu={((_this) => {
          return (e) => (_this._onRowContextMenu(e, rowIndex, rowData))
        })(this)}
        className={cx({ selected: rowIndex === selectedRow })}
      >
        cellData
      </div>
    )
  }

  rowGetter (rowIndex) {
    return this.state.historyRows[rowIndex]
  }

  fetchHistory ({ reset=false }) {
    this.setState({
      isLoading: true
    })
    if (reset) {
      this.state.page = 0
    }
    this.props.fetchHistory({
      path: this.state.path,
      size: this.state.size,
      page: this.state.page,
      reset
    })
  }
}

History.propTypes = {
  fetchHistory: PropTypes.func,
  focusedNode: PropTypes.object,
  history: PropTypes.object,
  gitCommitDiff: PropTypes.func,
  closeContextMenu: PropTypes.func,
  openContextMenu: PropTypes.func,
}

History = connect(
  state => {
    // const focusedNodes = Object.values(state.FileTreeState.entities).filter(node => node.isFocused)
    const history = state.GitState.history
    return {
      focusedNode: null, //focusedNodes[0],
      history,
    }
  },
  dispatch => bindActionCreators(GitActions, dispatch)
)(History)

export default History
