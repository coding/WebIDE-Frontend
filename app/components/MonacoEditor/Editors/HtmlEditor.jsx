import React, { Component } from 'react'
import { autorun, extendObservable, observable } from 'mobx'
import debounce from 'lodash/debounce'
import { observer } from 'mobx-react'
import CodeEditor from './CodeEditor'
import * as actions from './actions'

@observer
class PreviewEditor extends Component {
    render() {
        const { content } = this.props;
        return (
            <div name='markdown_preview' className='markdown content'>
                <div dangerouslySetInnerHTML={{ __html: content }}></div>
            </div>
        )
    }
}

const startResize = (sectionId, e, actions, state) => {
    if (e.button !== 0) return // do nothing unless left button pressed
    e.preventDefault()
    let oX = e.pageX // origin x-distince
    let oY = e.pageY // origin y-distince
    const handleResize = (e) => {
        // get destination of difference of two distince x
        const dX = oX - e.pageX
        // get destination of difference of two distince y
        let dY = oY - e.pageY
        oX = e.pageX // reset x
        oY = e.pageY // reset y
        //console.log(sectionId, dX, dY, state)
        actions.htmlEditorResize(sectionId, dX, dY, state)
    }

    const stopResize = () => {
        window.document.removeEventListener('mousemove', handleResize)
        window.document.removeEventListener('mouseup', stopResize)
    }
    window.document.addEventListener('mousemove', handleResize)
    window.document.addEventListener('mouseup', stopResize)
}

const ResizeBar = ({ sectionId, startResize, actions, state }) => {
    return <div className="resize-bar col-resize" onMouseDown={e => startResize(sectionId, e, actions, state)}></div>
}

@observer
class HtmlEditor extends Component {
    constructor(props) {
        super(props);
        if (!props.tab.leftGrow) {
            extendObservable(props.tab, {
                leftGrow: 50,
                rightGrow: 50,
                showBigSize: false,
                showPreview: true,
            });
        }
        this.state = observable({ previewContent: '' });
    }

    componentDidMount() {
        autorun(() => this.setPreviewContent(this.props.editorInfo.file.content))
    }

    setPreviewContent = debounce(content => this.state.previewContent = content, 500)

    render() {
        const { editor, tab, editorInfo } = this.props;
        const { leftGrow, rightGrow, showBigSize, showPreview } = tab;
        const editorStyle = { flexGrow: leftGrow, display: !showBigSize || (showBigSize && !showPreview) ? 'block' : 'none' };
        const previewStyle = { flexGrow: rightGrow };
        const expandIcon = showBigSize ? 'fa fa-expand' : 'fa fa-compress';
        const eyeIcon = showPreview ? 'fa fa-eye-slash' : 'fa fa-eye';
        return (
            <div className="html-editor-container">
                <div className="preview-action">
                    {
                        showPreview && <i className={expandIcon} onClick={() => actions.togglePreviewSize({ state: tab })}></i>
                    }
                    <i className={eyeIcon} onClick={() => actions.togglePreview({ state: tab })}></i>
                </div>
                <div className="wrap">
                    <div name='editor' id='editor_preview_html_editor' style={editorStyle}>
                        <CodeEditor editor={editor} editorInfo={editorInfo} tab={tab} />
                    </div>
                    {
                        (showPreview && !showBigSize)
                        && <ResizeBar sectionId={'editor_preview_markdown'} startResize={startResize} actions={actions} state={tab}/>
                    }
                    {
                        showPreview && (
                            <div name='preview' id='editor_preview_html_preview' style={previewStyle}>
                                <PreviewEditor content={this.state.previewContent} editor={editor} />
                            </div>
                        )
                    }
                </div>
            </div>
        );
    }
}

export default HtmlEditor;
