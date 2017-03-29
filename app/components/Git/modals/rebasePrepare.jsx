/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'

import * as GitActions from '../actions'
import {Table, Column, Cell} from 'fixed-data-table';

const TextCell = ({rowIndex, data, columnKey, selectedRow, ...props}) => (
  <Cell {...props}
    className={cx({selected: rowIndex == selectedRow})}
  >
    {data[rowIndex][columnKey]}
  </Cell>
);

const actionOptions = [
  'PICK',
  'EDIT',
  // 'SKIP',
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
          Rebasing Commits
          </h1>
          <hr />
          <form className="form-horizontal">
            <div className="form-group">
              <div className="col-sm-12">
                Reorder and edit rebase commits
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-10">
                {this.renderCommitsList()}
              </div>
              <div className="col-sm-2 btn-list">
                <button className="btn btn-default"
                  type="button"
                  onClick={this.handleView}
                >
                  View
                </button>
                <button className="btn btn-default"
                  type="button"
                  onClick={this.handleUp}
                >
                  Up
                </button>
                <button className="btn btn-default"
                  type="button"
                  onClick={this.handleDown}
                >
                  Down
                </button>
              </div>
            </div>
          </form>
          <hr />
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={e => {
              e.stopPropagation()
              e.nativeEvent.stopImmediatePropagation()
              dispatchCommand('modal:dismiss')
              dispatchCommand('git:rebase:abort')
            }}>
              Cancel
            </button>
            <button className='btn btn-primary'
              onClick={this.handleOk}>
              OK
            </button>
          </div>
        </div>
      </div>
    )
  }

  renderCommitsList () {
    let dataList = this.state.rebaseTodoLines
    return (
      <div className="commits-list">
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
            columnKey="action"
            header={<Cell>Action</Cell>}
            cell={this.renderOptions}
            isResizable={true}
            width={this.state.columnWidths.action}
          >
          </Column>
          <Column
            columnKey="commit"
            header={<Cell>Commit</Cell>}
            // cell={this.renderCell}
            cell={<TextCell data={dataList} selectedRow={this.state.selectedRow} />}
            isResizable={true}
            width={this.state.columnWidths.commit}
          >
          </Column>
          <Column
            columnKey="comment"
            header={<Cell>Comment</Cell>}
            // cell={this.renderCell}
            cell={<TextCell data={dataList} selectedRow={this.state.selectedRow} />}
            isResizable={true}
            width={this.state.columnWidths.comment}
          >
          </Column>
        </Table>
      </div>
    )
  }

  _onColumnResizeEndCallback (newColumnWidth, columnKey) {
    this.setState(({columnWidths}) => ({
      columnWidths: {
        ...columnWidths,
        [columnKey]: newColumnWidth,
      }
    }));
  }

  _onRowClick (e, rowIndex, rowData) {
    this.setState({selectedRow: rowIndex})
  }

  renderOptions ({rowIndex, width, height}) {
    let selectedRow = this.state.selectedRow
    let cellData = this.state.rebaseTodoLines[rowIndex].action
    return (
      <select className="form-control"
        onChange={this.handleOptionChange}
        value={cellData}
      >
        {
          actionOptions.map((item, i) => {
            let name, value
            name = value = item
            if (rowIndex === 0 && (i === 2 || i === 4)) {
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

  renderCell ({rowIndex, width, height}) {
    let selectedRow = this.state.selectedRow
    let cellData = this.state.rebaseTodoLines[rowIndex][1]
    return (
      <cell
        className={cx({selected: rowIndex == selectedRow})}
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
    let rows = []
    todoList.map((item, i) => {
      let row = {action: item.action, commit: item.commit, comment: item.shortMessage}
      rows.push(row)
    })
    return rows
  }

  getTodo () {
    let rebaseTodoLines = this.state.rebaseTodoLines
    let todos = []
    rebaseTodoLines.map((item, i) => {
      let todo = {}
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
    let lines = this.getTodo()
    this.props.gitRebaseUpdate(lines)
  }

  handleOptionChange (e) {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    let rebaseTodoLines = this.state.rebaseTodoLines
    let selectedRow = this.state.selectedRow
    rebaseTodoLines[selectedRow].action = e.target.value
    this.setState({rebaseTodoLines:rebaseTodoLines})
  }

  handleView () {
    let commit = this.state.rebaseTodoLines[this.state.selectedRow].commit
    let oldRef = commit + '^'
    this.props.gitCommitDiff({
      title: 'View Changes',
      rev: commit,
      oldRef
    })
    // GitActions.diff commit, @getIntlMessage('git.modal.viewChanges'), oldRef
  }

  handleDown () {
    let rebaseTodoLines = this.state.rebaseTodoLines
    if (this.state.selectedRow == (rebaseTodoLines.length - 1))
      return
    let moveLine = rebaseTodoLines.splice(this.state.selectedRow, 1)
    rebaseTodoLines.splice(this.state.selectedRow + 1, 0, moveLine[0])
    this.setState({selectedRow: (this.state.selectedRow + 1)})
  }

  handleUp () {
    let rebaseTodoLines = this.state.rebaseTodoLines
    if (this.state.selectedRow == 0)
      return
    let moveLine = rebaseTodoLines.splice(this.state.selectedRow, 1)
    rebaseTodoLines.splice(this.state.selectedRow - 1, 0, moveLine[0])
    this.setState({selectedRow: (this.state.selectedRow - 1)})
  }
}

export default GitRebasePrepare = connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitRebasePrepare)
