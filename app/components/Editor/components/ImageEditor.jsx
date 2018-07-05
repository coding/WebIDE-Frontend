import React, { Component } from 'react'
import PropTypes from 'prop-types'
import config from 'config'
import { request } from 'utils'

const previewPic = 'https://dn-coding-net-production-static.qbox.me/static/5d487aa5c207cf1ca5a36524acb953f1.gif';

class ImageEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      imageUrl: null,
      background: null,
    }
  }

  getImageUrl () {
    const { baseURL, spaceKey } = config;
    const backgroundImageUrl = `${baseURL}/workspaces/${spaceKey}/raw?path=${encodeURIComponent(this.props.path)}`;
    request.get(backgroundImageUrl, {}, {
      responseType: 'blob',
    }).then(blob => {
      const imageUrl = window.URL.createObjectURL(blob)
      this.setState({ imageUrl })
    })
  }

  handleAlphaBackground() {
    const imgElement = new Image();
    imgElement.src = this.state.imageUrl;
    imgElement.crossOrigin = 'Anonymous';
    imgElement.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 10;
      canvas.height = 10;
      // 清除画布
      context.clearRect(0, 0, 10, 10);
      // 图片绘制在画布上
      context.drawImage(imgElement, 0, 0);
      // 获取图片像素信息
      const imageData = context.getImageData(0, 0, 10, 10).data;
      // 检测有没有透明数据
      let isAlphaBackground = false;
      for (let i = 3; i < imageData.length; i += 4) {
        if (imageData[i] != 255) {
          isAlphaBackground = true;
          break;
        }
      }
      if (isAlphaBackground) {
        this.setState({ background: `url("${previewPic}") right bottom #eee` });
      }
    }
  }

  componentDidMount () {
    this.getImageUrl()
  }

  componentDidUpdate() {
    if (this.state.background) {
      return;
    }
    this.handleAlphaBackground();
  }

  componentWillReceiveProps ({ path }) {
    if (this.props.path !== path) {
      if (this.state.imageUrl) window.URL.revokeObjectURL(this.state.imageUrl)
      this.getImageUrl()
    }
  }

  componentWillUnmount () {
    if (this.state.imageUrl) window.URL.revokeObjectURL(this.state.imageUrl)
  }

  render () {
    const { imageUrl, background } = this.state;
    const img = background
      ? <img className="editor-image-preview" style={{ background }} alt="preview" src={imageUrl} />
      : <img className="editor-image-preview" alt="preview" src={imageUrl} />;
    if (!imageUrl) {
      return (
        <div className="editor-spinner">
          <i className="fa fa-spinner fa-pulse"></i>
        </div>
      );
    }
    return img;
  }
}

ImageEditor.propTypes = {
  path: PropTypes.string
};

export default ImageEditor;
