require('dotenv').config()
const fs = require('fs')
const fromJS = require('immutable').fromJS

const root_path = process.argv[2] || 'app'
const i18nTargetRoot = process.env.I18nTargetRoot || 'app/i18n/model'

const i18nRegex = /(?:i18n`(.+):=)(.+)(?:`)/gm
const i18nRegexPer = /(?:i18n`(.+):=)(.+)(?:`)/

console.log('search i18n shape in code' + root_path)

const i18nFiles = fs.readdirSync(i18nTargetRoot);

// 遍历读取所有的js和jsx文件,当看到有文件内容有特征内容，则替换内容，并且过程中 有一个side effect 在指定的目录生成json文件

function generateI18n(root) {
    const files = fs.readdirSync(root);
    files.forEach(file => {
         var pathname = root+'/'+file
        , stat = fs.lstatSync(pathname);
        if (stat.isDirectory()) {
            generateI18n(pathname)
        }
        if (['js', 'jsx'].includes(file.split('.').pop())) {
            const readablePathname = pathname.replace(root,'.')
            const data = fs.readFileSync(pathname, "utf-8")
            if (i18nRegex.test(data)) {
                const newData = data.replace(i18nRegex, (matchable) => {
                    console.log(`find i18n shape ${matchable}, generating...`)
                    return generate(matchable)
                })
                fs.writeFile(pathname, newData, (err) => {
                    if (err) throw err
                })
            }
        }
    })
}

function generate(matchable) {
    const perMatchableArray = matchable.match(i18nRegexPer)
    const fileKey = perMatchableArray[1].split('$')[0]
    const value = perMatchableArray[2]
    const folderArray = fileKey.split('.')
    const folder = folderArray.shift()
    const jsonFileName = i18nTargetRoot + '/' + `${folder}.json`

    if (!i18nFiles.includes(`${folder}.json`)) {
         // console.log('json', json)
        fs.writeFileSync(jsonFileName, '{}', "utf-8")
    }
        const json = fs.readFileSync(jsonFileName, "utf-8")
        const tmp = fromJS(JSON.parse(json));
        const nextData = tmp.setIn(folderArray, value).toJS()
        fs.writeFileSync(jsonFileName, JSON.stringify(nextData, undefined, 3), "utf-8")
        console.log(`generate in ${jsonFileName} success`)
        return matchable.replace(/:=.+/, '`');
}

generateI18n(root_path)