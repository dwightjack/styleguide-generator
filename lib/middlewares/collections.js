// Overloading collections
const collections = require('metalsmith-collections');
const unary = require('lodash/unary');
const omit = require('lodash/omit');
const noop = require('lodash/noop');
const slug = require('speakingurl');

const toSlug = unary(slug);

// eslint-disable-next-line no-shadow
const sortCollections = (collections, sort) => {
    // create a normalized map
    const namesMap = Object.keys(collections).reduce((acc, name) => {
        acc[toSlug(name)] = name;
        return acc;
    }, {});
    const names = Object.keys(namesMap);

    let normalized = [];
    if (sort === true) {
        // simple sort
        normalized = names.sort();
    } else if (sort === 'reverse') {
        normalized = names.sort().reverse();
    } else if (typeof sort === 'function') {
        normalized = sort(names, namesMap, collections);
    } else if (Array.isArray(sort)) {
        normalized = sort.map(toSlug);

        const rest = names.filter((name) => !normalized.includes(name)).sort();

        normalized.push(...rest);
    }

    return normalized.reduce((acc, name) => {
        const srcName = namesMap[name];
        if (srcName && collections[srcName]) {
            Object.assign(acc, {
                [srcName]: Object.assign(collections[srcName], {
                    slug: name
                })
            });
        }
        return acc;
    }, {});
};

module.exports = (options = {}) => {
    const inst = collections(omit(options, 'sortCollections'));
    return (files, metalsmith, done) => {
        const metadata = metalsmith.metadata();
        // eslint-disable-next-line no-shadow
        const { collections } = metadata;

        // clean-up global collection
        // prevents duplication on multiple runs
        // in the same instance
        if (collections) {
            Object.keys(collections).forEach((k) => {
                metadata[k] = [];
            });
        }

        inst(files, metalsmith, noop);

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
