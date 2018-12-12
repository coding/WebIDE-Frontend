import { Component } from "react";
import { observer } from 'mobx-react'
import subscribeToSearch from 'commons/Search/subscribeToSearch'
import state from 'commons/Search/state'
import cx from 'classnames'
import { openFile } from 'commands/commandBindings/file'
import * as delegate from 'commons/Search/action'
import icons from 'file-icons-js'

export class SearchResultItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFolded: false
        };
    }

    handlePathClick = () => {
        this.setState({
          isFolded: !this.state.isFolded
        })
    }
    
    handleItemClick = (path, start, end, lineNum) => {
        const selection = new monaco.Selection(
            lineNum,
            start + 1,
            lineNum,
            end + 1,
        )
    
        openFile({ path, editor: { filePath: path, selection } })
    }

    render() {
        const {fileName, pattern, path, results} = this.props;
        const resultSize = results.length;
        const iconStr = 'file-icon ' + (icons.getClassWithColor(path) || 'fa fa-file-text-o');
        return (
            <div className='search-item' key={path}>
                <div className='search-item-path' onClick={this.handlePathClick}>
                <i
                    className={cx({
                    'fa fa-caret-right': this.state.isFolded,
                    'fa fa-caret-down': !this.state.isFolded
                    })}
                />
                <i className={iconStr} />
                {fileName}
                <span className='search-item-path-path'>{path}</span>
                <span className='search-item-count'>{resultSize}</span>
                </div>
        
                {
                    !this.state.isFolded && results.map(result => {
                    let {start, end, length, innerStart, innerEnd, line, lineNum} = result;
                    return (
                        <div key={`${fileName}-${resultSize}-${lineNum}-${start}`} className='search-item-line' onClick={() => this.handleItemClick(path, innerStart, innerEnd, lineNum)}>
                            {line && <span className='search-item-content'>{line.substring(0, innerStart)}<b>{line.substring(innerStart, innerEnd)}</b>{line.substring(innerEnd)}</span>}
                        </div>
                    )})
                }
            </div>
        )
    }

}

@observer
class SearchPanel extends Component {
    componentDidMount () {
        subscribeToSearch()
    }

    onKeyDown = (e) => {
        if (e.keyCode === 13) {
          this.searchTxt()
        }
    }
    
    handleKeywordChange = (e) => {
        state.searching.pattern = e.target.value
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation()
    }
    
    searchTxt = () => {
        if(state.searching.pattern.length == 0 || state.searching.pattern.trim() == '') {
            return ;
        }
        if(state.ws.first) {
            state.ws.first = false
        }
        if(state.searching.isPattern) {
            delegate.searchPattern(state.searching);
        } else {
            delegate.searchString(state.searching);
        }
    }
    
    renderResult () {
        let content = '';
        if (state.ws.first) {
            content = ''
        } else if (!state.searched.end) {
            content = i18n`panel.left.searching`
        } else if(state.searched.message !== '') {
            content = state.searched.message;
        } else if (state.searched.results.length != 0) {
            const pattern = state.searching.pattern;
            const files = state.searched.results.length
            let number = 0
            let count = 0

            content = state.searched.results.map((searchChunk) => {
                count++
                number += searchChunk.results.length
                return (<SearchResultItem
                    key={`${pattern}-${count}`}
                    fileName={searchChunk.fileName}
                    results={searchChunk.results}
                    pattern={pattern} 
                    path={searchChunk.path}
                    result={searchChunk.results}/>);
                })
            return (
                <div className='search-result-list'>
                    <div>{i18n`panel.result.tip${{ files, number }}`}</div>
                    {content}
                </div>
            )
        } else if(state.searched.taskId) {
            content = `${i18n.get('panel.result.blank')}`;
        }

        return (
            <div key={`search-result-list`} className='search-result-list'>
                {content}
            </div>
        )
    }

    render () {
        const { caseSensitive, word, isPattern } = state.searching

        return (
            <div className='search-panel'>
                <div className='search-panel-title'>
                    {i18n`panel.left.find`}
                </div>
                <div className='search-panel-input'>
                    <div className='search-controls'>
                        <input type='text'
                            className='form-control'
                            value={state.keyword}
                            onChange={this.handleKeywordChange}
                            onKeyDown={this.onKeyDown}
                            placeholder={i18n.get(`panel.left.placeholder`)}
                        />
                    </div>
                    <div className='search-checkbox'>
                        <span title={i18n.get('panel.checkbox.case')}
                          onClick={() => this.caseSensitive(caseSensitive)}
                          className={caseSensitive ? 'active' : ''}>{'Aa'}</span>
                        <span title={i18n.get('panel.checkbox.word')}
                          onClick={() => this.word(word)}
                          className={word ? 'active' : ''}>{'Al'}</span>
                        <span title={i18n.get('panel.checkbox.pattern')}
                          onClick={() => this.pattern(isPattern)}
                          className={isPattern ? 'active' : ''}>{'.*'}</span>
                    </div>
                </div>
                {this.renderResult()}
            </div>
        )
    }

    caseSensitive = caseSensitive => {
        state.searching.caseSensitive = !caseSensitive
    }

    word = word => {
        state.searching.word = !word
        if (!word) {
            state.searching.isPattern = false
        }
    }

    pattern = isPattern => {
        state.searching.isPattern = !isPattern
        if (!isPattern) {
            state.searching.word = false
        }
    }

}

export default SearchPanel
