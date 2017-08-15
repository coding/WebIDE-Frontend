import { observable, autorun } from 'mobx'
import mtln from './multiline'

class DynamicStyle {
  constructor () {
    const style = document.createElement('style')
    document.body.appendChild(style)

    autorun(() => {
      style.innerHTML = this.styles.values().reduce((concatStyleText, styleText) => {
        return concatStyleText + '\n' + mtln(styleText)
      }, '')
    })
  }

  @observable styles = observable.map()

  get (key) {
    return this.styles.get(key)
  }

  set (key, value) {
    this.styles.set(key, value)
  }

}

const dynamicStyle = new DynamicStyle()

export default dynamicStyle
