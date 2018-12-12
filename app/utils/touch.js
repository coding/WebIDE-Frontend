let timeOutEvent = 0

const gtouchstart = (callback, ...args) => {   
  timeOutEvent = setTimeout(() => {
      callback()
  }, 500) 
}   
   
const gtouchend = () => {
  clearTimeout(timeOutEvent)
}   
  
const gtouchmove = () => {   
  clearTimeout(timeOutEvent)
}

export {
    gtouchstart, gtouchend, gtouchmove
}
