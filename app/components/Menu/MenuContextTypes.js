import PropTypes from 'prop-types'

export default {
  subscribe: PropTypes.func,
  setFocus: PropTypes.func,
  getFocus: PropTypes.func,
  menuContext: PropTypes.any.isRequired,
  deactivateTopLevelMenu: PropTypes.func,
  activatePrevTopLevelMenuItem: PropTypes.func,
  activateNextTopLevelMenuItem: PropTypes.func,
}
