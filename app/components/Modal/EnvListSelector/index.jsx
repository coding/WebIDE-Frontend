import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { defaultEnvList } from '../../../backendAPI/envListAPI'
import getSvg from '../../../../static'

const EnvItem = ({ node, handleClick }) => {
  let createdDate
  if (node.createdDate) {
    createdDate = new Date(node.createdDate)
    const year = createdDate.getFullYear()
    let month = createdDate.getMonth() + 1
    let date = createdDate.getDate()
    if (month < 10) {
      month = `0${month}`
    }
    if (date < 10) {
      date = `0${date}`
    }
    createdDate = `${year}-${month}-${date}`
  }
  return (
    <div className='env-item-modal' onClick={() => handleClick(node.name)}>
      <div className='env-item-heading'>
        {node.isGlobal ? getSvg(node.displayName) : getSvg('share')}
        {node.displayName}
      </div>
      <div className='env-item-body'>
        {node.owner ? (
          <div>
            <i className='fa fa-user'> {node.owner.name}</i>
            <i className='fa fa-clock-o'> {createdDate}</i>
          </div>
        ) : (
          <div>{node.description}</div>
        )}
      </div>
    </div>
  )
}

EnvItem.propTypes = {
  node: PropTypes.object,
  handleClick: PropTypes.func,
}

class EnvListSelector extends Component {

  constructor (props) {
    super(props)
    this.state = {
      sharedEnv: [],
      defaultEnv: [],
    }
    defaultEnvList()
      .then((response) => {
        this.setState({ defaultEnv: response })
      })
  }


  handleClick = (name) => {
    console.log(name)
  }

  renderEnvItems = list => (
    list.map(env => (
      <EnvItem
        node={env}
        key={env.name}
        handleClick={this.handleClick}
      />
    ))
  )

  render () {
    const { message } = this.props
    const { defaultEnv } = this.state
    return (
      <div className='modal-content' style={{ width: 640 }}>
        <div className='env-list-selector-header'>{message}</div>
        <div className='fixed-line' />
        <div className='env-list-content'>
          {/* <p className='env-list-little-header'>共享环境</p>*/}
          <p className='env-list-little-header'>预置环境</p>
          <div className='env-list-list-item'>{this.renderEnvItems(defaultEnv)}</div>
        </div>
      </div>
    )
  }
}

EnvListSelector.propTypes = {
  meta: PropTypes.object,
  message: PropTypes.string,
}

export default EnvListSelector
