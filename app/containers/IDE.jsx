/* @flow weak */
import React, { Component } from 'react';
import TopBar from '../components/TopBar';
import StatusBar from '../components/StatusBar';
import PaneView from '../components/Pane';
import TabViewContainer from '../components/Tab';
import AceEditor from '../components/AceEditor';
import Terminal from '../components/Terminal';
import EditorPaneView from './EditorPaneView';
import WindowPaneView from './WindowPaneView';
import FileTree from '../components/FileTree';
import Utilities from './Utilities';

import {setupWorkspace} from '../api'
import config from '../config'

var editorPaneConfig = {
  flexDirection: 'row',
  views: [{
    views: [<TabViewContainer defaultContentClass={AceEditor} defaultContentType='editor' />],
    size: 30
  }]
};

var editorPaneView = <EditorPaneView className='editor-pane-view' config={editorPaneConfig}/>;

var windowPaneConfig = {
  flexDirection: 'column',
  views: [
    {
      flexDirection: 'row',
      views: [
        {
          flexDirection: 'column',
          size: 20,
          views: [<FileTree />]
        },
        {
          flexDirection: 'row',
          size: 80,
          views: [editorPaneView]
        },
        {
          flexDirection: 'row',
          size: 20,
          views: ['Right Panel'],
          display: 'none'
        },
      ],
      size: 90
    },
    {
      flexDirection: 'row',
      views: [<TabViewContainer defaultContentClass={Terminal} defaultContentType='terminal' />],
      size: 20,
    }

  ]
};



class IDE extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    setupWorkspace().then(_config => {
      Object.assign(config, _config);
    });
  }

  render() {
    return (
      <div className='ide-container'>
        <TopBar />
        <WindowPaneView className='main-pane-view' config={windowPaneConfig}/>
        <StatusBar />
        <Utilities />
      </div>
    );
  }
}

export default IDE;
