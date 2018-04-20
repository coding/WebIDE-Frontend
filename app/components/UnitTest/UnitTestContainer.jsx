import React, { Component } from 'react'
import { observer } from 'mobx-react'
import state from './state'

@observer
class UnitTestContainer extends Component {
  render () {
    return (
      <div className='unit-test-output'>{state.testOutput}</div>
    )
  }
}

export default UnitTestContainer
