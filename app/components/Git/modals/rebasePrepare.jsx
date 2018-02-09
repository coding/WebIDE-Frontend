import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from 'commands'
import cx from 'classnames'
import { connect } from 'react-redux'

import * as GitActions from '../actions'
import { Table, Column, Cell } from 'fixed-data-table-2'
import i18n from 'utils/createI18n'


const TextCell = ({ rowIndex, data, columnKey, selectedRow, ...props }) => (
  <Cell {...props}
    className={cx({ selected: rowIndex == selectedRow })}
  >
    {data[rowIndex][columnKey]}
  </Cell>
)

const actionOptions = [
  'PICK',
  'EDIT',
  'SKIP',
  'SQUASH',
  'REWORD',
  'FIXUP',
]

class GitRebasePrepare extends Component {
  constructor (props) {
    super(props)
    this.state = {
      rebaseTodoLines: this.parseRows(this.props.content),
      columnWidths: {
        action: 213,
        commit: 213,
        comment: 213,
      },
      selectedRow: 0
    }
    this.renderCell = this.renderCell.bind(this)
    this.renderOptions = this.renderOptions.bind(this)
    this._onColumnResizeEndCallback = this._onColumnResizeEndCallback.bind(this)
    this._onRowClick = this._onRowClick.bind(this)
    this.handleOptionChange = this.handleOptionChange.bind(this)
    this.handleUp = this.handleUp.bind(this)
    this.handleDown = this.handleDown.bind(this)
    this.handleView = this.handleView.bind(this)
    this.handleOk = this.handleOk.bind(this)
  }

  render () {
    return (
      <div>
        <div className='git-rebase-start-container'>
          <h1>
            {i18n`git.rebasePrepare.title`}
          </h1>
          <hr />
          <div className='form-horizontal'>
            <div className='form-group'>
              <div className='col-sm-12'>
                {i18n`git.rebasePrepare.editCommit`}
              </div>
            </div>
            <div className='form-group'>
              <div className='col-sm-10'>
                {this.renderCommitsList()}
              </div>
              <div className='col-sm-2 btn-list'>
                <button className='btn btn-default'
                  type='button'
                  onClick={this.handleView}
                >
                  {i18n`git.rebasePrepare.view`}
                </button>
                <button className='btn btn-default'
                  type='button'
                  onClick={this.handleUp}
                >
                  {i18n`git.rebasePrepare.up`}
                </button>
                <button className='btn btn-default'
                  type='down'
                  onClick={this.handleDown}
                >
                  {i18n`git.rebasePrepare.down`}
                </button>
              </div>
            </div>
          </div>
          <hr />
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={(e) => {
              e.stopPropagation()
              e.nativeEvent.stopImmediatePropagation()
              dispatchCommand('modal:dismiss')
              dispatchCommand('git:rebase:abort')
            }}
            >
              {i18n`git.cancel`}
            </button>
            <button className='btn btn-primary'
              onClick={this.handleOk}
            >
              {i18n`git.commit`}
            </button>
          </div>
        </div>
      </div>
    )
  }

  renderCommitsList () {
    const dataList = this.state.rebaseTodoLines
    return (
      <div className='commits-list'>
        <Table
          rowHeight={34}
          onColumnResizeEndCallback={this._onColumnResizeEndCallback}
          onRowClick={this._onRowClick}
          isColumnResizing={false}
          // rowGetter={this.rowGetter}
          rowsCount={this.state.rebaseTodoLines.length}
          width={640}
          height={200}
          headerHeight={34}
        >
          <Column
            columnKey='action'
            header={<Cell>Action</Cell>}
            cell={this.renderOptions}
            isResizable
            width={this.state.columnWidths.action}
           />
          <Column
            columnKey='commit'
            header={<Cell>Commit</Cell>}
            // cell={this.renderCell}
            cell={<TextCell data={dataList} selectedRow={this.state.selectedRow} />}
            isResizable
            width={this.state.columnWidths.commit}
           />
          <Column
            columnKey='comment'
            header={<Cell>Comment</Cell>}
            // cell={this.renderCell}
            cell={<TextCell data={dataList} selectedRow={this.state.selectedRow} />}
            isResizable
            width={this.state.columnWidths.comment}
           />
        </Table>
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

  renderOptions ({ rowIndex, width, height }) {
    const selectedRow = this.state.selectedRow
    const cellData = this.state.rebaseTodoLines[rowIndex].action
    return (
      <select className='form-control'
        onChange={this.handleOptionChange}
        value={cellData}
      >
        {
          actionOptions.map((item, i) => {
            let name, value
            name = value = item
            if (rowIndex === 0 && (i === 3 || i === 5)) {
              return null
            }
            return (
              <option key={i}
                value={value}
              >
                {name}
              </option>
            )
          })
        }
      </select>
    )
  }

  renderCell ({ rowIndex, width, height }) {
    const selectedRow = this.state.selectedRow
    const cellData = this.state.rebaseTodoLines[rowIndex][1]
    return (
      <cell
        className={cx({ selected: rowIndex == selectedRow })}
        width={width}
        height={height}
      >
        <div>
          {cellData}
        </div>
      </cell>
    )
  }

  parseRows (todoList) {
    const rows = []
    todoList.map((item, i) => {
      const row = { action: item.action, commit: item.commit, comment: item.shortMessage }
      rows.push(row)
    })
    return rows
  }

  getTodo () {
    const rebaseTodoLines = this.state.rebaseTodoLines
    const todos = []
    rebaseTodoLines.map((item, i) => {
      if (item.action === 'SKIP') return
      const todo = {}
      todo.action = item.action
      todo.commit = item.commit
      todo.shortMessage = item.comment
      todos.push(todo)
    })
    return todos
  }

  rowGetter (rowIndex) {
    return this.state.rebaseTodoLines[rowIndex]
  }

  handleOk (e) {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    const lines = this.getTodo()
    this.props.gitRebaseUpdate(lines)
  }

  handleOptionChange (e) {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    const rebaseTodoLines = this.state.rebaseTodoLines
    const selectedRow = this.state.selectedRow
    rebaseTodoLines[selectedRow].action = e.target.value
    this.setState({ rebaseTodoLines })
  }

  handleView () {
    const commit = this.state.rebaseTodoLines[this.state.selectedRow].commit
    const oldRef = `${commit  }^`
    this.props.gitCommitDiff({
      title: 'View Changes',
      rev: commit,
      oldRef
    })
    // GitActions.diff commit, @getIntlMessage('git.modal.viewChanges'), oldRef
  }

  handleDown () {
    const rebaseTodoLines = this.state.rebaseTodoLines
    if (this.state.selectedRow == (rebaseTodoLines.length - 1))
      {return}
    const moveLine = rebaseTodoLines.splice(this.state.selectedRow, 1)
    rebaseTodoLines.splice(this.state.selectedRow + 1, 0, moveLine[0])
    this.setState({ selectedRow: (this.state.selectedRow + 1) })
  }

  handleUp () {
    const rebaseTodoLines = this.state.rebaseTodoLines
    if (this.state.selectedRow == 0)
      {return}
    const moveLine = rebaseTodoLines.splice(this.state.selectedRow, 1)
    rebaseTodoLines.splice(this.state.selectedRow - 1, 0, moveLine[0])
    this.setState({ selectedRow: (this.state.selectedRow - 1) })
  }
}

export default GitRebasePrepare = connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitRebasePrepare)
