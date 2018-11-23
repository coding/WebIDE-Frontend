import i18n from './i18n';

const twoDigit = (num) => {
    return num < 10 ? `0${num}` : num;
}

export const getModifiedTime = (lastModified) => {
    const ms = new Date(new Date().setHours(0, 0, 0, 0)).getTime() - lastModified;
    const d = ms / 3600000 / 24;
    if (d > 0) {
        return i18n('global.lastModified', { days: Math.ceil(d) });
    } else {
        return i18n('global.lastModifiedToday');
    }
}

export const getDeletedTime = (lastModified) => {
    const ms = new Date(new Date().setHours(0, 0, 0, 0)).getTime() - lastModified;
    const d = ms / 3600000 / 24;
    if (d > 0) {
        return i18n('global.deletedDaysAgo', { days: Math.ceil(d) });
    } else {
        const timestamp = Date.now() - lastModified;
        let h = Math.floor(timestamp / 3600000 % 24);
        h = h < 0 ? 0 : h;
        let m = Math.floor(timestamp / 60000 % 24);
        m = m < 0 ? 0 : m;
        return i18n('global.deletedTime', { hours: h, minutes: m });
    }
}

export const getCreatedTime = (time) => {
    const date = new Date(time);
    const y = date.getFullYear();
    const m = twoDigit(date.getMonth() + 1);
    const d = twoDigit(date.getDate());
    const h = twoDigit(date.getHours());
    const n = twoDigit(date.getMinutes());
    const s = twoDigit(date.getSeconds());
    return `Created: ${y}-${m}-${d} ${h}:${n}:${s}`;
}

export const getFormatTime = (time) => {
    const date = new Date(time);
    const y = date.getFullYear();
    const m = twoDigit(date.getMonth() + 1);
    const d = twoDigit(date.getDate());
    const h = twoDigit(date.getHours());
    const n = twoDigit(date.getMinutes());
    const s = twoDigit(date.getSeconds());
    return `${y}-${m}-${d} ${h}:${n}:${s}`;
}
