
/* eslint-disable */
const modeInfos = [{
  "id": "plaintext",
  "extensions": [".txt", ".gitignore", ".prefs"],
  "aliases": ["Plain Text", "text"],
  "mimetypes": ["text/plain"]
}, {
  "id": "json",
  "extensions": [".json", ".bowerrc", ".jshintrc", ".jscsrc", ".eslintrc", ".babelrc"],
  "aliases": ["JSON", "json"],
  "mimetypes": ["application/json"]
}, {
  "id": "typescript",
  "extensions": [".ts", ".tsx"],
  "aliases": ["TypeScript", "ts", "typescript"],
  "mimetypes": ["text/typescript"]
}, {
  "id": "javascript",
  "extensions": [".js", ".es6", ".jsx"],
  "firstLine": "^#!.*\\bnode",
  "filenames": ["jakefile"],
  "aliases": ["JavaScript", "javascript", "js"],
  "mimetypes": ["text/javascript"]
}, {
  "id": "bat",
  "extensions": [".bat", ".cmd", ".sh"],
  "aliases": ["Batch", "bat"]
}, {
  "id": "coffeescript",
  "extensions": [".coffee"],
  "aliases": ["CoffeeScript", "coffeescript", "coffee"],
  "mimetypes": ["text/x-coffeescript", "text/coffeescript"]
}, {
  "id": "c",
  "extensions": [".c", ".h"],
  "aliases": ["C", "c"]
}, {
  "id": "cpp",
  "extensions": [".cpp", ".cc", ".cxx", ".hpp", ".hh", ".hxx"],
  "aliases": ["C++", "Cpp", "cpp"]
}, {
  "id": "csharp",
  "extensions": [".cs", ".csx"],
  "aliases": ["C#", "csharp"]
}, {
  "id": "csp",
  "extensions": [],
  "aliases": ["CSP", "csp"]
}, {
  "id": "css",
  "extensions": [".css"],
  "aliases": ["CSS", "css"],
  "mimetypes": ["text/css"]
}, {
  "id": "dockerfile",
  "extensions": [".dockerfile"],
  "filenames": ["Dockerfile"],
  "aliases": ["Dockerfile"]
}, {
  "id": "fsharp",
  "extensions": [".fs", ".fsi", ".ml", ".mli", ".fsx", ".fsscript"],
  "aliases": ["F#", "FSharp", "fsharp"]
}, {
  "id": "go",
  "extensions": [".go"],
  "aliases": ["Go"]
}, {
  "id": "handlebars",
  "extensions": [".handlebars", ".hbs"],
  "aliases": ["Handlebars", "handlebars"],
  "mimetypes": ["text/x-handlebars-template"]
}, {
  "id": "html",
  "extensions": [".html", ".htm", ".shtml", ".xhtml", ".mdoc", ".jsp", ".asp", ".aspx", ".jshtm", ".wpy"],
  "aliases": ["HTML", "htm", "html", "xhtml"],
  "mimetypes": ["text/html", "text/x-jshtm", "text/template", "text/ng-template"]
}, {
  "id": "ini",
  "extensions": [".ini", ".properties", ".gitconfig", ".editorconfig"],
  "filenames": ["config", ".gitattributes", ".gitconfig", ".editorconfig"],
  "aliases": ["Ini", "ini"]
}, {
  "id": "java",
  "extensions": [".java", ".jav", ".class"],
  "aliases": ["Java", "java"],
  "mimetypes": ["text/x-java-source", "text/x-java"]
}, {
  "id": "less",
  "extensions": [".less"],
  "aliases": ["Less", "less"],
  "mimetypes": ["text/x-less", "text/less"]
}, {
  "id": "lua",
  "extensions": [".lua"],
  "aliases": ["Lua", "lua"]
}, {
  "id": "markdown",
  "extensions": [".md", ".markdown", ".mdown", ".mkdn", ".mkd", ".mdwn", ".mdtxt", ".mdtext"],
  "aliases": ["Markdown", "markdown"]
}, {
  "id": "msdax",
  "extensions": [".dax", ".msdax"],
  "aliases": ["DAX", "MSDAX"]
}, {
  "id": "mysql",
  "extensions": [],
  "aliases": ["MySQL", "mysql"]
}, {
  "id": "objective-c",
  "extensions": [".m"],
  "aliases": ["Objective-C"]
}, {
  "id": "pgsql",
  "extensions": [],
  "aliases": ["PostgreSQL", "postgres", "pg", "postgre"]
}, {
  "id": "php",
  "extensions": [".php", ".php4", ".php5", ".phtml", ".ctp"],
  "aliases": ["PHP", "php"],
  "mimetypes": ["application/x-php"]
}, {
  "id": "postiats",
  "extensions": [".dats", ".sats", ".hats"],
  "aliases": ["ATS", "ATS/Postiats"]
}, {
  "id": "powershell",
  "extensions": [".ps1", ".psm1", ".psd1"],
  "aliases": ["PowerShell", "powershell", "ps", "ps1"]
}, {
  "id": "pug",
  "extensions": [".jade", ".pug"],
  "aliases": ["Pug", "Jade", "jade"]
}, {
  "id": "python",
  "extensions": [".py", ".rpy", ".pyw", ".cpy", ".gyp", ".gypi"],
  "aliases": ["Python", "py"],
  "firstLine": "^#!/.*\\bpython[0-9.-]*\\b"
}, {
  "id": "r",
  "extensions": [".r", ".rhistory", ".rprofile", ".rt"],
  "aliases": ["R", "r"]
}, {
  "id": "razor",
  "extensions": [".cshtml"],
  "aliases": ["Razor", "razor"],
  "mimetypes": ["text/x-cshtml"]
}, {
  "id": "redis",
  "extensions": [".redis"],
  "aliases": ["redis"]
}, {
  "id": "redshift",
  "extensions": [],
  "aliases": ["Redshift", "redshift"]
}, {
  "id": "ruby",
  "extensions": [".rb", ".rbx", ".rjs", ".gemspec", ".pp"],
  "filenames": ["rakefile"],
  "aliases": ["Ruby", "rb"]
}, {
  "id": "rust",
  "extensions": [".rs", ".rlib"],
  "aliases": ["Rust", "rust"]
}, {
  "id": "sb",
  "extensions": [".sb"],
  "aliases": ["Small Basic", "sb"]
}, {
  "id": "scss",
  "extensions": [".scss"],
  "aliases": ["Sass", "sass", "scss"],
  "mimetypes": ["text/x-scss", "text/scss"]
}, {
  "id": "sol",
  "extensions": [".sol"],
  "aliases": ["sol", "solidity", "Solidity"]
}, {
  "id": "sql",
  "extensions": [".sql"],
  "aliases": ["SQL"]
}, {
  "id": "swift",
  "aliases": ["Swift", "swift"],
  "extensions": [".swift"],
  "mimetypes": ["text/swift"]
}, {
  "id": "vb",
  "extensions": [".vb"],
  "aliases": ["Visual Basic", "vb"]
}, {
  "id": "xml",
  "extensions": [".xml", ".dtd", ".ascx", ".csproj", ".config", ".wxi", ".wxl", ".wxs", ".xaml", ".svg", ".svgz", ".classpath", ".project"],
  "firstLine": "(\\<\\?xml.*)|(\\<svg)|(\\<\\!doctype\\s+svg)",
  "aliases": ["XML", "xml"],
  "mimetypes": ["text/xml", "application/xml", "application/xaml+xml", "application/xml-dtd"]
}, {
  "id": "yaml",
  "extensions": [".yaml", ".yml"],
  "aliases": ["YAML", "yaml", "YML", "yml"],
  "mimetypes": ["application/x-yaml"]
}]

function mergeExtensions () {
  return modeInfos.reduce((pre, cur) => {
    if (cur.extensions && cur.extensions.length > 0) {
      pre = pre.concat(cur.extensions)
    }
    return pre;
  }, []);
}

export default modeInfos

export const extensions = mergeExtensions()
