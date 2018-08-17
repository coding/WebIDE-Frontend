function isJavaConfigFile (path) {
	return path.endsWith('pom.xml') || path.endsWith('.gradle')
}

export default {
  java: isJavaConfigFile,
}
