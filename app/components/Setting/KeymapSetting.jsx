import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { isNumber, isArray, isBoolean, isPlainObject } from 'utils/is'
import i18n from 'utils/createI18n'

@observer
class SettingForm extends Component {
  updateSettingItemBind = (settingItem) => {
    let update
    if (this.props.content.requireConfirm) {
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
    const setting = this.props.content
    return (<div>
      <h2 className='settings-content-header'>{i18n`settings.keymap.main`}</h2>
      <div>
      {setting.items.map(settingItem =>
        <FormInputGroup
          key={settingItem.key}
          settingItem={settingItem}
          updateSettingItem={this.updateSettingItemBind(settingItem)}
        />
      )}
      </div>
    </div>)
  }
}

const FormInputGroup = observer(({ settingItem, updateSettingItem }) => {
  if (settingItem.options && isArray(settingItem.options)) {
    return (
      <div className='form-group'>
        <label>{i18n([settingItem.name])}</label>
        <select className='form-control'
          onChange={updateSettingItem}
          value={settingItem.tempValue === undefined ? settingItem.value : settingItem.tempValue}
        >
          {settingItem.options.map(option =>
            isPlainObject(option) ?
              <option key={option.value} value={option.value}>{i18n([option.name])}</option>
            : <option key={option} value={option}>{option}</option>
          )}
        </select>
      </div>)
  } else if (isBoolean(settingItem.value)) {
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
        type={isNumber(settingItem.value) ? 'number' : 'text'}
        min='1'
        onChange={updateSettingItem}
        value={settingItem.tempValue === undefined ? settingItem.value : settingItem.tempValue}
      />
    </div>)
})

export default SettingForm
