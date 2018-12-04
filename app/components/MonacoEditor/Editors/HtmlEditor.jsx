import React, { Component } from 'react';
import { autorun, extendObservable } from 'mobx';
import { observer } from 'mobx-react';
import CodeEditor from './CodeEditor';
import * as actions from './actions';
import uniqueId from 'lodash/uniqueId';
import config from '../../../config';

@observer
class PreviewEditor extends Component {
    render() {
        const { url, isResizing } = this.props;
        return (
            <div className='preview-iframe'>
                <iframe src={url}></iframe>
                {isResizing && <div className='preview-iframe-msk'></div>}
            </div>
        )
    }
}

const startResize = (e, actions, state) => {
    if (e.button !== 0) return // do nothing unless left button pressed
    e.preventDefault();
    state.isResizing = true;
    let oX = e.pageX; // origin x-distince
    const handleResize = (e) => {
        // get destination of difference of two distince x
        const dX = oX - e.pageX;
        oX = e.pageX; // reset x
        actions.editorResize(dX, state, 'editor_preview_html_editor', 'editor_preview_html_preview');
    }
    const stopResize = () => {
        state.isResizing = false;
        window.document.removeEventListener('mousemove', handleResize)
        window.document.removeEventListener('mouseup', stopResize)
    }
    window.document.addEventListener('mousemove', handleResize)
    window.document.addEventListener('mouseup', stopResize)
}

const ResizeBar = ({ startResize, actions, state }) => {
    return <div className="resize-bar col-resize" onMouseDown={e => startResize(e, actions, state)}></div>
}

@observer
class HtmlEditor extends Component {
    constructor(props) {
        super(props);
        if (!props.tab.previewUniqueId) {
            extendObservable(props.tab, {
                leftGrow: 50,
                rightGrow: 50,
                showBigSize: false,
                showPreview: false,
                previewUniqueId: '1',
                isResizing: false,
            });
        }
    }

    componentDidMount() {
        autorun(() => {
            if (this.props.tab.file && this.props.tab.file.isSynced) {
                this.props.tab.previewUniqueId = uniqueId();
            }
        })
    }

    render() {
        const { tab, editorInfo } = this.props;
        const { leftGrow, rightGrow, showBigSize, showPreview, previewUniqueId } = tab;
        const editorStyle = { flexGrow: leftGrow, display: !showBigSize || (showBigSize && !showPreview) ? 'block' : 'none' };
        const previewStyle = { flexGrow: rightGrow };
        const expandIcon = showBigSize ? 'fa fa-compress' : 'fa fa-expand';
        const eyeIcon = showPreview ? 'fa fa-eye-slash' : 'fa fa-eye';
        return (
            <div className="html-editor-container">
                <div className="preview-action">
                    {showPreview && <i className={expandIcon} onClick={() => actions.togglePreviewSize({ state: tab })}></i>}
                    <i className={eyeIcon} onClick={() => actions.togglePreview({ state: tab })}></i>
                </div>
                <div className="wrap">
                    <div id='editor_preview_html_editor' style={editorStyle}>
                        <CodeEditor editorInfo={editorInfo} tab={tab} />
                    </div>
                    {(showPreview && !showBigSize) && (
                        <ResizeBar startResize={startResize} actions={actions} state={tab} />
                    )}
                    {showPreview && (
                        <div id='editor_preview_html_preview' style={previewStyle}>
                            <PreviewEditor url={`${config.previewURL}${editorInfo.filePath}?r=${previewUniqueId}`} isResizing={tab.isResizing} />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default HtmlEditor;
