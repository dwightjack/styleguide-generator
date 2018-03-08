const path = require('path');
const defaults = require('lodash/defaults');

const defaultOptions = require('./defaults');

const resolve = (pathname, root) =>
    path.isAbsolute(pathname) ? pathname : path.resolve(root, pathname);

const evaluate = (obj, ...args) =>
    typeof obj === 'function' ? obj(...args) : obj;

const merge = (props) => (def) => defaults(props, def);

const parseOptions = (params = {}) => {
    const options = Object.keys(defaultOptions).reduce((acc, key) => {
        if (params[key]) {
            acc[key] = evaluate(params[key], defaultOptions[key]);
        } else {
            acc[key] = defaultOptions[key];
        }
        return acc;
    }, {});

    const { root, dest, template, layout } = options;

    const tmpl = path.isAbsolute(template)
        ? template
        : path.resolve(root, 'sg-templates', template);

    return Object.assign(options, {
        dest: resolve(dest, root),
        layout: Object.assign(
            {
                directory: path.resolve(tmpl, 'layouts')
            },
            layout
        ),
        template: tmpl
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
    parseOptions,
    evaluate,
    merge
};
