import React, { PureComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { pluginSettingsState, pluginStore } from './state'
import { pluginConfigEventStore } from 'components/Plugins/store'

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
            <p>{propItem.description}</p>
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
                  checked={Boolean(settingSate[propKey]) || Boolean(propItem.default) || false}
                  onChange={e => this.handleChange(e.target.checked)}
                />
                <span>{propItem.description}</span>
              </p>
            </div>
          </div>
        )
      case 'array':
        return (
          <div className='form-group'>
            <label>{propItem.title}</label>
            {propItem.default.map(v => (
              <p key={v}>{v}</p>
            ))}
            <p>{propItem.description}</p>
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
  componentWillMount () {
    const { domainKey } = this.props
    const { title, properties } = toJS(pluginSettingsState.get(domainKey))
    if (!pluginStore[domainKey]) {
      console.log(`[Plugins-${title}]----Initialize plugin configuration.`)
      const initialState = Object.keys(properties).reduce((pre, propKey) => {
        pre[propKey] = properties[propKey].default
        return pre
      }, {})
      pluginStore[domainKey] = observable(initialState)
    }
  }

  handleChangeState = (propKey, value) => {
    const { domainKey } = this.props
    const eventStore = pluginConfigEventStore[domainKey]
    for (const handler of eventStore) {
      handler(propKey, pluginStore[domainKey][propKey], value)
    }
    pluginStore[domainKey][propKey] = value
  }

  render () {
    const { domainKey } = this.props
    const { title, properties, key } = toJS(pluginSettingsState.get(domainKey))
    const propKeys = Object.keys(properties)
    return (
      <div>
        <h1>{title}</h1>
        {propKeys.map(prop => (
          <PluingSettingItem
            key={prop}
            propKey={prop}
            propItem={properties[prop]}
            handleChange={this.handleChangeState}
            settingSate={pluginStore[domainKey]}
          />
        ))}
      </div>
    )
  }
}

export default PluginSetting
