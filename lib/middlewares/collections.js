// Overloading collections
const collections = require('metalsmith-collections');

module.exports = (options) => {
    const inst = collections(options);
    return (files, metalsmith, done) => {
        const metadata = metalsmith.metadata();
        const { collections } = metadata;

        if (collections) {
            Object.keys(collections).forEach((k) => {
                metadata[k] = [];
            });
        }

        inst(files, metalsmith, done);
    };
};
