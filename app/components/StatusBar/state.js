import { observable, autorun } from 'mobx'

const state = observable({
  messages: observable.map(),
  displayBar: false,
  uploadList: observable.map({
    // 'aaa.txt': { percentCompleted: 0, size: 100020303 },
    // 'bbb.txt': { percentCompleted: 50, size: 200020303 },
  }),
  setFileUploadInfo: ({ path, info }) => {
    const { percentCompleted, size } = info
    state.uploadList.set(path, { percentCompleted, size })
    if (percentCompleted === 100) {
      state.checkUploadInfo()
    }
  },
  removeFileUploadInfo: ({ path }) => {
    state.uploadList.delete(path)
  },
  checkUploadInfo: () => {
    let totalPercent = 0
    const uploadList = state.uploadList.entries()
    uploadList.forEach((item) => {
      totalPercent += item[1].percentCompleted
    })
    if (totalPercent === 100 * uploadList.length) {
      setTimeout(() => state.uploadList = observable.map(), 3000)
    }
  }
})

export default state
