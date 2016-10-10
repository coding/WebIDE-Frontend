/* @flow weak */
/*
var AppDispatcher, EventEmitter, GridActions, StatusBarActions, Store, TabActions, TermConstants, _, _state, clearStatusBar, dnd, focusTabDeb, getActiveSection, getAnotherInSection, getNthTab, getSectionTabsByTab, getTabsBySection, nextTab, prevTab, removeSection, showCopyInfo, terms;

AppDispatcher = require('../actions/dispatcher/AppDispatcher');

EventEmitter = require('events').EventEmitter;

TermConstants = require('../actions/constants');

_ = require('lodash');

dnd = cide.require('dragdrop');

TabActions = require('../actions/TabActions');

GridActions = require('../actions/GridActions');

StatusBarActions = require('../actions/StatusBarActions');

terms = require('../utils/terminal-client');

_state = {
  activeTab: null,
  activeSection: null,
  tabs: [],
  tabsMap: {},
  sections: [],
  layout: {
    children: []
  },
  online: false,
  drag: new dnd.DraggableType(),
  reconnect: false
};

_state.drag.handlerDrop = function(section, tab) {
  if (!section && tab) {
    return TabActions.changeSection(tab.tabId, tab.sectionId, null);
  }
};

Store = _.assign({}, EventEmitter.prototype, {
  getState: function() {
    return _state;
  },
  emitChange: function() {
    return this.emit('change');
  },
  addChangeListener: function(callback) {
    return this.on('change', callback);
  },
  removeChangeListener: function(callback) {
    return this.removeListener('change', callback);
  }
});

getNthTab = function(tab, n, sectionId) {
  var i, tabs;
  if (sectionId) {
    tabs = _state.tabsMap[sectionId];
  } else {
    tabs = _state.tabs;
  }
  i = _.indexOf(tabs, tab);
  i += n;
  if (i < 0 || i >= tabs.length) {
    return null;
  }
  return tabs[i];
};

prevTab = function(tab, sectionId) {
  return getNthTab(tab, -1, sectionId);
};

nextTab = function(tab, sectionId) {
  return getNthTab(tab, 1, sectionId);
};

getActiveSection = function() {
  var newSection;
  if (!_state.activeSection) {
    newSection = {
      type: 0,
      id: _.uniqueId('section'),
      parent: _state.layout,
      index: 0
    };
    _state.layout.children = [];
    _state.layout.children.push(newSection);
    _state.activeSection = _state.layout.children[0];
    _state.sections.push(_state.layout.children[0]);
    _state.tabsMap[newSection.id] = [];
  }
  return _state.activeSection;
};

getSectionTabsByTab = function(t) {
  return _.filter(_state.tabs, function(tab) {
    return t.section.id === tab.section.id && t.tabId !== tab.tabId;
  });
};

getTabsBySection = function(sectionId) {
  return _.filter(_state.tabs, function(tab) {
    return tab.section.id === sectionId;
  });
};

getAnotherInSection = function(section) {
  var other;
  other = 1 - section.index;
  return section.parent.children[other];
};

removeSection = function(section) {
  var otherSection;
  otherSection = getAnotherInSection(section);
  if (otherSection) {
    return switchChildren(section.parent, otherSection);
  } else {
    return setTimeout(function() {
      return GridActions.setTabMax(false);
    }, 0);
  }
};

showCopyInfo = function() {
  return setTimeout(function() {
    if (_state.tabs.length === 1 && navigator.platform.indexOf('Win') > -1) {
      StatusBarActions.setWidgetState('message', {
        content: IntlContext.getIntlMessage('term.msg.pasteInfo')
      });
      return clearStatusBar(8000);
    }
  }, 0);
};

clearStatusBar = function(delay) {
  return setTimeout(function() {
    return StatusBarActions.setWidgetState('message', {
      content: ''
    });
  }, delay);
};

focusTabDeb = _.debounce(function(tab) {
  if (tab.onFocus) {
    return tab.onFocus();
  }
}, 100);

AppDispatcher.register(function(action) {
  var activeTab, beforeTab, i, index, isOnly, j, k, l, len, len1, len2, moveTab, otherTabs, ref, ref1, ref2, section, tab;
  switch (action.actionType) {
    case TermConstants.TERM_TAB_CLOSE:
      ref = _state.tabs;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        tab = ref[i];
        if (tab.tabId === action.tabId) {
          if (tab.tabId === tab.section.activeTab.tabId) {
            otherTabs = getSectionTabsByTab(tab);
            if (otherTabs.length === 0) {
              removeSection(tab.section);
              if (tab.tabId === _state.activeTab.tabId) {
                _state.activeTab = prevTab(tab) || nextTab(tab);
                if (_state.activeTab) {
                  _state.activeSection = _state.activeTab.section;
                  focusTabDeb(_state.activeTab);
                } else {
                  _state.activeTab = null;
                  _state.activeSection = null;
                }
              }
            } else {
              tab.section.activeTab = prevTab(tab, tab.section.id) || nextTab(tab, tab.section.id);
              if (tab.tabId === _state.activeTab.tabId) {
                _state.activeTab = tab.section.activeTab;
                focusTabDeb(_state.activeTab);
              }
            }
          }
          _state.tabs.splice(i, 1);
          _.remove(_state.tabsMap[tab.section.id], function(item) {
            return item.tabId === tab.tabId;
          });
          break;
        }
      }
      return Store.emitChange();
    case TermConstants.TERM_TAB_CLOSE_ALL:
      _state.tabs.length = 0;
      _state.sections.length = 0;
      _state.tabsMap = {};
      _state.activeTab = null;
      _state.activeSection = null;
      return Store.emitChange();
    case TermConstants.TERM_TAB_OPEN:
      tab = {
        title: 'Terminal',
        tabId: _.uniqueId("tab"),
        contentType: 'terminal',
        isResize: false,
        section: getActiveSection(),
        icon: ''
      };
      tab.index = getTabsBySection(tab.section.id).length;
      tab.section.activeTab = tab;
      _state.activeTab = tab;
      showCopyInfo();
      _state.tabs.push(tab);
      _state.tabsMap[tab.section.id].push(tab);
      return Store.emitChange();
    case TermConstants.TERM_TAB_ACTIVE:
      activeTab = _.find(_state.tabs, function(tab) {
        return tab.tabId === action.tabId;
      });
      if (activeTab) {
        if (activeTab.section.activeTab !== activeTab) {
          activeTab.section.activeTab = activeTab;
          _state.activeTab = activeTab;
          activeTab.isResize = true;
          Store.emitChange();
        }
        return focusTabDeb(_state.activeTab);
      }
      break;
    case TermConstants.TERM_TAB_TITLE:
      tab = _.find(_state.tabs, function(tab) {
        return tab.tabId === action.tabId;
      });
      if (tab) {
        tab.title = action.title;
        return Store.emitChange();
      }
      break;
    case TermConstants.TERM_TAB_LAYOUT:
      ref1 = _state.tabs;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        tab = ref1[k];
        tab.isResize = true;
      }
      return Store.emitChange();
    case TermConstants.TERM_TAB_ONLINE:
      _state.online = action.online;
      return Store.emitChange();
    case TermConstants.TERM_TAB_RECONNECT:
      _state.reconnect = action.reconnect;
      return Store.emitChange();
    case TermConstants.TAB_CHANGE_SECTION:
      ref2 = _state.tabs;
      for (i = l = 0, len2 = ref2.length; l < len2; i = ++l) {
        tab = ref2[i];
        if (tab.tabId === action.tabId) {
          moveTab = tab;
        }
      }
      if (!moveTab) {
        return;
      }
      section = _.find(_state.sections, function(section) {
        return section.id === action.sectionId;
      });
      if (!section) {
        return;
      }
      beforeTab = action.beforeTab;
      isOnly = _state.tabsMap[section.id].length === 1;
      if (section === moveTab.section && !beforeTab && isOnly) {
        return;
      }
      _.remove(_state.tabsMap[section.id], function(item) {
        return item.tabId === action.tabId;
      });
      if (beforeTab) {
        index = _.indexOf(_state.tabsMap[section.id], beforeTab);
      } else {
        index = void 0;
      }
      _state.tabsMap[section.id].splice(index, 0, moveTab);
      return Store.emitChange();
    case TermConstants.TERM_TAB_CLEAR_BUFFER:
      if (_state.activeTab) {
        return terms.clearBuffer(_state.activeTab.tabId);
      }
      break;
    case TermConstants.TERM_TAB_CLEAR_SCROLLBACK_BUFFER:
      if (_state.activeTab) {
        return terms.clearScrollBuffer(_state.activeTab.tabId);
      }
      break;
    case TermConstants.TERM_TAB_RESET:
      if (_state.activeTab) {
        return terms.reset(_state.activeTab.tabId);
      }
      break;
    case TermConstants.TERM_TAB_INPUT:
      if (_state.activeTab) {
        terms.input(_state.activeTab.tabId, action.inputString);
        return focusTabDeb(_state.activeTab);
      }
      break;
    case TermConstants.TERM_TAB_INPUT_PATH:
      if (_state.activeTab) {
        terms.inputFilePath(_state.activeTab.tabId, action.inputPath);
        return focusTabDeb(_state.activeTab);
      }
  }
});

module.exports = Store;
*/

import {
  TERM_CLOSE,
  TERM_CLOSE_ALL,
  TERM_OPEN,
  TERM_ACTIVE,
  TERM_TITLE,
  TERM_LAYOUT,
  TERM_ONLINE,
  TERM_RECONNECT,
  TERM_CLEAR_BUFFER,
  TERM_CLEAR_SCROLLBACK_BUFFER,
  TERM_RESET,
  TERM_INPUT,
  TERM_INPUT_PATH
} from './actions'

var _state = {
  activeTab: null,
  activeSection: null,
  tabs: [],
  tabsMap: {},
  sections: [],
  layout: {
    children: []
  },
  online: false,
  reconnect: false
}

export default function TerminalReducer (state = _state, action) {
  switch (action.type) {
    default:
      return state
  }
}
