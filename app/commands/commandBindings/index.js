import git from './git'
import file from './file'
import misc from './misc'
import editor from './editor'

export default {
  ...git,
  ...file,
  ...misc,
  ...editor
}
