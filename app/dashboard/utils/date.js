import i18n from './i18n';

const twoDigit = (num) => {
    return num < 10 ? `0${num}` : num;
}

export const getModifiedTime = (now, lastModified) => {
    const ms = now - lastModified;
    const d = Math.ceil(ms / 3600000 / 24);
    if (d > 0) {
        return i18n('global.lastModified', { days: d });
    } else {
        return i18n('global.lastModifiedToday');
    }
}

export const getDeletedTime = (now, lastModified) => {
    const ms = now - lastModified;
    const d = Math.ceil(ms / 3600000 / 24);
    if (d > 0) {
        return i18n('global.deletedDaysAgo', { days: d });
    } else {
        let h = Math.floor(ms / 3600000 % 24);
        h = h < 0 ? 0 : h;
        let m = Math.floor(ms / 60000 % 24);
        m = m < 0 ? 0 : m;
        let s = Math.floor(ms / 1000 % 60);
        s = s < 0 ? 0 : s;
        return i18n('global.deletedTime', { hours: h, minutes: m, seconds: s });
    }
}

export const getCreatedTime = (now) => {
    const date = new Date(now);
    const y = date.getFullYear();
    const m = twoDigit(date.getMonth() + 1);
    const d = twoDigit(date.getDate());
    const h = twoDigit(date.getHours());
    const n = twoDigit(date.getMinutes());
    const s = twoDigit(date.getSeconds());
    return `Created: ${y}-${m}-${d} ${h}:${n}:${s}`;
}

export const getFormatTime = (now) => {
    const date = new Date(now);
    const y = date.getFullYear();
    const m = twoDigit(date.getMonth() + 1);
    const d = twoDigit(date.getDate());
    const h = twoDigit(date.getHours());
    const n = twoDigit(date.getMinutes());
    const s = twoDigit(date.getSeconds());
    return `${y}-${m}-${d} ${h}:${n}:${s}`;
}
