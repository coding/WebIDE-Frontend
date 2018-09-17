export default {
  Java: {
    bundles: [
      '/data/coding-ide-home/LanguageServices-WebIDE/com.microsoft.java.debug.plugin_0.11.0.jar',
    ],
    workspaceFolders: [],
    settings: {
      java: {
        home: null,
        errors: {
          incompleteClasspath: {
            severity: 'ignore'
          }
        },
        configuration: {
          updateBuildConfiguration: 'interactive',
          maven: {
            userSettings: null
          }
        },
        trace: {
          server: 'verbose'
        },
        import: {
          gradle: {
            enabled: true
          },
          maven: {
            enabled: true
          },
          exclusions: [
            '**/node_modules/**',
            '**/.metadata/**',
            '**/archetype-resources/**',
            '**/META-INF/maven/**'
          ]
        },
        referencesCodeLens: {
          enabled: true
        },
        signatureHelp: {
          enabled: false
        },
        implementationsCodeLens: {
          enabled: false
        },
        format: {
          enabled: true,
          settings: {
            url: null,
            profile: null
          },
          comments: {
            enabled: true
          },
          onType: {
            enabled: true
          }
        },
        saveActions: {
          organizeImports: false
        },
        contentProvider: {
          preferred: null
        },
        autobuild: {
          enabled: true
        },
        completion: {
          overwrite: true,
          guessMethodArguments: false,
          favoriteStaticMembers: [
            'org.junit.Assert.*',
            'org.junit.Assume.*',
            'org.junit.jupiter.api.Assertions.*',
            'org.junit.jupiter.api.Assumptions.*',
            'org.junit.jupiter.api.DynamicContainer.*',
            'org.junit.jupiter.api.DynamicTest.*'
          ],
          importOrder: ['java', 'javax', 'com', 'org']
        },
        progressReports: {
          enabled: true
        },
        debug: {
          logLevel: 'warn',
          settings: {
            showHex: false,
            showStaticVariables: true,
            showQualifiedNames: false,
            maxStringLength: 0,
            enableHotCodeReplace: true
          }
        }
      }
    },
    extendedClientCapabilities: {
      progressReportProvider: true,
      classFileContentsSupport: true
    }
  },
  Python: {
    workspaceFolders: [],
    settings: {
      pyls: {
        configurationSources: ['pycodestyle'],
        rope: { ropeFolder: null, extensionModules: null },
        plugins: {
          preload: { enabled: true, modules: null },
          pycodestyle: {
            maxLineLength: null,
            enabled: true,
            filename: null,
            ignore: null,
            hangClosing: null,
            exclude: null,
            select: null
          },
          jedi_completion: { enabled: true },
          jedi_references: { enabled: true },
          jedi_symbols: { all_scopes: true, enabled: true },
          jedi_definition: { enabled: true },
          pyflakes: { enabled: true },
          yapf: { enabled: true },
          pydocstyle: {
            ignore: null,
            matchDir: '[^\\.].*',
            select: null,
            convention: null,
            addSelect: null,
            addIgnore: null,
            enabled: false,
            match: '(?!test_).*\\.py'
          },
          rope_completion: { enabled: true },
          mccabe: { threshold: 15, enabled: true },
          jedi_signature_help: { enabled: true },
          jedi_hover: { enabled: true }
        }
      }
    }
  }
}
