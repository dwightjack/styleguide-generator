const hljs = require('highlight.js');

module.exports = (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
        try {
            return hljs.highlight(lang, str).value;
        } catch (e) {
            console.error(e); // eslint-disable-line no-console
        }
    }

    return ''; // use external default escaping
};
