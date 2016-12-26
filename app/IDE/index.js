// This is the access point to the API that Coding WebIDE exposes
// Idea taken from atom, this is the equivalence of `window.atom`
//
// see: https://github.com/atom/atom/blob/master/src/atom-environment.coffee

import IdeEnvironment from './IdeEnvironment'
export default window.ide = IdeEnvironment()
