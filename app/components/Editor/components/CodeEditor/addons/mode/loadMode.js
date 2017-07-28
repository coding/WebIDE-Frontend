export default function loadMode (mode) {
  switch (mode) {
    case 'apl':
      return import(
        /* webpackChunkName: 'mode.apl' */
        'codemirror/mode/apl/apl.js'
      )
    case 'asciiarmor':
      return import(
        /* webpackChunkName: 'mode.asciiarmor' */
        'codemirror/mode/asciiarmor/asciiarmor.js'
      )
    case 'asn.1':
      return import(
        /* webpackChunkName: 'mode.asn.1' */
        'codemirror/mode/asn.1/asn.1.js'
      )
    case 'asterisk':
      return import(
        /* webpackChunkName: 'mode.asterisk' */
        'codemirror/mode/asterisk/asterisk.js'
      )
    case 'brainfuck':
      return import(
        /* webpackChunkName: 'mode.brainfuck' */
        'codemirror/mode/brainfuck/brainfuck.js'
      )
    case 'clike':
      return import(
        /* webpackChunkName: 'mode.clike' */
        'codemirror/mode/clike/clike.js'
      )
    case 'clojure':
      return import(
        /* webpackChunkName: 'mode.clojure' */
        'codemirror/mode/clojure/clojure.js'
      )
    case 'cmake':
      return import(
        /* webpackChunkName: 'mode.cmake' */
        'codemirror/mode/cmake/cmake.js'
      )
    case 'cobol':
      return import(
        /* webpackChunkName: 'mode.cobol' */
        'codemirror/mode/cobol/cobol.js'
      )
    case 'coffeescript':
      return import(
        /* webpackChunkName: 'mode.coffeescript' */
        'codemirror/mode/coffeescript/coffeescript.js'
      )
    case 'commonlisp':
      return import(
        /* webpackChunkName: 'mode.commonlisp' */
        'codemirror/mode/commonlisp/commonlisp.js'
      )
    case 'crystal':
      return import(
        /* webpackChunkName: 'mode.crystal' */
        'codemirror/mode/crystal/crystal.js'
      )
    case 'css':
      return import(
        /* webpackChunkName: 'mode.css' */
        'codemirror/mode/css/css.js'
      )
    case 'cypher':
      return import(
        /* webpackChunkName: 'mode.cypher' */
        'codemirror/mode/cypher/cypher.js'
      )
    case 'd':
      return import(
        /* webpackChunkName: 'mode.d' */
        'codemirror/mode/d/d.js'
      )
    case 'dart':
      return import(
        /* webpackChunkName: 'mode.dart' */
        'codemirror/mode/dart/dart.js'
      )
    case 'diff':
      return import(
        /* webpackChunkName: 'mode.diff' */
        'codemirror/mode/diff/diff.js'
      )
    case 'django':
      return import(
        /* webpackChunkName: 'mode.django' */
        'codemirror/mode/django/django.js'
      )
    case 'dockerfile':
      return import(
        /* webpackChunkName: 'mode.dockerfile' */
        'codemirror/mode/dockerfile/dockerfile.js'
      )
    case 'dtd':
      return import(
        /* webpackChunkName: 'mode.dtd' */
        'codemirror/mode/dtd/dtd.js'
      )
    case 'dylan':
      return import(
        /* webpackChunkName: 'mode.dylan' */
        'codemirror/mode/dylan/dylan.js'
      )
    case 'ebnf':
      return import(
        /* webpackChunkName: 'mode.ebnf' */
        'codemirror/mode/ebnf/ebnf.js'
      )
    case 'ecl':
      return import(
        /* webpackChunkName: 'mode.ecl' */
        'codemirror/mode/ecl/ecl.js'
      )
    case 'eiffel':
      return import(
        /* webpackChunkName: 'mode.eiffel' */
        'codemirror/mode/eiffel/eiffel.js'
      )
    case 'elm':
      return import(
        /* webpackChunkName: 'mode.elm' */
        'codemirror/mode/elm/elm.js'
      )
    case 'erlang':
      return import(
        /* webpackChunkName: 'mode.erlang' */
        'codemirror/mode/erlang/erlang.js'
      )
    case 'factor':
      return import(
        /* webpackChunkName: 'mode.factor' */
        'codemirror/mode/factor/factor.js'
      )
    case 'fcl':
      return import(
        /* webpackChunkName: 'mode.fcl' */
        'codemirror/mode/fcl/fcl.js'
      )
    case 'forth':
      return import(
        /* webpackChunkName: 'mode.forth' */
        'codemirror/mode/forth/forth.js'
      )
    case 'fortran':
      return import(
        /* webpackChunkName: 'mode.fortran' */
        'codemirror/mode/fortran/fortran.js'
      )
    case 'gas':
      return import(
        /* webpackChunkName: 'mode.gas' */
        'codemirror/mode/gas/gas.js'
      )
    case 'gfm':
      return import(
        /* webpackChunkName: 'mode.gfm' */
        'codemirror/mode/gfm/gfm.js'
      )
    case 'gherkin':
      return import(
        /* webpackChunkName: 'mode.gherkin' */
        'codemirror/mode/gherkin/gherkin.js'
      )
    case 'go':
      return import(
        /* webpackChunkName: 'mode.go' */
        'codemirror/mode/go/go.js'
      )
    case 'groovy':
      return import(
        /* webpackChunkName: 'mode.groovy' */
        'codemirror/mode/groovy/groovy.js'
      )
    case 'haml':
      return import(
        /* webpackChunkName: 'mode.haml' */
        'codemirror/mode/haml/haml.js'
      )
    case 'handlebars':
      return import(
        /* webpackChunkName: 'mode.handlebars' */
        'codemirror/mode/handlebars/handlebars.js'
      )
    case 'haskell':
      return import(
        /* webpackChunkName: 'mode.haskell' */
        'codemirror/mode/haskell/haskell.js'
      )
    case 'haskell-literate':
      return import(
        /* webpackChunkName: 'mode.haskell-literate' */
        'codemirror/mode/haskell-literate/haskell-literate.js'
      )
    case 'haxe':
      return import(
        /* webpackChunkName: 'mode.haxe' */
        'codemirror/mode/haxe/haxe.js'
      )
    case 'htmlembedded':
      return import(
        /* webpackChunkName: 'mode.htmlembedded' */
        'codemirror/mode/htmlembedded/htmlembedded.js'
      )
    case 'htmlmixed':
      return import(
        /* webpackChunkName: 'mode.htmlmixed' */
        'codemirror/mode/htmlmixed/htmlmixed.js'
      )
    case 'http':
      return import(
        /* webpackChunkName: 'mode.http' */
        'codemirror/mode/http/http.js'
      )
    case 'idl':
      return import(
        /* webpackChunkName: 'mode.idl' */
        'codemirror/mode/idl/idl.js'
      )
    case 'javascript':
      return import(
        /* webpackChunkName: 'mode.javascript' */
        'codemirror/mode/javascript/javascript.js'
      )
    case 'jinja2':
      return import(
        /* webpackChunkName: 'mode.jinja2' */
        'codemirror/mode/jinja2/jinja2.js'
      )
    case 'jsx':
      return import(
        /* webpackChunkName: 'mode.jsx' */
        'codemirror/mode/jsx/jsx.js'
      )
    case 'julia':
      return import(
        /* webpackChunkName: 'mode.julia' */
        'codemirror/mode/julia/julia.js'
      )
    case 'livescript':
      return import(
        /* webpackChunkName: 'mode.livescript' */
        'codemirror/mode/livescript/livescript.js'
      )
    case 'lua':
      return import(
        /* webpackChunkName: 'mode.lua' */
        'codemirror/mode/lua/lua.js'
      )
    case 'markdown':
      return import(
        /* webpackChunkName: 'mode.markdown' */
        'codemirror/mode/markdown/markdown.js'
      )
    case 'mathematica':
      return import(
        /* webpackChunkName: 'mode.mathematica' */
        'codemirror/mode/mathematica/mathematica.js'
      )
    case 'mbox':
      return import(
        /* webpackChunkName: 'mode.mbox' */
        'codemirror/mode/mbox/mbox.js'
      )
    case 'mirc':
      return import(
        /* webpackChunkName: 'mode.mirc' */
        'codemirror/mode/mirc/mirc.js'
      )
    case 'mllike':
      return import(
        /* webpackChunkName: 'mode.mllike' */
        'codemirror/mode/mllike/mllike.js'
      )
    case 'modelica':
      return import(
        /* webpackChunkName: 'mode.modelica' */
        'codemirror/mode/modelica/modelica.js'
      )
    case 'mscgen':
      return import(
        /* webpackChunkName: 'mode.mscgen' */
        'codemirror/mode/mscgen/mscgen.js'
      )
    case 'mumps':
      return import(
        /* webpackChunkName: 'mode.mumps' */
        'codemirror/mode/mumps/mumps.js'
      )
    case 'nginx':
      return import(
        /* webpackChunkName: 'mode.nginx' */
        'codemirror/mode/nginx/nginx.js'
      )
    case 'nsis':
      return import(
        /* webpackChunkName: 'mode.nsis' */
        'codemirror/mode/nsis/nsis.js'
      )
    case 'ntriples':
      return import(
        /* webpackChunkName: 'mode.ntriples' */
        'codemirror/mode/ntriples/ntriples.js'
      )
    case 'octave':
      return import(
        /* webpackChunkName: 'mode.octave' */
        'codemirror/mode/octave/octave.js'
      )
    case 'oz':
      return import(
        /* webpackChunkName: 'mode.oz' */
        'codemirror/mode/oz/oz.js'
      )
    case 'pascal':
      return import(
        /* webpackChunkName: 'mode.pascal' */
        'codemirror/mode/pascal/pascal.js'
      )
    case 'pegjs':
      return import(
        /* webpackChunkName: 'mode.pegjs' */
        'codemirror/mode/pegjs/pegjs.js'
      )
    case 'perl':
      return import(
        /* webpackChunkName: 'mode.perl' */
        'codemirror/mode/perl/perl.js'
      )
    case 'php':
      return import(
        /* webpackChunkName: 'mode.php' */
        'codemirror/mode/php/php.js'
      )
    case 'pig':
      return import(
        /* webpackChunkName: 'mode.pig' */
        'codemirror/mode/pig/pig.js'
      )
    case 'powershell':
      return import(
        /* webpackChunkName: 'mode.powershell' */
        'codemirror/mode/powershell/powershell.js'
      )
    case 'properties':
      return import(
        /* webpackChunkName: 'mode.properties' */
        'codemirror/mode/properties/properties.js'
      )
    case 'protobuf':
      return import(
        /* webpackChunkName: 'mode.protobuf' */
        'codemirror/mode/protobuf/protobuf.js'
      )
    case 'pug':
      return import(
        /* webpackChunkName: 'mode.pug' */
        'codemirror/mode/pug/pug.js'
      )
    case 'puppet':
      return import(
        /* webpackChunkName: 'mode.puppet' */
        'codemirror/mode/puppet/puppet.js'
      )
    case 'python':
      return import(
        /* webpackChunkName: 'mode.python' */
        'codemirror/mode/python/python.js'
      )
    case 'q':
      return import(
        /* webpackChunkName: 'mode.q' */
        'codemirror/mode/q/q.js'
      )
    case 'r':
      return import(
        /* webpackChunkName: 'mode.r' */
        'codemirror/mode/r/r.js'
      )
    case 'rpm':
      return import(
        /* webpackChunkName: 'mode.rpm' */
        'codemirror/mode/rpm/rpm.js'
      )
    case 'rst':
      return import(
        /* webpackChunkName: 'mode.rst' */
        'codemirror/mode/rst/rst.js'
      )
    case 'ruby':
      return import(
        /* webpackChunkName: 'mode.ruby' */
        'codemirror/mode/ruby/ruby.js'
      )
    case 'rust':
      return import(
        /* webpackChunkName: 'mode.rust' */
        'codemirror/mode/rust/rust.js'
      )
    case 'sas':
      return import(
        /* webpackChunkName: 'mode.sas' */
        'codemirror/mode/sas/sas.js'
      )
    case 'sass':
      return import(
        /* webpackChunkName: 'mode.sass' */
        'codemirror/mode/sass/sass.js'
      )
    case 'scheme':
      return import(
        /* webpackChunkName: 'mode.scheme' */
        'codemirror/mode/scheme/scheme.js'
      )
    case 'shell':
      return import(
        /* webpackChunkName: 'mode.shell' */
        'codemirror/mode/shell/shell.js'
      )
    case 'sieve':
      return import(
        /* webpackChunkName: 'mode.sieve' */
        'codemirror/mode/sieve/sieve.js'
      )
    case 'slim':
      return import(
        /* webpackChunkName: 'mode.slim' */
        'codemirror/mode/slim/slim.js'
      )
    case 'smalltalk':
      return import(
        /* webpackChunkName: 'mode.smalltalk' */
        'codemirror/mode/smalltalk/smalltalk.js'
      )
    case 'smarty':
      return import(
        /* webpackChunkName: 'mode.smarty' */
        'codemirror/mode/smarty/smarty.js'
      )
    case 'solr':
      return import(
        /* webpackChunkName: 'mode.solr' */
        'codemirror/mode/solr/solr.js'
      )
    case 'soy':
      return import(
        /* webpackChunkName: 'mode.soy' */
        'codemirror/mode/soy/soy.js'
      )
    case 'sparql':
      return import(
        /* webpackChunkName: 'mode.sparql' */
        'codemirror/mode/sparql/sparql.js'
      )
    case 'spreadsheet':
      return import(
        /* webpackChunkName: 'mode.spreadsheet' */
        'codemirror/mode/spreadsheet/spreadsheet.js'
      )
    case 'sql':
      return import(
        /* webpackChunkName: 'mode.sql' */
        'codemirror/mode/sql/sql.js'
      )
    case 'stex':
      return import(
        /* webpackChunkName: 'mode.stex' */
        'codemirror/mode/stex/stex.js'
      )
    case 'stylus':
      return import(
        /* webpackChunkName: 'mode.stylus' */
        'codemirror/mode/stylus/stylus.js'
      )
    case 'swift':
      return import(
        /* webpackChunkName: 'mode.swift' */
        'codemirror/mode/swift/swift.js'
      )
    case 'tcl':
      return import(
        /* webpackChunkName: 'mode.tcl' */
        'codemirror/mode/tcl/tcl.js'
      )
    case 'textile':
      return import(
        /* webpackChunkName: 'mode.textile' */
        'codemirror/mode/textile/textile.js'
      )
    case 'tiddlywiki':
      return import(
        /* webpackChunkName: 'mode.tiddlywiki' */
        'codemirror/mode/tiddlywiki/tiddlywiki.js'
      )
    case 'tiki':
      return import(
        /* webpackChunkName: 'mode.tiki' */
        'codemirror/mode/tiki/tiki.js'
      )
    case 'toml':
      return import(
        /* webpackChunkName: 'mode.toml' */
        'codemirror/mode/toml/toml.js'
      )
    case 'tornado':
      return import(
        /* webpackChunkName: 'mode.tornado' */
        'codemirror/mode/tornado/tornado.js'
      )
    case 'troff':
      return import(
        /* webpackChunkName: 'mode.troff' */
        'codemirror/mode/troff/troff.js'
      )
    case 'ttcn':
      return import(
        /* webpackChunkName: 'mode.ttcn' */
        'codemirror/mode/ttcn/ttcn.js'
      )
    case 'ttcn-cfg':
      return import(
        /* webpackChunkName: 'mode.ttcn-cfg' */
        'codemirror/mode/ttcn-cfg/ttcn-cfg.js'
      )
    case 'turtle':
      return import(
        /* webpackChunkName: 'mode.turtle' */
        'codemirror/mode/turtle/turtle.js'
      )
    case 'twig':
      return import(
        /* webpackChunkName: 'mode.twig' */
        'codemirror/mode/twig/twig.js'
      )
    case 'vb':
      return import(
        /* webpackChunkName: 'mode.vb' */
        'codemirror/mode/vb/vb.js'
      )
    case 'vbscript':
      return import(
        /* webpackChunkName: 'mode.vbscript' */
        'codemirror/mode/vbscript/vbscript.js'
      )
    case 'velocity':
      return import(
        /* webpackChunkName: 'mode.velocity' */
        'codemirror/mode/velocity/velocity.js'
      )
    case 'verilog':
      return import(
        /* webpackChunkName: 'mode.verilog' */
        'codemirror/mode/verilog/verilog.js'
      )
    case 'vhdl':
      return import(
        /* webpackChunkName: 'mode.vhdl' */
        'codemirror/mode/vhdl/vhdl.js'
      )
    case 'vue':
      return import(
        /* webpackChunkName: 'mode.vue' */
        'codemirror/mode/vue/vue.js'
      )
    case 'webidl':
      return import(
        /* webpackChunkName: 'mode.webidl' */
        'codemirror/mode/webidl/webidl.js'
      )
    case 'xml':
      return import(
        /* webpackChunkName: 'mode.xml' */
        'codemirror/mode/xml/xml.js'
      )
    case 'xquery':
      return import(
        /* webpackChunkName: 'mode.xquery' */
        'codemirror/mode/xquery/xquery.js'
      )
    case 'yacas':
      return import(
        /* webpackChunkName: 'mode.yacas' */
        'codemirror/mode/yacas/yacas.js'
      )
    case 'yaml':
      return import(
        /* webpackChunkName: 'mode.yaml' */
        'codemirror/mode/yaml/yaml.js'
      )
    case 'yaml-frontmatter':
      return import(
        /* webpackChunkName: 'mode.yaml-frontmatter' */
        'codemirror/mode/yaml-frontmatter/yaml-frontmatter.js'
      )
    case 'z80':
      return import(
        /* webpackChunkName: 'mode.z80' */
        'codemirror/mode/z80/z80.js'
      )
    default:
      return Promise.resolve()
  }
}
