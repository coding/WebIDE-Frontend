import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { runInAction } from 'mobx'
import cx from 'classnames'
import _ from 'lodash'
import i18n from 'utils/createI18n'


@observer
class SettingForm extends Component {
  constructor (props) {
    super(props)
  }

  updateSettingItemBind = (settingItem) => {
    let update
    if (this.props.setting.requireConfirm) {
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
    const { setting } = this.props
    return (<div>
      {setting.items.map(settingItem =>
        <FormInputGroup
          key={settingItem.key}
          settingItem={settingItem}
          updateSettingItem={this.updateSettingItemBind(settingItem)}
        />
      )}
    </div>)
  }
}

const FormInputGroup = observer(({ settingItem, updateSettingItem }) => {
  if (settingItem.options && _.isArray(settingItem.options)) {
    return (
      <div className='form-group'>
        <label>{i18n([settingItem.name])}</label>
        <select className='form-control'
          onChange={updateSettingItem}
          value={settingItem.tempValue === undefined ? settingItem.value : settingItem.tempValue}
        >
          {settingItem.options.map(option =>
            _.isObject(option) ?
              <option key={option.value} value={option.value}>{i18n([option.name])}</option>
            : <option key={option} value={option}>{option}</option>
          )}
        </select>
      </div>)
  } else if (_.isBoolean(settingItem.value)) {
    return (
      <div className='form-group'>
        <div className='checkbox'>
          <label>
            <input type='checkbox'
              onChange={updateSettingItem} checked={settingItem.tempValue === undefined ? settingItem.value : settingItem.tempValue}
            />
            <strong>{i18n([settingItem.name])}</strong>
          </label>

        </div>
      </div>)
  }
  return (
    <div className='form-group'>
      <label>{i18n([settingItem.name])}</label>
      <input className='form-control'
        type={_.isNumber(settingItem.value) ? 'number' : 'text'}
        min='1'
        onChange={updateSettingItem}
        value={settingItem.tempValue === undefined ? settingItem.value : settingItem.tempValue}
      />
    </div>)
})

export default SettingForm
