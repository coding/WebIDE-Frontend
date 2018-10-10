import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';

import './banner.css';
import i18n from '../../utils/i18n';

class Banner extends Component {
    state = {
        pathname: '',
        breadcrumbs: [],
    };

    render() {
        const { breadcrumbs } = this.state;
        return (
            <div className="dash-banner">
                <BreadCrumb breadcrumbs={breadcrumbs} />
            </div>
        );
    }

    componentDidMount() {
        this.handleRouteChange();
    }

    componentDidUpdate() {
        this.handleRouteChange();
    }

    handleRouteChange() {
        const pathname = this.props.location.pathname.replace(/^\/|\/$/g, '');
        if (this.state.pathname !== pathname) {
            const bcs = pathname.split('/');
            const breadcrumbs = [];
            for (let i = 0; i < bcs.length; i++) {
                const bc = bcs[i];
                breadcrumbs.push({ name: bc, route: this.spliceBreadCrumb(bcs, i) });
                if (i < bcs.length - 1) {
                    breadcrumbs.push({ name: `slash_${bc}`, slash: true });
                }
            }
            this.setState({ breadcrumbs, pathname });
        }
    }

    spliceBreadCrumb(breadcrumbs, num) {
        let route = '';
        for (let i = 0; i < breadcrumbs.length; i++) {
            const bc = breadcrumbs[i];
            if (i <= num) {
                route += `/${bc}`;
            } else {
                return route;
            }
        }
        return route;
    }
}

const BreadCrumb = ({ breadcrumbs }) => {
    return (
        <div className="breadcrumb">
            {breadcrumbs.map((bc, index) => {
                if (index < 2) {
                    return;
                }
                if (bc.slash) {
                    return <span key={bc.name} className="slash"> / </span>;
                } else if (index < breadcrumbs.length - 1) {
                    return <Link key={bc.name} className="crumb" to={bc.route}>{i18n(`global.${bc.name}`)}</Link>;
                } else {
                    return <span key={bc.name}>{i18n(`global.${bc.name}`)}</span>
                }
            })}
        </div>
    );
}

export default withRouter(Banner);
