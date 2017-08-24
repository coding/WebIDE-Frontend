import React, { Component, PropTypes } from 'react'
import { observer } from 'mobx-react'
import cx from 'classnames'
import state from '../state'
import * as Modal from 'components/Modal/actions'
import i18n from 'utils/createI18n'

@observer
class Step4 extends Component {
  constructor(props) {
    super(props)
  }

  selectAll () {
    state.wizard.sdkList.forEach((item) => {
      item.selected = true
    })
  }

  unselectAll () {
    state.wizard.sdkList.forEach((item) => {
      item.selected = false
    })
  }

  render() {
    const { templates } = state.wizard
    
    return (
      <div>
        <h1>
          Select Software Development Kit
        </h1>
        <hr />
        <div className='form-horizontal'>
          <div className='form-group'>
            <label htmlFor='inputStashName' className='col-sm-10'>
              <div className='template-list'>
                {/* {this.randerTemplates()} */}
                { this.randerSDK() }
              </div>
            </label>
            <div className='col-sm-2 opt-list'>
              <button className='btn btn-default' onClick={e => this.selectAll()}>全部选择</button>
              <button className='btn btn-default' onClick={e => this.unselectAll()}>全部取消</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  randerSDK () {
    const list = state.wizard.sdkList
    return list.map((item) => {
      return (
        <label className='template-item' key={item.name}>
          <input type='checkbox'
            onChange={e => {
              item.selected = !item.selected
            }}
            checked={item.selected}
          />
          {item.name}
        </label>
      )
    })
  }
}

export default Step4
