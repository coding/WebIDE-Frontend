export default [
  { exts: ['js', 'jsx', 'mjs'], language: 'JavaScript' },
  { exts: ['ts', 'tsx'], language: 'TypeScript' },
  { exts: ['java', 'class'], language: 'Java' },
  { exts: ['py'], language: 'Python' },
  { exts: ['cs'], language: 'C#' },
]

export const supportLangServer = [
  { lang: 'Java', files: ['pom.xml', 'settings.gradle', 'build.gradle'], file: 'pom.xml' },
  { lang: 'Python', files: ['requirements.txt'], file: 'requirements.txt' },
  { lang: 'TypeScript', files: ['package.json', 'tslint.json', 'tsconfig.json'], file: 'package.json' },
  { lang: 'JavaScript', files: ['package.json', 'eslint.json', 'tsconfig.json'], file: 'package.json' },
  // { lang: 'C#', files: ['workspace.csproj'] },
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
    selectors: ['typescript']
  },
  {
    lang: 'C#',
    selectors: [
      { language: 'csharp', scheme: 'file', pattern: '**/*.cs' },
      { pattern: '**/*.cs' },
      { pattern: '**/*.cake' },
    ]
  },
]
