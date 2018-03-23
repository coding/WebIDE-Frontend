import React, { Component } from 'react'
import i18n from 'utils/createI18n'
import Header from './Header'
import Footer from './Footer'
import cx from 'classnames'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import Swiper from 'react-id-swiper'
import 'react-id-swiper/src/styles/css/swiper.css'

class Intro extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }
  componentDidMount () {
    
  }
  render () {
    return (
      <div className='intro-page'>
        <Header />
        <div className='intro-header'>
          <h2>前所未有的开发体验</h2>
          <p>Cloud Studio 为开发提供了一个永不间断的云端工作站，不管有没有开发经验都可以毫无门槛的体验云端开发的乐趣，支持绝大部分编程语言，包括 HTML5、PHP、Python、Java、Ruby、小程序等等。Cloud Studio 提供了完整的 Linux 环境，并且支持自定义域名指向，动态计算资源调整，可以完成各种应用的开发编译与部署。</p>
          <ul>
            <li>随处可用，低门槛</li>
            <li>无需下载安装程序</li>
            <li>一键切换开发环境</li>
            <li>开发资源动态调整</li>
          </ul>
          <a href='/ws/default' className='btn btn-try'>立即体验</a>
        </div>
        <div className='intro-counter'>
          今天，在 <div className='logo'></div> 上进行在线开发的用户累计使用时间为 <span className='num'>1,040,688,000</span> 秒
        </div>
        <div className='intro-feature'>
          <h2>独一无二的特性</h2>
          <Tabs>
            <TabList>
              <Tab>多环境切换</Tab>
              <Tab>协同编辑</Tab>
              <Tab>全功能 Terminal</Tab>
            </TabList>

            <TabPanel>
              <div className='tab-panel'>
                <div className='tab-panel-img'>
                  <img src='https://dn-coding-net-production-pp.qbox.me/5f892a55-9e72-4a2b-a834-92c883deebd0.png' alt='feature_1'/>
                </div>
                <div className='tab-panel-intro'>
                  <h3>一键切换开发环境</h3>
                  <p>告别繁琐的开发环境准备工作，一键切换各种预置的开发环境。</p>
                  <h3>保存与分享环境</h3>
                  <p>对开发环境进行改动或升级后，可保存当前开发环境以便随时切换。在环境列表中可查看与切换项目成员保存的开发环境，新成员即刻上手开发。</p>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div className='tab-panel'>
                <div className='tab-panel-img'>
                  <img src='https://dn-coding-net-production-pp.qbox.me/b0e4ce12-a4ed-4f78-b7c6-e2dcf66d32df.png' alt='feature_2'/>
                </div>
                <div className='tab-panel-intro'>
                  <h3>多人协作</h3>
                  <p>支持主动申请和被动邀请，多人同时编辑一个工作空间</p>
                  <h3>多光标输入</h3>
                  <p>多个多人同时编辑同一文件，多光标显示，输入内容一目了然。</p>
                  <h3>聊天室</h3>
                  <p>侧边栏聊天室，让实时沟通更便捷。</p>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div className='tab-panel'>
                <div className='tab-panel-img'>
                  <img src='https://dn-coding-net-production-pp.qbox.me/cfa1e9da-9246-4da6-896f-009c445fc9fa.png' alt='feature_3' />
                </div>
                <div className='tab-panel-intro'>
                  <h3>支持 Unicode 宽字符</h3>
                  <p>完美支持宽字符的输入和显示。</p>
                  <h3>完善的 Web 终端模拟器</h3>
                  <p>兼容标准的终端模拟器，支持 Bash，Zsh，Fish 等各种 Shell，支持自定义 PS1。默认集成了 Zsh 和 oh-my-zsh 以达到更好的输入支持。</p>
                  <h3>提供 root 权限</h3>
                  <p>默认用户 sudo 免密码，用户可以自由安装偏好的软件包。</p>
                </div>
              </div>
            </TabPanel>
          </Tabs>
        </div>
        <div className='intro-swiper'>
          <h2>完整的云端 IDE</h2>
          <div className='intro-swiper-c'>
            <Swiper pagination={{
              el: '.swiper-pagination',
              clickable: true
            }}>
              <div>
                <img src='https://dn-coding-net-production-pp.qbox.me/3c2d37c6-1e83-4811-acf2-2c779094ef53.png' alt='screen-1' />
                <div className="desc">小程序开发</div>
              </div>
              <div>
                <img src='https://dn-coding-net-production-pp.qbox.me/4837bb50-5338-42e8-8f3a-a24974e6e891.png' alt='screen-2' />
                <div className="desc">协同编辑</div>
              </div>
            </Swiper>
          </div>
        </div>
        <div className="intro-corp">
          <div className='logo'></div> 由 <i className="c-logo-icon"></i> 提供云计算支持
        </div>
        <Footer />
      </div>
    )
  }
}

export default Intro
