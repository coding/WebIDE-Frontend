import React, { Component } from 'react';
import icons from 'file-icons-js';
import api from '../../../backendAPI';
import dispatchCommand from 'commands/dispatchCommand';
import i18n from 'utils/createI18n';

class FilePalette extends Component {
  constructor(props) {
    super(props);
    this.scrollLength = 15;
    this.timer = null;
    this.debounce = true;
    this.state = {
      filePool: [],
      fileBowl: [],
      fileList: [],
      isLoading: false,
      keyword: '',
      scrollIndex: this.scrollLength - 1,
      selectedIndex: 0,
      includeIngore: false,
    };
  }

  componentDidMount() {
    if (window.FilePaletteStorage) {
      this.setState({ filePool: window.FilePaletteStorage, fileList: window.FilePaletteStorage });
      return;
    }
    this.searchFiles();
  }

  componentDidUpdate() {
    this.refs.input.focus();
  }

  searchFiles() {
    const { keyword, includeIngore } = this.state;
    this.setState({ isLoading: true });
    // keyword如果是空字符串，返回所有文件
    api.searchFile(keyword, includeIngore).then(res => {
      if (keyword) {
        this.setState({
          fileBowl: res,
          fileList: res.slice(0, this.scrollLength),
          isLoading: false,
        });
      } else {
        this.setState({
          filePool: res,
          fileBowl: res,
          fileList: res.slice(0, this.scrollLength),
          isLoading: false,
        });
        window.FilePaletteStorage = res;
      }
      this.refs.input.focus();
    });
  }

  handleInput = (e) => {
    const keyword = e.target.value;
    this.setState({ keyword });
    this.handleFilter(keyword);
  }

  handleIngore = (e) => {
    if (this.debounce) {
      clearTimeout(this.timer);
      this.debounce = false;
      this.setState({ includeIngore: e.target.checked });
      this.searchFiles();
    }
    this.timer = setTimeout(() => this.debounce = true, 3000);
  }

  handleFilter(keyword) {
    const fileBowl = this.state.filePool.filter(file => file.path.includes(keyword));
    const fileList = fileBowl.slice(0, this.scrollLength);
    const len = this.scrollLength < fileBowl.length ? this.scrollLength - 1 : fileBowl.length - 1;
    this.setState({ fileBowl, fileList, selectedIndex: 0, scrollIndex: len });
  }

  openFile = (index) => {
    const node = this.state.fileList[index || this.state.selectedIndex];
    if (!node) {
      return;
    }
    dispatchCommand('modal:dismiss');
    dispatchCommand('file:open_file', node);
  }

  renderIcon = (item) => {
    const arr = item.path.split('/');
    return icons.getClassWithColor(arr[arr.length - 1]) || 'fa fa-file-text-o';
  }

  renderFile = (item) => {
    const path = item.path;
    if (!this.state.keyword) {
      return path;
    }
    const reg = new RegExp(this.state.keyword, 'gi');
    const res = [];
    let i = 0;
    let match;
    while (match = reg.exec(path)) {
      if (i < match.index) {
        res.push({ char: path.slice(i, match.index), highlight: false });
      }
      i = reg.lastIndex;
      res.push({ char: match[0], highlight: true });
    }
    if (i < path.length) {
      res.push({ char: path.slice(i), highlight: false });
    }
    return res.map((item, idx) => item.highlight ?
      <span className="highlight" key={idx}>{item.char}</span> :
      <span className="char" key={idx}>{item.char}</span>
    );
  }

  renderFiles = () => {
    const { isLoading, fileList, selectedIndex } = this.state;
    if (isLoading) {
      return (
        <li className="spinner">
          <i className="fa fa-spinner fa-pulse fa-spin"></i>
          {i18n`global.loading`}
        </li>
      );
    }
    return fileList.map((file, index) =>
      <li className={`file ${index === selectedIndex ? 'selected' : ''}`} onClick={e => this.openFile(index)} key={file.path}>
        <i className={`icon ${this.renderIcon(file)}`}></i>
        <span>{this.renderFile(file)}</span>
      </li>
    );
  }

  handleGoDown() {
    let { fileBowl, selectedIndex, scrollIndex } = this.state;
    const len = this.scrollLength < fileBowl.length ? this.scrollLength - 1 : fileBowl.length - 1;
    if (scrollIndex === fileBowl.length - 1 && selectedIndex === len) {
      return;
    }
    selectedIndex++;
    if (selectedIndex === this.scrollLength) {
      selectedIndex = this.scrollLength - 1;
      scrollIndex++;
      const fileList = fileBowl.slice(scrollIndex - this.scrollLength + 1, scrollIndex + 1);
      this.setState({ fileList, selectedIndex, scrollIndex });
    } else {
      this.setState({ selectedIndex });
    }
  }

  handleGoUp() {
    let { fileBowl, selectedIndex, scrollIndex } = this.state;
    const len = this.scrollLength < fileBowl.length ? this.scrollLength - 1 : fileBowl.length - 1;
    if (scrollIndex === len && selectedIndex === 0) {
      return;
    }
    selectedIndex--;
    if (selectedIndex < 0) {
      selectedIndex = 0;
      scrollIndex--;
      const fileList = fileBowl.slice(scrollIndex - this.scrollLength + 1, scrollIndex + 1);
      this.setState({ fileList, selectedIndex, scrollIndex });
    } else {
      this.setState({ selectedIndex });
    }
  }

  _onKeyDown = e => {
    switch (e.keyCode) {
      case 13: // enter
        this.openFile();
        break;
      case 40: // down
        this.handleGoDown();
        break;
      case 38: // up
        this.handleGoUp();
        break;
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    const { filePool, includeIngore } = this.state;
    return (
      <div className="file-palette-modal">
        <input type="text" className="form-control search" ref="input"
          placeholder={i18n.get('commandPalette.searchFiles')}
          disabled={filePool.length === 0}
          onChange={this.handleInput}
          onKeyDown={this._onKeyDown} />
        <input type="checkbox" className="include-ingore" checked={includeIngore} onChange={this.handleIngore} />
        <label>{i18n`commandPalette.includeIngore`}</label>
        <div className="board">
          <ul className="files">{this.renderFiles()}</ul>
        </div>
      </div>
    )
  }
}

export default FilePalette;
