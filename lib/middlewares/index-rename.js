const each = require('./each');

module.exports = () =>
    each((file, filename, metadata, files) => {
        if (file.index === true) {
            file.permalink = false; // eslint-disable-line no-param-reassign
            delete files[filename]; // eslint-disable-line no-param-reassign
            files[`./index.md`] = file; // eslint-disable-line no-param-reassign
        }
    });
