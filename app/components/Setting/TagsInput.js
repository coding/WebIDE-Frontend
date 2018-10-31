import React from 'react'
import { trim } from 'lodash'

class InputLabel extends React.PureComponent {
  state = {
    showActions: false,
    temporary: this.props.value || ''
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.value !== this.props.value && nextProps.value) {
      this.setState({
        temporary: value
      })
    }
  }

  handleMouseEnter = () => {
    this.setState({
      showActions: true
    })
  }

  handleMouseLeave = () => {
    this.setState({ showActions: false })
  }

  handleSubmit = () => {
    const { temporary } = this.state
    const { onChange, onChangeInputState } = this.props
    if (temporary !== '') {
      onChange(temporary)
      onChangeInputState(false)
    }
  }

  handleChange = (e) => {
    this.setState({
      temporary: e.target.value
    })
  }

  renderInputMode = () => (
    <div className='input-mode'>
      <input value={this.state.temporary} onChange={this.handleChange} />
      <button style={{ marginLeft: 15 }} className='btn btn-primary' onClick={this.handleSubmit}>
        确定
      </button>
      <button
        style={{ marginLeft: 15 }}
        className='btn btn-primary'
        onClick={() => this.props.onChangeInputState(false)}
      >
        取消
      </button>
    </div>
  )

  render () {
    const { isInput, value, onChangeInputState, onRemove } = this.props
    const { showActions } = this.state
    return (
      <div
        className={`plugin-setting-input-label ${
          !isInput ? 'plugin-setting-input-label-hover' : ''
        }`}
        onMouseEnter={!isInput && this.handleMouseEnter}
        onMouseLeave={!isInput && this.handleMouseLeave}
      >
        {isInput ? this.renderInputMode() : <span>{value}</span>}
        {showActions &&
          !isInput && (
            <p>
              <i
                style={{ margin: '10px 0px', display: 'inline-block' }}
                className='fa fa-pencil'
                onClick={() => onChangeInputState(true)}
              />
              <i className='fa fa-close' onClick={onRemove} />
            </p>
          )}
      </div>
    )
  }
}

class TagsInput extends React.PureComponent {
  state = {
    insert: false,
    inputIndex: this.props.value.length + 1,
    defaultValue: this.props.value,
    temporary: undefined
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.value && nextProps.value !== this.props.value) {
      this.setState({
        defaultValue: nextProps.value
      })
    }
  }
  handleChange = (i, value) => {
    const { defaultValue } = this.state
    this.setState({
      defaultValue: defaultValue.map((v, index) => (i === index ? value : v))
    }, this.handleSubmit)
  }

  handleAdd = () => {
    const { defaultValue } = this.state
    this.setState({
      insert: true,
      inputIndex: defaultValue.length,
      temporary: ''
      // defaultValue: [...defaultValue, ''],
    })
  }

  handleRemove = (v, i) => {
    const { defaultValue } = this.state
    const { onChange } = this.props
    onChange(defaultValue.filter((value, index) => value !== v && i !== index))
  }

  handleSubmit = () => {
    const { temporary, defaultValue, inputIndex } = this.state
    const { onChange, value } = this.props

    if (temporary && trim(temporary)) {
      onChange([...defaultValue, temporary])
      this.setState({ defaultValue: [...defaultValue, temporary], temporary: undefined })
    } else {
      onChange(defaultValue)
    }
    this.setState({ insert: false, inputIndex: inputIndex + 1 })
  }

  renderInputMode = () => (
    <div className='input-mode' style={{ marginTop: 15 }}>
      <input
        value={this.state.temporary}
        onChange={e => this.setState({ temporary: e.target.value })}
      />
      <button style={{ marginLeft: 15 }} className='btn btn-primary' onClick={this.handleSubmit}>
        确定
      </button>
      <button
        style={{ marginLeft: 15 }}
        className='btn btn-primary'
        onClick={() => this.setState({ insert: false })}
      >
        取消
      </button>
    </div>
  )

  render () {
    const { insert, inputIndex, defaultValue } = this.state
    return (
      <div>
        {defaultValue.map((v, k) => (
          <InputLabel
            onChangeInputState={inputState =>
              this.setState({ inputIndex: inputState ? k : defaultValue.length })
            }
            isInput={inputIndex === k}
            value={v}
            key={v}
            onRemove={value => this.handleRemove(value, k)}
            onChange={value => this.handleChange(k, value)}
          />
        ))}
        <div>
          {insert && inputIndex === defaultValue.length ? (
            this.renderInputMode()
          ) : (
            <button className='btn btn-primary' style={{ marginTop: 15 }} onClick={this.handleAdd}>
              添加
            </button>
          )}
        </div>
      </div>
    )
  }
}

export default TagsInput
