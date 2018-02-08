module.exports = (files, metalsmith, done) => {
    Object.keys(files).forEach((filename) => {
        const file = files[filename];
        if (file.index === true) {
            file.permalink = false;
            delete files[filename]; // eslint-disable-line no-param-reassign
            files[`./index.md`] = file; // eslint-disable-line no-param-reassign
        }
    });
    done();
};
