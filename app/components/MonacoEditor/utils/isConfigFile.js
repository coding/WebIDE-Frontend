function isJavaConfigFile (path) {
  return path && (path.endsWith('pom.xml') || path.endsWith('.gradle'))
}

export default {
  java: isJavaConfigFile,
}
