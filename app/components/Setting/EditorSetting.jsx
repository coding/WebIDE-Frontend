import React from 'react'
import { observer } from 'mobx-react'
import i18n from 'utils/createI18n'
import { dismissModal } from 'components/Modal/actions'
import { openFile } from 'commands/commandBindings/file'
import TabStore from 'components/Tab/store'
import FormInputGroup from './FormInputGroup'

const editorconfigDefaultContent = `# See: http://editorconfig.org
root = true

[*]
indent_style =
indent_size =
tab_width =
trim_trailing_whitespace =
insert_final_newline =
`

const openEditorConfigFile = (e) => {
  e.preventDefault()
  dismissModal()
  openFile({ path: '/.editorconfig' }).catch((err) => {
    TabStore.createTab({
      icon: 'fa fa-file-text-o',
      title: '.editorconfig',
      editor: { content: editorconfigDefaultContent }
    })
  })
}

export default observer(({ content }) => (
  <div>
    <h2 className='settings-content-header'>{i18n`settings.editor.main`}</h2>
    <div className='alert alert-warning'>{i18n`settings.editor.editorconfigNote`}&nbsp;
      <a className='alert-link' href='#' onClick={openEditorConfigFile}>
        {i18n`settings.editor.editorconfigNoteLink`}
      </a>
    </div>
    <div>
      {content.items.map(settingItem =>
        <FormInputGroup
          key={settingItem.key}
          settingItem={settingItem}
        />
      )}
    </div>
  </div>
))
