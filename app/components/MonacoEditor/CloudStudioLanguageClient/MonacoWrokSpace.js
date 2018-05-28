import { TernarySearchTree } from './vscodemap'


/* eslint-disable */
export const join = (...parts) => {
  // Not using a function with var-args because of how TS compiles
  // them to JS - it would result in 2*n runtime cost instead
  // of 1*n, where n is parts.length.

  let value = ''
  for (let i = 0; i < arguments.length; i++) {
    const part = arguments[i]
    if (i > 0) {
      // add the separater between two parts unless
      // there already is one
      const last = value.charCodeAt(value.length - 1)
      if (last !== 47 && last !== 92) {
        const next = part.charCodeAt(0)
        if (next !== 47 && next !== 92) {
          value += sep
        }
      }
    }
    value += part
  }

  return value
}


export class Workspace {
  constructor (_id, _name = '', folders = [], _configuration = null, _ctime) {
    this._id = _id
    this._name = _name
    this.folders = folders
    this._configuration = _configuration
    this._ctime = _ctime
  }

  update (workspace) {
    this.id = workspace.id
    this.name = workspace.name
    this.configuration = workspace.configuration
    this.ctime = workspace.ctime
    this.folders = workspace.folders
  }

  getFolder (resource) {
    if (!resource) {
      return null
    }

    return this._foldersMap.findSubstr(resource.toString());
  }

  updateFoldersMap () {
    this._foldersMap = TernarySearchTree.forPaths()
    for (const folder of this.folders) {
      this._foldersMap.set(folder.uri.toString(), folder)
    }
  }

  toJSON () {
    return {
      id: this.id,
      folders: this.folders,
      name: this.name,
      configuration: this.configuration
    }
  }
}

export class WorkspaceFolder {
  constructor (data, raw) {
    this.uri = data.uri
    this.index = data.index
    this.name = data.name
  }

  toResource (relativePath) {
    return this.uri.with({
      path: join(this.uri.path, relativePath)
    })
  }

  toJSON () {
    return {
      uri: this.uri,
      name: this.name,
      index: this.index
    }
  }
}

export const sep = '/'
