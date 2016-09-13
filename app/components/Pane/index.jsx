import React, { Component, PropTypes } from 'react';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import cx from 'classnames';
import * as PaneActions from './actions';

const Pane = ({id, views, size, flexDirection, parentFlexDirection, scope, resizingListeners, ..._props}) => {
  if (views.length > 1) {
    var content = <PaneView views={views} flexDirection={flexDirection} scope={scope} />;
  } else {
    var content = views[0];
  }

  var style = {
    flexGrow: size,
    display: _props.display
  };

  return (
    <div id={id} style={style} className={cx('pane', parentFlexDirection)}>
      <div className='pane-content'>{ content }</div>
      <PaneResizeBar parentFlexDirection={parentFlexDirection}
        sectionId={id} scope={scope} resizingListeners={resizingListeners} />
    </div>
  );
};

let PaneResizeBar = ({parentFlexDirection, sectionId, scope, startResize}) => {
  var barClass = (parentFlexDirection == 'row') ? 'col-resize' : 'row-resize'
  return (
    <div className={cx('pane-resize-bar', barClass)}
    onMouseDown={e => startResize(scope, sectionId, e)}></div>
  );
};

PaneResizeBar = connect(null, (dispatch, ownProps) => {
  return {
    startResize: (scope, sectionId, e) => {
      if (e.button !== 0) return; // do nothing unless left button pressed
      e.preventDefault();

      // dispatch(PaneActions.setCover(true));
      var [oX, oY] = [e.pageX, e.pageY];

      const handleResize = (e) => {
        var [dX, dY] = [oX - e.pageX, oY - e.pageY]
        dispatch(PaneActions.resize(scope, sectionId, dX, dY));
        [oX, oY] = [e.pageX, e.pageY];
        ownProps.resizingListeners.forEach(listener => listener());
      }

      const stopResize = () => {
        window.document.removeEventListener('mousemove', handleResize);
        window.document.removeEventListener('mouseup', stopResize);
        dispatch({type: 'PANE_CONFIRM_RESIZE'});
      }

      window.document.addEventListener('mousemove', handleResize);
      window.document.addEventListener('mouseup', stopResize);
    }
  }
})(PaneResizeBar);


class PaneView extends Component {
  static propTypes = {
    id: PropTypes.string,
    flexDirection: PropTypes.string,
    views: PropTypes.array,
    size: PropTypes.number,
  };

  static childContextTypes = {
    onResizing: PropTypes.func
  };

  getChildContext() {
    return {
      onResizing: this.onResizing.bind(this)
    };
  }

  onResizing(listener) {
    this.resizingListeners.push(listener);
  }

  constructor(props) {
    super(props);
    this.resizingListeners = [];
  }

  render() {
    var { views, flexDirection, className, style, scope } = this.props;
    if (views.length === 1 && !Array.isArray(views[0].views) ) { views = [this.props] };
    var Subviews = views.map( _props => {
      return <Pane
        key={_props.id}
        id={_props.id}
        views={_props.views}
        size={_props.size}
        flexDirection={_props.flexDirection}
        parentFlexDirection={flexDirection}
        scope={scope}
        resizingListeners={this.resizingListeners}
        {..._props}
      />
    });

    return (
      <div className={cx('panes', className)}
      style={{flexDirection: flexDirection, ...style}}>{ Subviews }</div>
    );
  }
}

export default PaneView
