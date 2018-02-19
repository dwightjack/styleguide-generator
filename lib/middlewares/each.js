module.exports = (fn) => (files, metalsmith, done) => {
    Object.keys(files).forEach((file) => {
        fn(files[file], file, metalsmith.metadata());
    });
    done();
};
