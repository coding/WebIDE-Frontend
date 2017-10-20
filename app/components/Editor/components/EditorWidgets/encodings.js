// taken from vscode repo: /src/vs/platform/files/common/files.ts
// https://github.com/Microsoft/vscode/blob/master/src/vs/platform/files/common/files.ts
// Ref to for availability of encodings
// https://docs.oracle.com/javase/8/docs/technotes/guides/intl/encoding.doc.html
const SUPPORTED_ENCODINGS = {
  'utf-8': {
    labelLong: 'UTF-8',
    labelShort: 'UTF-8',
    order: 1
  },
  'utf-16le': {
    labelLong: 'UTF-16 LE',
    labelShort: 'UTF-16 LE',
    order: 3
  },
  'utf-16be': {
    labelLong: 'UTF-16 BE',
    labelShort: 'UTF-16 BE',
    order: 4
  },
  'windows-1252': {
    labelLong: 'Western (Windows 1252)',
    labelShort: 'Windows 1252',
    order: 5
  },
  'iso-8859-1': {
    labelLong: 'Western (ISO 8859-1)',
    labelShort: 'ISO 8859-1',
    order: 6
  },
  'iso-8859-3': {
    labelLong: 'Western (ISO 8859-3)',
    labelShort: 'ISO 8859-3',
    order: 7
  },
  'iso-8859-15': {
    labelLong: 'Western (ISO 8859-15)',
    labelShort: 'ISO 8859-15',
    order: 8
  },
  'macroman': {
    labelLong: 'Western (Mac Roman)',
    labelShort: 'Mac Roman',
    order: 9
  },
  'cp437': {
    labelLong: 'DOS (CP 437)',
    labelShort: 'CP437',
    order: 10
  },
  'windows-1256': {
    labelLong: 'Arabic (Windows 1256)',
    labelShort: 'Windows 1256',
    order: 11
  },
  'iso-8859-6': {
    labelLong: 'Arabic (ISO 8859-6)',
    labelShort: 'ISO 8859-6',
    order: 12
  },
  'windows-1257': {
    labelLong: 'Baltic (Windows 1257)',
    labelShort: 'Windows 1257',
    order: 13
  },
  'iso-8859-4': {
    labelLong: 'Baltic (ISO 8859-4)',
    labelShort: 'ISO 8859-4',
    order: 14
  },
  'iso-8859-14': {
    labelLong: 'Celtic (ISO 8859-14)',
    labelShort: 'ISO 8859-14',
    order: 15
  },
  'windows-1250': {
    labelLong: 'Central European (Windows 1250)',
    labelShort: 'Windows 1250',
    order: 16
  },
  'iso-8859-2': {
    labelLong: 'Central European (ISO 8859-2)',
    labelShort: 'ISO 8859-2',
    order: 17
  },
  'cp852': {
    labelLong: 'Central European (CP 852)',
    labelShort: 'CP 852',
    order: 18
  },
  'windows-1251': {
    labelLong: 'Cyrillic (Windows 1251)',
    labelShort: 'Windows 1251',
    order: 19
  },
  'cp866': {
    labelLong: 'Cyrillic (CP 866)',
    labelShort: 'CP 866',
    order: 20
  },
  'iso-8859-5': {
    labelLong: 'Cyrillic (ISO 8859-5)',
    labelShort: 'ISO 8859-5',
    order: 21
  },
  'iso-8859-13': {
    labelLong: 'Estonian (ISO 8859-13)',
    labelShort: 'ISO 8859-13',
    order: 24
  },
  'windows-1253': {
    labelLong: 'Greek (Windows 1253)',
    labelShort: 'Windows 1253',
    order: 25
  },
  'iso-8859-7': {
    labelLong: 'Greek (ISO 8859-7)',
    labelShort: 'ISO 8859-7',
    order: 26
  },
  'windows-1255': {
    labelLong: 'Hebrew (Windows 1255)',
    labelShort: 'Windows 1255',
    order: 27
  },
  'iso-8859-8': {
    labelLong: 'Hebrew (ISO 8859-8)',
    labelShort: 'ISO 8859-8',
    order: 28
  },
  'iso-8859-10': {
    labelLong: 'Nordic (ISO 8859-10)',
    labelShort: 'ISO 8859-10',
    order: 29
  },
  'iso-8859-16': {
    labelLong: 'Romanian (ISO 8859-16)',
    labelShort: 'ISO 8859-16',
    order: 30
  },
  'windows-1254': {
    labelLong: 'Turkish (Windows 1254)',
    labelShort: 'Windows 1254',
    order: 31
  },
  'iso-8859-9': {
    labelLong: 'Turkish (ISO 8859-9)',
    labelShort: 'ISO 8859-9',
    order: 32
  },
  'windows-1258': {
    labelLong: 'Vietnamese (Windows 1258)',
    labelShort: 'Windows 1258',
    order: 33
  },
  'gbk': {
    labelLong: 'Chinese (GBK)',
    labelShort: 'GBK',
    order: 34
  },
  'gb18030': {
    labelLong: 'Chinese (GB18030)',
    labelShort: 'GB18030',
    order: 35
  },
  'cp950': {
    labelLong: 'Traditional Chinese (Big5)',
    labelShort: 'Big5',
    order: 36
  },
  'big5-hkscs': {
    labelLong: 'Traditional Chinese (Big5-HKSCS)',
    labelShort: 'Big5-HKSCS',
    order: 37
  },
  'shift-jis': {
    labelLong: 'Japanese (Shift JIS)',
    labelShort: 'Shift JIS',
    order: 38
  },
  'euc-jp': {
    labelLong: 'Japanese (EUC-JP)',
    labelShort: 'EUC-JP',
    order: 39
  },
  'euc-kr': {
    labelLong: 'Korean (EUC-KR)',
    labelShort: 'EUC-KR',
    order: 40
  },
  'windows-874': {
    labelLong: 'Thai (Windows 874)',
    labelShort: 'Windows 874',
    order: 41
  },
  'iso-8859-11': {
    labelLong: 'Latin/Thai (ISO 8859-11)',
    labelShort: 'ISO 8859-11',
    order: 42
  },
  'koi8-r': {
    labelLong: 'Russian (KOI8-R)',
    labelShort: 'KOI8-R',
    order: 43
  },
  'koi8-u': {
    labelLong: 'Ukrainian (KOI8-U)',
    labelShort: 'KOI8-U',
    order: 44
  },
  'gb2312': {
    labelLong: 'Simplified Chinese (GB 2312)',
    labelShort: 'GB 2312',
    order: 45
  },
  'cp865': {
    labelLong: 'Nordic DOS (CP 865)',
    labelShort: 'CP 865',
    order: 46
  },
  'cp850': {
    labelLong: 'Western European DOS (CP 850)',
    labelShort: 'CP 850',
    order: 47
  }
}

export default SUPPORTED_ENCODINGS
