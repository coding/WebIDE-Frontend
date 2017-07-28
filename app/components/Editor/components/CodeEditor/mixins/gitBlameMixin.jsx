import moment from 'moment'
import { autorun } from 'mobx'
import mtln from 'utils/multiline'

export default {
  key: 'gitBlameGutter',
  componentDidMount () {
    this.dispose = autorun('renderGitBlameGutter', () => {
      // set gutter first
      const gitBlameGutterId = 'git-blame-gutter'
      const editor = this.editor
      const cm = this.cm
      const gutters = editor.options.gutters

      if (!editor.gitBlame.show) {
        if (!gutters.includes(gitBlameGutterId)) return
        cm.clearGutter(gitBlameGutterId)
        editor.options.gutters = gutters.filter(id => id !== gitBlameGutterId)
        cm.refresh()
        return
      }

      const gitBlameData = editor.gitBlame.data || []

      if (gutters.indexOf(gitBlameGutterId) === -1) {
        editor.options.gutters = [...gutters, gitBlameGutterId]
      }

      gitBlameData.forEach(({ author, shortName: commitHash }, ln) => {
        if (!commitHash) return
        const fullMessage = mtln`
          commit: ${commitHash}
          time: ${moment(author.when).format('YYYY-MM-DD hh:mm:ss')}
          author: ${author.name}<${author.emailAddress}>`
        const blameText = document.createElement('div')
        blameText.innerHTML = `<div title='${fullMessage}'>${commitHash} ${moment(author.when).format('YYYY-MM-DD')} ${author.name}</div>`
        cm.setGutterMarker(ln, 'git-blame-gutter', blameText)
      })

      cm.refresh()
    })
  },
  componentWillUnmount () {
    this.dispose()
  }
}
