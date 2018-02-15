const path = require('path');
const defaultOptions = require('./defaults');

const resolve = (pathname, root) =>
    path.isAbsolute(pathname) ? pathname : path.resolve(root, pathname);

const parseOptions = (params) => {
    const options = Object.assign({}, defaultOptions, params);
    const { root, dest, template } = options;

    return Object.assign(options, {
        dest: resolve(dest, root),
        template: path.isAbsolute(template)
            ? template
            : path.resolve(root, 'sg-templates', template)
    });
};

const toLocale = (locale) => (obj, key) => {
    if (locale) {
        return obj[`${key}_${locale}`] || obj[key];
    }
    return obj[key];
};

module.exports = {
    toLocale,
    resolve,
    parseOptions
};
