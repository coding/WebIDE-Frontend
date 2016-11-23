import React, { PropTypes } from 'react';
import config from '../../config';

const previewPic = 'https://dn-coding-net-production-static.qbox.me/static/5d487aa5c207cf1ca5a36524acb953f1.gif';
const PictureEditor = ({ path = '' }) => {
  const { baseURL, spaceKey } = config;
  const backgroundImageUrl =
   `${baseURL}/workspaces/${spaceKey}/raw?path=${encodeURIComponent(path)}`;
  return (
    <div style={{ textAlign: 'center', height: '100%' }}>
      <img
        alt="preview"
        style={{
          background: `url("${previewPic}") right bottom #eee`,
          testAlign: 'center',
          height: '100%'
        }}
        src={backgroundImageUrl}
      />
    </div>);
};



PictureEditor.propTypes = {
  path: PropTypes.string
};


export default PictureEditor;
