import { createTransformer, toJS, extendObservable, observable, computed, action } from 'mobx'
import state, { TreeNode } from './state'

class LibTreeNode extends TreeNode {
  constructor (props) {
    super(props)
  }
}

const rootLib = new LibTreeNode({
  index: 1,
  id: 'jre',
  name: 'JRE System Library',
  parent: state.shadowRoot,
  isDir: true,
  icon: 'fa fa-book'
})

new LibTreeNode({ name: 'rt.jar', id: -305413439, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'zipfs.jar', id: -541705623, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'jaccess.jar', id: 181448553, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'icedtea-sound.jar', id: 1342013633, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'localedata.jar', id: -2137101031, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'sunec.jar', id: 35163209, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'dnsns.jar', id: -1901813143, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'nashorn.jar', id: 2095422993, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'sunpkcs11.jar', id: 100563889, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'cldrdata.jar', id: 900048897, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'sunjce_provider.jar', id: 1922509689, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'logback-core-1.1.8.jar', id: -1554318895, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'jboss-logging-3.3.0.Final.jar', id: 1462975537, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'hibernate-validator-5.2.4.Final.jar', id: 2132176329, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'spring-expression-4.3.5.RELEASE.jar', id: 1144955489, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'spring-boot-starter-1.4.3.RELEASE.jar', id: 440702241, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'spring-boot-autoconfigure-1.4.3.RELEASE.jar', id: 730157921, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'spring-aop-4.3.5.RELEASE.jar', id: -606900815, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'tomcat-embed-core-8.5.6.jar', id: 1665926641, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'validation-api-1.1.0.Final.jar', id: -55246087, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'jackson-core-2.8.5.jar', id: -966651207, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'spring-boot-1.4.3.RELEASE.jar', id: 957049617, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'slf4j-api-1.7.22.jar', id: -190542903, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'jul-to-slf4j-1.7.22.jar', id: 505001313, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'spring-webmvc-4.3.5.RELEASE.jar', id: 403730897, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'classmate-1.3.3.jar', id: 1226366361, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'spring-core-4.3.5.RELEASE.jar', id: 1707699353, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'spring-context-4.3.5.RELEASE.jar', id: -374685415, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'log4j-over-slf4j-1.7.22.jar', id: -402775711, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'logback-classic-1.1.8.jar', id: -42546359, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'jackson-databind-2.8.5.jar', id: 1304351993, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'snakeyaml-1.17.jar', id: -1939424887, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'jackson-annotations-2.8.5.jar', id: 462993217, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'tomcat-embed-el-8.5.6.jar', id: 58800177, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'spring-boot-starter-tomcat-1.4.3.RELEASE.jar', id: 1320285545, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'jcl-over-slf4j-1.7.22.jar', id: 913827369, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'spring-beans-4.3.5.RELEASE.jar', id: 1267712441, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'spring-boot-starter-web-1.4.3.RELEASE.jar', id: -1691015335, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'spring-web-4.3.5.RELEASE.jar', id: 668890177, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'spring-boot-starter-logging-1.4.3.RELEASE.jar', id: -1344379471, parent: rootLib, isDir: false, icon: 'fa fa-archive' })
new LibTreeNode({ name: 'tomcat-embed-websocket-8.5.6.jar', id: 803734113, parent: rootLib, isDir: false, icon: 'fa fa-archive' })

extendObservable(state, { rootLib })

export default LibTreeNode
