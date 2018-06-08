export default [
  { exts: ['js', 'jsx', 'mjs'], language: 'JavaScript' },
  { exts: ['ts', 'tsx'], language: 'TypeScript' },
  { exts: ['java'], language: 'Java' },
]

export const supportLangServer = [
  { lang: 'Java', files: ['pom.xml', 'settings.gradle'], file: 'pom.xml' },
  // { lang: 'JavaScript', files: ['package.json'], file: 'package.json' },
  // { lang: 'TypeScript', files: ['package.json'], file: 'package.json' },
]

export const documentSelectors = [
  {
    lang: 'Java',
    selectors: [
      { scheme: 'file', language: 'java' },
      { scheme: 'jdt', language: 'java' },
      { scheme: 'untitled', language: 'java' }
    ]
  },
  {
    lang: 'JavaScript',
    selectors: [
      { scheme: 'file', language: 'javascript' }
    ]
  },
  {
    lang: 'TypeScript',
    selectors: [
      { scheme: 'file', language: 'typescript' }
    ]
  },
]
