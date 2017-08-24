import React, { Component, PropTypes } from 'react'
import { observer } from 'mobx-react'
import cx from 'classnames'
import state from '../state'
import * as Modal from 'components/Modal/actions'
import i18n from 'utils/createI18n'

const wizardList = [
  { id: 1, name: '可视化插件' },
  { id: 2, name: '数据处理插件' },
  { id: 3, name: '基础算法插件' }
]

@observer
class Step1 extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { wizard } = state
    return (
      <div>
        <h1>
          Select a wizard
        </h1>
        <hr />
        <p>Create a plug-in project</p>

        <div className="form-horizontal">
          <div className="form-group">
            <div className='col-sm-12'>
              <div className='template-list'>
                {this.renderOptions()}
              </div>
            </div>
          </div>
        </div>
        
      </div>
    )
  }

  renderOptions() {
    return wizardList.map((item, i) => {
      return <div className={cx(
        'template-item', { selected: item.id === state.wizard.wizardId })}
        onClick={e => {
          state.wizard.wizardId = item.id
        }}
        key={item.id}
      >
        <i className='fa fa-archive' />
        {item.name}</div>
    })
  }
}

export default Step1
