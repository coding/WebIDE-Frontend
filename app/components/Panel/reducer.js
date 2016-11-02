/* @flow weak */
import _ from 'lodash'
import { handleActions } from 'redux-actions'
import {
  PANEL_INITIALIZE,
  PANEL_UNSET_COVER,
  PANEL_RESIZE,
  PANEL_CONFIRM_RESIZE
} from './actions'

// jailbreakLonelyView 是为了避免无限级嵌套的 views.length === 1 出现
// i.e. {views: [{ views: [ {views: [ content ]} ]}]}
// 以上实际只需要 {views: [ content ]} 即可表达，中间的 wrapper 无用。
//
// 这个 func 做的就是干掉中间无用的 wrapper
// 使得 outermostWrapper.views = innerMostWrapper.views && return outermostWrapper;
const jailbreakLonelyView = (view, originalWrapper) => {
  if (view.views.length === 0 || view.views.length > 1) {
    if (originalWrapper) {
      let _views = view
      view = originalWrapper
      view.views = _views.views
    }
    return view
  } else {
    let lonelyItem = view.views[0]
    if (!Array.isArray(lonelyItem.views)) { // is plain content
      if (originalWrapper) {
        let _views = view
        view = originalWrapper
        view.views = _views.views
      }
      return view
    }
    return jailbreakLonelyView(lonelyItem, view)
  }
}

const normalizeState = (view, parentView, rootView) => {
  var isRootView = !parentView
  var retView = {}
  if (isRootView) rootView = retView

  view = jailbreakLonelyView(view)

  if (!Array.isArray(view.views)) {
    retView.views = [view]
  } else {
    retView.views = view.views.map(_view => {
      if (!Array.isArray(_view.views)) return _view
      return normalizeState(_view, retView, rootView)
    })
  }

  retView.id = view.id || _.uniqueId('pane_view_')
  retView.parent = (isRootView) ? null : parentView
  retView.flexDirection = view.flexDirection || 'row'
  retView.size = view.size || 100
  retView.display = (view.display === 'none') ? 'none' : 'block'

  if (!rootView.directories) rootView.directories = {}
  rootView.directories[retView.id] = retView

  return retView
}

const findViewById = (state, id) => state.directories[id]
const debounced = _.debounce(function (func) { func() }, 50)

export default handleActions({
  [PANEL_INITIALIZE]: (state, action) => {
    return normalizeState(action.payload)
  },

  [PANEL_RESIZE]: (state, action) => {
    const {sectionId, dX, dY} = action.payload
    let section_A = state.directories[sectionId]
    let parent = section_A.parent
    let section_B = parent.views[parent.views.indexOf(section_A) + 1]
    let section_A_Dom = document.getElementById(section_A.id)
    let section_B_Dom = document.getElementById(section_B.id)
    var r, rA, rB
    if (parent.flexDirection === 'column') {
      r = dY
      rA = section_A_Dom.offsetHeight
      rB = section_B_Dom.offsetHeight
    } else {
      r = dX
      rA = section_A_Dom.offsetWidth
      rB = section_B_Dom.offsetWidth
    }
    section_A.size = section_A.size * (rA - r) / rA
    section_B.size = section_B.size * (rB + r) / rB

    section_A_Dom.style.flexGrow = section_A.size
    section_B_Dom.style.flexGrow = section_B.size

    // @coupled: trigger resize of children ace editor
    debounced(function () {
      section_A_Dom.querySelectorAll('[data-ace-resize]').forEach(
        editorDOM => editorDOM.$ace_editor.resize()
      )
      section_B_Dom.querySelectorAll('[data-ace-resize]').forEach(
        editorDOM => editorDOM.$ace_editor.resize()
      )
    })

    return state
  },

  [PANEL_CONFIRM_RESIZE]: (state, action) => {
    return normalizeState(state)
  }

}, {})
