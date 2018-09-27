const isNull = (value) => {
    return value === null;
}

const isUndefined = (value) => {
    return value === undefined;
}

const isString = (value) => {
    return typeof value === 'string';
}

const isNumber = (value) => {
    return typeof value === 'number';
}

const isBoolean = (value) => {
    return typeof value === 'boolean';
}

const isFunction = (value) => {
    return typeof value === 'function';
}

const isArray = (value) => {
    return Array.isArray(value);
}

const isObject = (value) => {
    const type = typeof value;
    return !isNull(value) && (type === 'object' || type === 'function');
}

export default { isNull, isUndefined, isString, isNumber, isBoolean, isFunction, isArray, isObject };
