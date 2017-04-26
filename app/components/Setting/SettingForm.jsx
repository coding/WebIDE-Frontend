import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { runInAction } from 'mobx'
import cx from 'classnames'
import _ from 'lodash'

@observer
class SettingForm extends Component {
  constructor (props) {
    super(props)
  }

  updateSettingItemBind = settingItem => {
    let update
    if (this.props.domainSetting.requireConfirm) {
      update = value => settingItem.tempValue = value
    } else {
      update = value => settingItem.value = value
    }
    return (e) => {
      const value = (() => {
        switch (e.target.type) {
          case 'checkbox':
            return e.target.checked
          case 'number':
            return Number(e.target.value)
          case 'text':
          case 'select-one':
          default:
            return e.target.value
        }
      })()
      update(value)
    }
  }

  render () {
    const { domainSetting } = this.props
    return <div>
      {domainSetting.items.map(settingItem =>
        <FormInputGroup
          key={settingItem.key}
          settingItem={settingItem}
          updateSettingItem={this.updateSettingItemBind(settingItem)}
        />
      )}
    </div>
  }
}

const FormInputGroup = observer(({ settingItem, updateSettingItem }) => {
  if (settingItem.options && _.isArray(settingItem.options)) {
    return (
      <div className="form-group">
        <label>{settingItem.name}</label>
        <select className="form-control"
          onChange={updateSettingItem}
          value={settingItem.tempValue === undefined ? settingItem.value : settingItem.tempValue }
        >
          {settingItem.options.map(option =>
            _.isObject(option) ?
              <option key={option.value} value={option.value}>{option.name}</option>
            : <option key={option} value={option}>{option}</option>
          )}
        </select>
      </div>)
  } else if (_.isBoolean(settingItem.value)) {
    return (
      <div className="form-group">
        <div className="checkbox">
          <label>
            <input type="checkbox"
              onChange={updateSettingItem} checked={settingItem.tempValue === undefined ? settingItem.value : settingItem.tempValue }
            />
            <strong>{settingItem.name}</strong>
          </label>

        </div>
      </div>)
  } else {
    return (
      <div className="form-group">
        <label>{settingItem.name}</label>
        <input className="form-control"
          type={_.isNumber(settingItem.value) ? 'number' : 'text'}
          min="1"
          onChange={updateSettingItem}
          value={settingItem.tempValue === undefined ? settingItem.value : settingItem.tempValue }
        />
      </div>)
  }
})

export default SettingForm
