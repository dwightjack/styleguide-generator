const path = require('path');

module.exports = (files, metalsmith, done) => {
    Object.keys(files).forEach((filename) => {
        const file = files[filename];
        if (file.index === true) {
            file.permalink = false;
            const dir = path.dirname(filename);
            files[`${dir}/index.md`] = file; // eslint-disable-line no-param-reassign
            delete files[filename]; // eslint-disable-line no-param-reassign
        }
    });
    done();
};
