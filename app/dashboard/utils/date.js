import i18n from './i18n';

export const getModifiedDate = (now, lastModified) => {
    const ms = now - lastModified;
    const d = Math.floor(ms / 3600000 / 24);
    if (d > 0) {
        return i18n('global.lastModified', { days: d });
    } else {
        return i18n('global.lastModifiedToday');
    }
}

export const getDeletedTime = (now, lastModified) => {
    const ms = now - lastModified;
    const d = Math.floor(ms / 3600000 / 24);
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
