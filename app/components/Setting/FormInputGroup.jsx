import React from 'react'
import { observer } from 'mobx-react'
import { defaultProps } from 'utils/decorators'
import { isNumber, isArray, isBoolean, isPlainObject, isFunction } from 'utils/is'
import i18n from 'utils/createI18n'

const updateSettingItemFactory = (settingItem, requireConfirm=false) => {
  const update = requireConfirm ?
      value => settingItem.tempValue = value
    : value => settingItem.value = value

  const updateSettingItem = (e) => {
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

  return updateSettingItem
}

const FormInputGroup = defaultProps((props) => {
  const updateSettingItem = isFunction(props.updateSettingItem) ?
      props.updateSettingItem
    : updateSettingItemFactory(props.settingItem, props.requireConfirm)
  return { updateSettingItem }
})(observer(({ settingItem, updateSettingItem }) => {
  if (settingItem.options && isArray(settingItem.options)) {
    return (
      <div className='form-group'>
        <label>{i18n([settingItem.name])}</label>
        <select className='form-control'
          disabled={settingItem.disabled}
          onChange={updateSettingItem}
          value={settingItem.tempValue === undefined ? settingItem.value : settingItem.tempValue}
        >
          {settingItem.options.map(option =>
            isPlainObject(option) ?
              <option key={option.value} value={option.value}>{i18n.get(`${option.name}`)}</option>
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
              disabled={settingItem.disabled}
              onChange={updateSettingItem}
              checked={settingItem.tempValue === undefined ? settingItem.value : settingItem.tempValue}
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
        disabled={settingItem.disabled}
      />
    </div>)
}))
export default FormInputGroup
