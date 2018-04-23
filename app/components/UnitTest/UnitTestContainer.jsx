import React, { Component } from 'react'
import { observer } from 'mobx-react'
import state from './state'

@observer
class UnitTestContainer extends Component {
  render () {
    if (state.testOutput) {
      return (
        <div className='unit-test-output'>
          {state.testOutput}
          {/* <div className='sum'>
            错误 {state.testOutput.count.value} | 跳过 {state.testOutput.ignoreCount.value} | 运行时间 {state.testOutput.runTime.value}
          </div>
          {JSON.stringify(state.testOutput.failures)} */}
        </div>
      )
    }
    return (
      <div className='unit-test-output'></div>
    )
  }
}

export default UnitTestContainer
