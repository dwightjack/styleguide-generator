module.exports = (files, metalsmith, done) => {
    Object.keys(files).forEach((filename) => {
        if (files[filename].skip === true) {
            delete files[filename]; // eslint-disable-line no-param-reassign
        }
    });
    done();
};
