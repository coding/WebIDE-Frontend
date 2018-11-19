import React, { Component } from 'react';
import Ansi from 'ansi-to-react';
import { connect } from 'react-redux';

import './versionPop.css';

import i18n from '../../utils/i18n';

const pushHref = 'https://studio.dev.tencent.com/plugins-docs/#推送到远端仓库';

class VersionPop extends Component {
    render() {
        const { isPopOn, type, desc, log, action, method, hideVersionPop } = this.props;
        return (
            <div className={`dash-versionpop${isPopOn ? ' on' : ''}`}>
                <div className="board">
                    <div className="title">
                        <span>{type === 1 ? i18n('plugin.prePublish') : i18n('plugin.officialPublish')}</span>
                        <i className="fa fa-times" onClick={hideVersionPop}></i>
                    </div>
                    <div className="desc">{desc}</div>
                    {log && <div className="log"><Ansi>{log}</Ansi></div>}
                    {type === 1 && (
                        <div className="tip">
                            <i className="fa fa-exclamation-circle"></i>
                            {i18n('plugin.prePushTip')}
                            <a href={pushHref} target="_blank" rel="noopener noreferrer">{i18n('global.more')}</a>
                        </div>
                    )}
                    {action && <button className="com-button primary" onClick={method}>{action}</button>}
                </div>
            </div>
        );
    }
}

const mapState = (state) => {
    const pop = state.versionPop;
    return {
        isPopOn: pop.isPopOn,
        type: pop.type,
        name: pop.name,
        desc: pop.desc,
        log: pop.log,
        action: pop.action,
        method: pop.method,
    }
}

const mapDispatch = (dispatch) => {
    return {
        hideVersionPop: () => dispatch({ type: 'HIDE_VERSION_POP' }),
    }
}

export default connect(mapState, mapDispatch)(VersionPop);
