import React, { PureComponent } from 'react'
import styled from 'styled-components'
import i18n from 'utils/createI18n'

const Container = styled.div`
  border-bottom-color: rgb(0, 122, 204);
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-left-color: rgb(0, 122, 204);
  border-right-color: rgb(0, 122, 204);
  border-top-color: rgb(0, 122, 204);
  border-top-style: solid;
  border-top-width: 1px;
  color: rgb(171, 178, 191);
  display: flex;
  font-family: -apple-system, system-ui, 'Segoe WPC', 'Segoe UI', HelveticaNeue-Light, 'Noto Sans',
    'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', 'Source Han Sans SC', 'Source Han Sans CN',
    'Source Han Sans', sans-serif;
  font-feature-settings: 'liga' 1, 'calt' 1;
  font-size: 13px;
  height: 30px;
  line-height: 18.2px;
  overflow-x: hidden;
  overflow-y: hidden;
  position: relative;
  text-size-adjust: 100%;
  top: 0px;
  user-select: none;
  white-space: normal;
  z-index: 100;
`

const SelectContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px;
  &>select {
    font-size: 12px;
    box-sizing: border-box;
    align-items: center;
    white-space: pre;
    outline: none;
  }
`

const InputContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  &>input {
    background-color: rgba(0, 0, 0, 0);
    font-size: 12px;
    border: none;
    width: 100%;
    outline: none;
  }
`

class ConditionWidget extends PureComponent {
  state = {
    logMessage: this.props.breakpoint.logMessage || '',
    condition: this.props.breakpoint.condition || '',
    hitCondition: this.props.breakpoint.hitCondition || '',
    conditionType: 'condition'
  }

  componentDidMount () {
    if (this.inputNode) {
      const timer = setTimeout(() => {
        this.inputNode.focus()
        clearTimeout(timer)
      }, 500)
    }

    document.body.addEventListener('keydown', this.handleCancelEvent)
  }

  componentWillUnmount () {
    document.body.removeEventListener('keydown', this.handleCancelEvent)
  }

  handleCancelEvent = (e) => {
    if (e.keyCode === 27 && e.key === 'Escape') {
      this.props.onCancel()
    }
  }

  handleChange = (e) => {
    const { conditionType } = this.state
    this.setState({ [conditionType]: e.target.value })
  }

  handleChangeType = (e) => {
    this.setState({ conditionType: e.target.value })
  }

  handleKeyDown = (e) => {
    const { logMessage, condition, hitCondition } = this.state
    const { onChange, onCancel } = this.props
    if (e.keyCode === 13) {
      onChange({
        logMessage,
        condition,
        hitCondition,
      })
      onCancel()
    }
  }

  render () {
    const { conditionType } = this.state
    return (
      <Container className='form-group'>
        <SelectContainer>
          <select value={conditionType} onChange={this.handleChangeType} className='debug-condition-select'>
            <option value='hitCondition'>{i18n`monaco.hitConditionLabel`}</option>
            <option value='condition'>{i18n`monaco.conditionLabel`}</option>
            <option value='logMessage'>{i18n`monaco.logLabel`}</option>
          </select>
        </SelectContainer>
        <InputContainer>
          <input
            type='text'
            placeholder={i18n.get(`monaco.${conditionType}`)}
            ref={(ele) => this.inputNode = ele}
            value={this.state[conditionType]}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
          />
        </InputContainer>
      </Container>
    )
  }
}

export default ConditionWidget
