export default [
  { exts: ['js', 'jsx', 'mjs'], language: 'JavaScript' },
  { exts: ['ts', 'tsx'], language: 'TypeScript' },
  { exts: ['java'], language: 'Java' },
  { exts: ['py'], language: 'Python' },
]

export const supportLangServer = [
  { lang: 'Java', files: ['pom.xml', 'settings.gradle', 'build.gradle'], file: 'pom.xml' },
  { lang: 'Python', files: [], file: null },
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
    lang: 'Python',
    selectors: ['python']
  },
  {
    lang: 'TypeScript',
    selectors: [
      { scheme: 'file', language: 'typescript' }
    ]
  },
]
