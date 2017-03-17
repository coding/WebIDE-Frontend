import React, { Component, PropTypes } from 'react'
import config from '../../config'
import axios from 'axios'

const previewPic = 'https://dn-coding-net-production-static.qbox.me/static/5d487aa5c207cf1ca5a36524acb953f1.gif'
class ImageEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  getImageUrl () {
    const { baseURL, spaceKey } = config
    const backgroundImageUrl =
     `${baseURL}/workspaces/${spaceKey}/raw?path=${encodeURIComponent(this.props.path)}`
    axios.get(backgroundImageUrl, {
      responseType: 'blob',
      headers: {
        'X-Space-Key': config.spaceKey
      }
    }).then(res => {
      const blob = res.data
      const imageUrl = window.URL.createObjectURL(blob)
      this.setState({ imageUrl })
    })
  }

  componentDidMount () {
    this.getImageUrl()
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
    return (
    <div style={{ textAlign: 'center', height: '100%' }}>
      <img
        alt="preview"
        style={{
          background: `url("${previewPic}") right bottom #eee`,
          testAlign: 'center',
          height: '100%'
        }}
        src={this.state.imageUrl}
      />
    </div>)
  }
}

ImageEditor.propTypes = {
  path: PropTypes.string
};


export default ImageEditor
