// Overloading collections
const collections = require('metalsmith-collections');
const _ = require('lodash');
const slug = require('speakingurl');

const toSlug = _.unary(slug);

// eslint-disable-next-line no-shadow
const sortCollections = (collections, sort) => {
    const names = Object.keys(collections);
    let normalized = [];
    if (sort === true) {
        // simple sort
        normalized = names.sort();
    } else if (sort === 'reverse') {
        normalized = names.sort().reverse();
    } else if (typeof sort === 'function') {
        normalized = names.sort(sort);
    } else if (Array.isArray(sort)) {
        normalized = sort.map(toSlug);

        const rest = names.filter((name) => !normalized.includes(name)).sort();

        normalized.push(...rest);
    }

    return normalized.reduce((acc, name) => {
        if (collections[name]) {
            acc[name] = collections[name];
        }
        return acc;
    }, {});
};

module.exports = (options) => {
    const inst = collections(_.omit(options, 'sortCollections'));
    return (files, metalsmith, done) => {
        const metadata = metalsmith.metadata();
        // eslint-disable-next-line no-shadow
        const { collections } = metadata;

        if (collections) {
            Object.keys(collections).forEach((k) => {
                metadata[k] = [];
            });
        }

        // normalize collections meta
        Object.keys(files).forEach((file) => {
            const { collection } = files[file];
            if (Array.isArray(collection)) {
                files[file].collection = collection.map(toSlug); // eslint-disable-line no-param-reassign
            } else if (typeof collection === 'string') {
                files[file].collection = toSlug(collection); // eslint-disable-line no-param-reassign
            }
        });

        inst(files, metalsmith, _.noop);

        if (options.sortCollections) {
            const md = metalsmith.metadata();
            md.collections = sortCollections(
                md.collections,
                options.sortCollections
            );
        }
        done();
    };
};
