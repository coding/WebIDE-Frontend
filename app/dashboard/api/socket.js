import { Stomp } from 'stompjs/lib/stomp';
import SockJS from 'sockjs-client';
import getBackoff from '../utils/backoff';
import getCookie from '../utils/cookie';

const wsURL = getCookie('WS_URL') || __WS_URL__ || __BACKEND_URL__ || window.location.origin;

class NoticeSocket {
    constructor() {
        if (!this.backoff) {
            this.backoff = getBackoff({ min: 50, max: 5000 });
        }
        this.headers = {
            globalKey: 'veedrin',
        };
        this.baseURL = `${wsURL}/ot/sockjs/`;
    }

    connect() {
        if (!this.ws || !this.client) {
            this.ws = new SockJS(this.baseURL);
            this.client = Stomp.over(this.ws);
            this.client.debug = false;
        }
        const success = () => {
            this.backoff.reset();
            this.successCallback(this.client);
        };
        const error = (frame) => {
            switch (this.ws.readyState) {
                case SockJS.CLOSING:
                case SockJS.CLOSED:
                    this.reconnect();
                    break;
                case SockJS.OPEN:
                default:
                    console.log('FRAME ERROR', frame);
                    this.errorCallback(frame);
            }
        };
        const headers = this.headers || {};
        this.client.connect(headers, success, error);
    }

    reconnect() {}

    send() {}
}

export default NoticeSocket;
