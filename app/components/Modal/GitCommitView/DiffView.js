import React from 'react'

import BaseDiffEditor from 'components/MonacoEditor/MonacoReact/BaseDiffEditor'

export default props => (
  <div className='git-commit-diff'>
    <BaseDiffEditor {...props} />
  </div>
)
