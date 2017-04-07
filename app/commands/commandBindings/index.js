import git from './git'
import file from './file'
import misc from './misc'
import editor from './editor'
import tab from './tab'

export default {
  ...git,
  ...file,
  ...misc,
  ...editor,
  ...tab
}
