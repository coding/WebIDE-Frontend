import React, { Component } from 'react';
import { connect } from 'react-redux';

import zh_CN from '../i18n/zh_CN';
import en_US from '../i18n/en_US';
import is from './is';

const slotReg = /{{([a-z]+)}}/gi;

const compileTemplate = (template, slot = {}, dict, language) => {
    const chain = template.split('.');
    let map = dict;
    for (let i = 0, n = chain.length; i < n; i++) {
        const key = chain[i];
        const subMap = map[key];
        if (is.isObject(subMap)) {
            map = subMap;
        } else if (is.isString(subMap)) {
            return subMap.replace(slotReg, (match, $1) => {
                const translate = slot[$1];
                if (is.isObject(translate)) {
                    if (translate.en_US && translate.zh_CN) {
                        return translate[language];
                    } else {
                        return match;
                    }
                } else if (is.isUndefined(translate)) {
                    return match;
                } else {
                    return translate;
                }
            });
        } else {
            return template;
        }
    }
}

class CreateI18n extends Component {
    render() {
        const { template, slot, language } = this.props;
        const alternate = {
            zh_CN: compileTemplate(template, slot, zh_CN, language),
            en_US: compileTemplate(template, slot, en_US, language),
        };
        return (
            <span>{alternate[language]}</span>
        );
    }
}

const mapState = (state) => {
    return {
        language: state.language,
    };
}

const ConnectedI18n = connect(mapState)(CreateI18n);

/*
 * slot 是插入的变量
 * 格式: { key: value } or { key: { en_US: value, zh_CN: value } }
 * key 对应于 JSON 文件中 {{}} 语法里的关键字
 */
const I18n = (template, slot) => {
    return (
        <ConnectedI18n template={template} slot={slot} />
    );
}

export default I18n;
