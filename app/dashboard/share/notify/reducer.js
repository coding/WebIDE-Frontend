import { NOTIFY_TYPE } from './index';

export const notifyReducer = (notifications = [], action) => {
    switch (action.type) {
        case 'ADD_NOTIFICATION':
            const notification = {
                ...action.payload,
                key: Date.now(),
                dismissAfter: 6000,
                action: 'Dismiss',
            };
            if (action.payload.notifyType === NOTIFY_TYPE.ERROR) {
                notification.barStyle = { backgroundColor: '#f00' };
                notification.actionStyle = { color: '#fff' };
            }
            return notifications.push(notification);
        case 'REMOVE_NOTIFICATION':
            return notifications.find(n => n.key !== action.payload);
        default:
            return notifications;
    }
}
