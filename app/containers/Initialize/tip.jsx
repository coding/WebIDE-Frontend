import React, { Component } from 'react';

const tips = [
    {
        id: 0,
        label: '代码编辑器支持 Vim 键盘模式，可在「设置->快捷键」中修改'
    },
    {
        id: 1,
        label: 'Coding 还有移动客户端，功能同样很强大哦'
    },
    {
        id: 2,
        label: '首次加载腾讯云需要为您分配主机，请耐心等待'
    }
];

class Tip extends Component {
    constructor() {
        super();
        this.itemHeight = 30;
        this.maxTranslate = -this.itemHeight * (tips.length - 1);
        this.timer = null;
        this.state = {
            slideTop: 0,
            temp: 0
        };
    }

    render() {
        return (
            <div className="tip-info">
                <div className="tip-inner">
                    <div className="tip-img"></div>
                    <div className="tip-box">
                        <div className="tip-slide" style={{ transform: `translateY(${this.state.slideTop}px)` }}>
                            {tips.map((value) => <div className="tip-item" key={value.id}>{value.label}</div>)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    componentDidMount() {
        this.setState({ temp: 1 });
    }

    componentDidUpdate() {
        this.timer = setTimeout(() => {
            const slideTop = this.state.slideTop;
            const top = slideTop > this.maxTranslate ? slideTop - this.itemHeight : 0;
            this.setState({ slideTop: top });
        }, 3000);
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }
}

export default Tip;
