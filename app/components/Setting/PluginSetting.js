import React, { PureComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { pluginSettingStore } from './state'
import { pluginConfigEventStore, pluginSettingsItem } from 'components/Plugins/store'

import TagsInput from './TagsInput'

@observer
class PluingSettingItem extends PureComponent {
  handleChange = (value) => {
    const { propKey, handleChange } = this.props
    handleChange(propKey, value)
  }

  makePropItem = () => {
    const { propItem, settingSate, propKey, handleChange } = this.props
    switch (propItem.type) {
      case 'string':
        return (
          <div className='form-group'>
            <label>{propItem.title}</label>
            <p className='custom-setting-description'>{propItem.description}</p>
            {(propItem.enum && propItem.enum.length) > 0 ? (
              <select
                className='form-control'
                value={settingSate[propKey] || propItem.default || ''}
                onChange={e => this.handleChange(e.target.value)}
              >
                {propItem.enum.map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            ) : (
              <input
                className='form-control'
                value={settingSate[propKey] || propItem.default || ''}
                onChange={e => this.handleChange(e.target.value)}
              />
            )}
          </div>
        )
      case 'boolean':
        return (
          <div className='form-group'>
            <div>
              <label>{propItem.title}</label>
              <p style={{ lineHeight: '20px', display: 'flex', alignItems: 'center' }}>
                <input
                  type='checkbox'
                  className='custom-setting-item'
                  checked={Boolean(settingSate[propKey]) || Boolean(propItem.default) || false}
                  onChange={e => this.handleChange(e.target.checked)}
                />
                <span style={{ marginLeft: 10 }} className='custom-setting-description'>
                  {propItem.description}
                </span>
              </p>
            </div>
          </div>
        )
      case 'array':
        return (
          <div className='form-group'>
            <label>{propItem.title}</label>
            <p className='custom-setting-description'>{propItem.description}</p>
            <TagsInput
              value={settingSate[propKey] || propItem.default}
              onChange={this.handleChange}
            />
          </div>
        )
      default:
        return null
    }
  }
  render () {
    const { propItem } = this.props
    return this.makePropItem()
  }
}

@observer
class PluginSetting extends PureComponent {
  handleChangeState = (propKey, value) => {
    const { domainKey } = this.props
    const eventStore = pluginConfigEventStore[domainKey]
    const oldValue = pluginSettingStore[domainKey][propKey]

    pluginSettingStore[domainKey][propKey] = value
    if (eventStore) {
      for (const handler of eventStore) {
        handler(propKey, oldValue, value)
      }
    }
  }

  render () {
    const { domainKey } = this.props
    const { title, properties, key } = toJS(pluginSettingsItem.get(domainKey))
    const propKeys = Object.keys(properties)
    return (
      <div className='plugin-custom-settings'>
        <h1 className='plugin-settings-title'>{title}</h1>
        {propKeys.map(prop => (
          <PluingSettingItem
            key={prop}
            propKey={prop}
            propItem={properties[prop]}
            handleChange={this.handleChangeState}
            settingSate={pluginSettingStore[domainKey]}
          />
        ))}
      </div>
    )
  }
}

export default PluginSetting
