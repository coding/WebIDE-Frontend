export default [
  {
    id: 'bat',
    extensions: ['.bat', '.cmd'],
    aliases: ['Batch', 'bat'],
    mimeType: ['application/bat'],
    scopeName: 'source.batchfile'
  },
  {
    id: 'clojure',
    extensions: ['.clj', '.clojure'],
    aliases: ['Clojure', 'clojure'],
    mimeType: ['text/x-clojure'],
    scopeName: 'source.clojure'
  },
  {
    id: 'coffeescript',
    extensions: ['.coffee'],
    aliases: ['CoffeeScript', 'coffeescript', 'coffee'],
    mimeType: ['text/x-coffeescript', 'text/coffeescript'],
    scopeName: 'source.coffee'
  },
  {
    id: 'c',
    extensions: ['.c', '.h'],
    aliases: ['C', 'c'],
    mimeType: ['text/x-c', 'text/plain', 'text/x-csrc'],
    scopeName: 'source.c'
  },
  {
    id: 'cpp',
    extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx'],
    aliases: ['C++', 'Cpp', 'cpp'],
    mimeType: ['text/x-c', 'text/plain', 'text/x-c++src'],
    scopeName: 'source.cpp'
  },
  {
    id: 'csharp',
    extensions: ['.cs', '.csx'],
    aliases: ['C#', 'csharp'],
    mimeType: ['text/plain'],
    scopeName: 'source.cs'
  },
  {
    id: 'css',
    scopeName: 'source.css',
    extensions: ['.css'],
    mimeType: ['text/css'],
    aliases: ['CSS']
  },
  {
    id: 'dockerfile',
    extensions: ['.dockerfile'],
    filenames: ['Dockerfile'],
    aliases: ['Dockerfile'],
    mimeType: ['text/x-dockerfile'],
    scopeName: 'source.dockerfile'
  },
  {
    id: 'fsharp',
    extensions: ['.fs', '.fsi', '.ml', '.mli', '.fsx', '.fsscript'],
    aliases: ['F#', 'FSharp', 'fsharp'],
    mimeType: ['application/fsharp', 'application/fsharp-script', 'text/x-fsharp'],
    scopeName: 'source.fsharp'
  },
  {
    id: 'diff',
    extensions: ['.diff', '.patch'],
    aliases: ['Diff'],
    mimeType: ['text/x-diff'],
    scopeName: 'source.diff'
  },
  {
    id: 'go',
    extensions: ['.go'],
    aliases: ['Go'],
    mimtTypes: ['text/x-go'],
    scopeName: 'source.go'
  },
  {
    id: 'grovvy',
    extensions: ['.groovy'],
    aliases: ['Groovy'],
    mimtTypes: ['text/x-groovy'],
    scopeName: 'source.groovy'
  },
  {
    id: 'handlebars',
    extensions: ['.handlebars', '.hbs'],
    aliases: ['Handlebars', 'handlebars'],
    mimeType: ['text/x-handlebars-template'],
    scopeName: 'text.html.handlebars'
  },
  {
    id: 'html',
    extensions: [
      '.html',
      '.htm',
      '.shtml',
      '.xhtml',
      '.mdoc',
      '.jsp',
      '.asp',
      '.aspx',
      '.jshtm',
      '.wpy'
    ],
    aliases: ['HTML', 'htm', 'html', 'xhtml'],
    mimeType: ['text/html', 'text/x-jshtm', 'text/template', 'text/ng-template'],
    scopeName: 'text.html.basic'
  },
  {
    id: 'ini',
    extensions: ['.ini', '.properties', '.gitconfig', '.editorconfig'],
    filenames: ['config', '.gitattributes', '.gitconfig', '.editorconfig'],
    aliases: ['Ini', 'ini'],
    scopeName: 'source.ini',
    mimeType: ['text/x-properties']
  },
  {
    id: 'pug',
    extensions: ['.jade', '.pug'],
    aliases: ['Pug', 'Jade', 'jade'],
    mimeType: ['text/x-pug'],
    scopeName: 'text.jade'
  },
  {
    id: 'java',
    extensions: ['.java', '.jav', '.class'],
    aliases: ['Java', 'java'],
    mimeType: ['text/x-java-source', 'text/x-java'],
    scopeName: 'source.java'
  },
  {
    id: 'javascript',
    scopeName: 'source.js',
    extensions: ['.js', '.jsx', '.es6', '.mjs'],
    mimeType: ['application/javascript'],
    aliases: ['JavaScript']
  },
  {
    id: 'makefile',
    aliases: ['makefile', 'Makefile'],
    extensions: ['.make', '.GNUmakefile', '.makefile', '.Makefile', '.OCamlMakefile', '.mak', '.mk'],
    filenames: ['Makefile', 'OCamlMakefile'],
    scopeName: 'source.makefile'
  },
  {
    id: 'json',
    scopeName: 'source.json',
    extensions: [
      '.json',
      '.bowerrc',
      '.jshintrc',
      '.jscsrc',
      '.eslintrc',
      '.babelrc',
      '.webmanifest'
    ],
    mimeType: ['application/json', 'application/manifest+json'],
    aliases: ['JSON']
  },
  {
    id: 'less',
    extensions: ['.less'],
    aliases: ['Less', 'less'],
    mimeType: ['text/x-less', 'text/less'],
    scopeName: 'source.less'
  },
  {
    id: 'livescript',
    scopeName: 'source.livescript',
    extensions: ['.ls'],
    mimeType: ['text/x-livescript'],
    aliases: ['LiveScript']
  },
  {
    id: 'log',
    scopeName: 'text.log',
    extensions: ['.txt', '.text', '.conf', '.def', '.list', '.log'],
    mimeType: ['text/plain'],
    aliases: ['Text Log']
  },
  {
    id: 'lua',
    extensions: ['.lua'],
    aliases: ['Lua', 'lua'],
    scopeName: 'source.lua',
    mimeType: ['text/x-lua']
  },
  {
    id: 'objective-c',
    extensions: ['.m'],
    aliases: ['Objective-C'],
    scopeName: 'source.objc',
    mimeType: ['text/x-objectivec']
  },
  {
    id: 'perl',
    extensions: ['.pl', '.pm'],
    aliases: ['Perl'],
    scopeName: 'source.perl',
    mimeType: ['text/x-perl']
  },
  {
    id: 'php',
    extensions: ['.php', '.php4', '.php5', '.phtml', '.ctp'],
    aliases: ['PHP', 'php'],
    scopeName: 'source.php',
    mimeType: ['application/x-php']
  },
  {
    id: 'powershell',
    extensions: ['.ps1', '.psm1', '.psd1'],
    scopeName: 'source.powershell',
    aliases: ['PowerShell', 'powershell', 'ps', 'ps1'],
    mimeType: ['application/x-powershell']
  },
  {
    id: 'pug',
    extensions: ['.jade', '.pug'],
    scopeName: 'text.pug',
    aliases: ['Pug', 'Jade', 'jade'],
    mimeType: ['text/x-pug']
  },
  {
    id: 'python',
    extensions: ['.py', '.rpy', '.pyw', '.cpy', '.gyp', '.gypi'],
    aliases: ['Python', 'py'],
    scopeName: 'source.python',
    mimeType: ['text/x-python'],
    firstLine: '^#!/.*\\bpython[0-9.-]*\\b'
  },
  {
    id: 'r',
    extensions: ['.r', '.rhistory', '.rprofile', '.rt'],
    scopeName: 'source.r',
    aliases: ['R', 'r'],
    mimeType: ['text/x-rsrc']
  },
  {
    id: 'razor',
    extensions: ['.cshtml'],
    aliases: ['Razor', 'razor'],
    scopeName: 'text.html.cshtml',
    mimeType: ['text/x-cshtml']
  },
  {
    id: 'ruby',
    extensions: ['.rb', '.rbx', '.rjs', '.gemspec', '.pp'],
    filenames: ['rakefile'],
    aliases: ['Ruby', 'rb'],
    scopeName: 'source.ruby'
  },
  {
    id: 'rust',
    extensions: ['.rs', '.rlib'],
    scopeName: 'source.rust',
    aliases: ['Rust', 'rust'],
    mimeType: ['text/x-rustsrc']
  },
  {
    id: 'sass',
    extensions: ['.sass'],
    aliases: ['Sass', 'sass'],
    mimeType: ['text/x-sass'],
    scopeName: 'source.sass'
  },
  {
    id: 'scss',
    extensions: ['.scss'],
    aliases: ['Sass', 'sass', 'scss'],
    scopeName: 'source.scss',
    mimeType: ['text/x-scss', 'text/scss']
  },
  {
    id: 'markdown',
    extensions: ['.md', '.markdown', '.mdown', '.mkdn', '.mkd', '.mdwn', '.mdtxt', '.mdtext'],
    aliases: ['Markdown', 'markdown'],
    scopeName: 'text.html.markdown',
    mimeType: ['text/x-markdown']
  },
  {
    id: 'postscript',
    aliases: ['Postscript', 'postscript'],
    extensions: ['.ps', '.eps'],
    scopeName: 'source.postscript'
  },
  {
    id: 'scala',
    extensions: ['.scala'],
    aliases: ['Scala'],
    scopeName: 'source.scala',
    mimeType: ['text/x-scala']
  },
  {
    id: 'textile',
    aliases: ['Textile', 'textile'],
    extensions: ['.textile'],
    scopeName: 'text.html.textile',
    mimeType: ['text/textile']
  },
  {
    id: 'applescript',
    extensions: ['.scpt'],
    aliases: ['AppleScript', 'applescript'],
    mimeType: ['application/applescript'],
    scopeName: 'source.applescript'
  },
  {
    id: 'shellscript',
    extensions: ['.sh', '.bash'],
    aliases: ['Shell Script', 'sh'],
    scopeName: 'source.shell',
    mimeType: ['text/x-sh']
  },
  {
    id: 'smart',
    extensions: ['.tpl'],
    aliases: ['Smart'],
    scopeName: 'source.smarty',
    mimeType: ['text/x-smarty']
  },
  {
    id: 'sql',
    extensions: ['.sql'],
    aliases: ['SQL'],
    mimeType: ['text/x-sql'],
    scopeName: 'source.sql'
  },
  {
    id: 'stylus',
    extensions: ['.styl'],
    aliases: ['Stylus', 'Stylus'],
    scopeName: 'source.stylus',
    mimeType: ['text/x-styl']
  },
  {
    id: 'swift',
    aliases: ['Swift', 'swift'],
    extensions: ['.swift'],
    mimeType: ['text/swift'],
    scopeName: 'source.swift'
  },
  {
    id: 'typescript',
    scopeName: 'source.ts',
    extensions: ['.ts'],
    aliases: ['TypeScript', 'typescript'],
    mimeType: ['application/typescript']
  },
  {
    id: 'typescriptreact',
    scopeName: 'source.tsx',
    extensions: ['.tsx'],
    aliases: ['TypeScript React', 'typescript react'],
    mimeType: ['application/typescript']
  },
  {
    id: 'vb',
    extensions: ['.vb'],
    scopeName: 'source.asp.vb.net',
    aliases: ['Visual Basic', 'vb'],
    mimeType: ['text/x-vb']
  },
  {
    id: 'vue',
    scopeName: 'text.html.vue',
    extensions: ['.vue'],
    aliases: ['Vue'],
    mimeType: ['text/vue']
  },
  {
    id: 'xml',
    extensions: [
      '.xml',
      '.dtd',
      '.ascx',
      '.csproj',
      '.config',
      '.wxi',
      '.wxl',
      '.wxs',
      '.xaml',
      '.svg',
      '.svgz',
      '.classpath',
      '.project'
    ],
    firstLine: '(\\<\\?xml.*)|(\\<svg)|(\\<\\!doctype\\s+svg)',
    aliases: ['XML', 'xml'],
    mimeType: ['text/xml', 'application/xml', 'application/xaml+xml', 'application/xml-dtd'],
    scopeName: 'text.xml'
  },
  {
    id: 'yaml',
    extensions: ['.yaml', '.yml'],
    aliases: ['YAML', 'yaml', 'YML', 'yml'],
    mimeType: ['application/x-yaml'],
    scopeName: 'source.yaml'
  }
]
