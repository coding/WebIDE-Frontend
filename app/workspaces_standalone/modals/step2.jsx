import React, { Component, PropTypes } from 'react'
import { observer } from 'mobx-react'
import state from '../state'
import * as Modal from 'components/Modal/actions'
import i18n from 'utils/createI18n'

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
          Plug-in Project
        </h1>
        <hr />
        <div className="form-horizontal">
          <div className="form-group">
            <label className="col-sm-3 control-label">Project name</label>
            <div className="col-sm-9">
              <input type="text"
                className="form-control"
                id="inputStashName"
                onChange={e => {
                  wizard.name = e.target.value
                  e.preventDefault()
                  e.stopPropagation()
                }}
                value={wizard.name}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="inputStashName" className="col-sm-3 control-label">Project Settings</label>
            <div className="col-sm-9">
              <input type="text"
                className="form-control"
                id="inputStashName"
                value={wizard.settings.outputFolder}
                onChange={e => {
                  wizard.settings.outputFolder = e.target.value
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="inputStashName" className="col-sm-3 control-label">Eclipse version</label>
            <div className="col-sm-9 checkbox-inline">
              {wizard.platform.eclipseVersion}
            </div>
          </div>
        </div>
        
      </div>
    )
  }
}

export default Step1
