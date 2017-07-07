export default function hasVimium () {
  try {
    const shadowRoot = document.querySelector('html > div').shadowRoot
    return Boolean(shadowRoot.querySelector('style').textContent.match(/vimium/))
  } catch (e) {
    return false
  }
}
