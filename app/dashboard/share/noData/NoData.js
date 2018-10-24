import React from 'react';
import i18n from '../../utils/i18n';

const NoData = () => {
    return (
        <div className="dash-nodata">
            <i className="fa fa-frown-o"></i>
            &nbsp;
            <span>{i18n('global.nodata')}</span>
        </div>
    );
}

export default NoData;
