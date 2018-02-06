module.exports = (meta) => (files, metalsmith, done) => {
    const metaFn =
        typeof meta === 'function'
            ? meta
            : (file) => Object.assign(file, Object.create(meta));
    Object.keys(files).forEach((file) => {
        metaFn(files[file], file, metalsmith.metadata());
    });
    done();
};
