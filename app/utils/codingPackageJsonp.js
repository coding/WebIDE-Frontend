function codingPackageJsonp (exports) {
  codingPackageJsonp.data = exports
}

Object.defineProperty(codingPackageJsonp, 'data', {
  set (value) {
    if (this.current && this.current.startsWith('group')) {
      // const groupName = this.current.split('_')[1]
      const values = Array.isArray(value) ? value : [value]
      this.cache = (this.cache || []).concat(values)
    } else {
      this.cache = value
    }
  },
  get () { return this.cache }
})

codingPackageJsonp.groups = {}
codingPackageJsonp.current = ''

window.codingPackageJsonp = codingPackageJsonp
