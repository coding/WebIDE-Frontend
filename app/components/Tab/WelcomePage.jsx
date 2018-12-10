import React, { PureComponent } from 'react';

class WelcomePage extends PureComponent {
    state = {
        isVideoOn: false,
    }
    videoRef = null

    render() {
        const { isVideoOn } = this.state;
        return (
            <div className='welcome-page'>
                <div className='header'></div>
                <h1>欢迎使用<div className='logo'></div></h1>
                <div className='subtitle'>您将获得前所未有的云端开发体验</div>
                <div className='quick-start'>
                    <div className="video-btn" onClick={this.handleVideo}>
                        <i className="fa fa-play-circle"></i>
                        <span>概念视频</span>
                    </div>
                    <h2>快速入门</h2>
                    <ul>
                        <li><a href='https://dev.tencent.com/help/cloud-studio/editor-usage' target='_blank' rel='noopener noreferrer'>在线编辑</a></li>
                        <li><a href='https://dev.tencent.com/help/cloud-studio/environment' target='_blank' rel='noopener noreferrer'>编译运行</a></li>
                        <li><a href='https://dev.tencent.com/help/cloud-studio/collaborate' target='_blank' rel='noopener noreferrer'>协同开发</a></li>
                    </ul>
                </div>
                <div className='intro'>
                    <p>Cloud Studio 极大的降低了软件开发的门槛。即使您没有软件开发的经验，您也可以立即体验软件开发的魅力，毫无开发环境配置的繁琐。</p>
                    <ul className="demo-links"></ul>
                    <div className='btn-list'>
                        <a href='https://dev.tencent.com/help/doc/cloud-studio' target='_blank' rel='noopener noreferrer'>帮助文档</a>
                        {/* <a href='https://coding.net/help/doc/cloud-studio/video.html' target='_blank' rel='noopener noreferrer'>视频教程</a> */}
                    </div>
                    <div className='coding-logo'></div>
                </div>
                <div className={`video-pop${isVideoOn ? ' on' : ''}`} onClick={this.handleVideo}>
                    <video preload controls ref={this.handleVideoRef} onClick={event => event.stopPropagation()}>
                        <source type="video/mp4" src="https://cs-res.codehub.cn/cloud-studio-plugins-intro.mp4"></source>
                    </video>
                </div>
            </div>
        )
    }

    handleVideoRef = (ref) => {
        this.videoRef = ref;
    }

    handleVideo = () => {
        this.setState(prevState => {
            prevState.isVideoOn && this.videoRef.pause();
            return { isVideoOn: !prevState.isVideoOn };
        });
    }
}

export default WelcomePage
