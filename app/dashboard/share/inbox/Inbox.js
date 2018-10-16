import React, { Component } from 'react';
import { connect } from 'react-redux';

import zh_CN from '../../i18n/zh_CN';
import en_US from '../../i18n/en_US';
import is from '../../utils/is';

const compileTemplate = (template, dict) => {
    const chain = template.split('.');
    let map = dict;
    for (let i = 0, n = chain.length; i < n; i++) {
        const key = chain[i];
        const subMap = map[key];
        if (is.isObject(subMap)) {
            map = subMap;
        } else if (is.isString(subMap)) {
            return subMap;
        } else {
            return template;
        }
    }
}

class Inbox extends Component {
    render() {
        const { language, type = 'input', holder, value, onChange } = this.props;
        const alternate = {
            zh_CN: compileTemplate(holder, zh_CN),
            en_US: compileTemplate(holder, en_US),
        };
        const ph = alternate[language];
        switch (type) {
            case 'input':
                return <input className="com-input" type="text" placeholder={ph} spellCheck={false} value={value} onChange={onChange} />;
            case 'textarea':
                return <textarea className="com-textarea" placeholder={ph} spellCheck={false} value={value} onChange={onChange}></textarea>;
            default:
                return null;
        }
    }
}

const mapState = (state) => {
    return {
        language: state.language,
    }
}

export default connect(mapState)(Inbox);
