const path = require('path');
const pkgUp = require('pkg-up');
const drafts = require('metalsmith-drafts');
const permalinks = require('metalsmith-permalinks');
const collections = require('metalsmith-collections');
const debug = require('metalsmith-debug');
const layouts = require('metalsmith-layouts');
const changed = require('metalsmith-changed');
const pug = require('pug');
const semver = require('semver');

const pkg = require('../package.json');
const Metalsmith = require('./metalsmith');
const { parseOptions } = require('./utils');
const logger = require('./logger');
const empty = require('./middlewares/empty');
const defaultmeta = require('./middlewares/defaultmeta');
const serve = require('./middlewares/serve');
const markdown = require('./middlewares/markdown');
const indexRename = require('./middlewares/index-rename');

if (semver.satisfies(process.version, pkg.engines.node) === false) {
    logger.fatal(
        `Your current version of Node.js doesn't satisfy the minimun requirement: ${
            pkg.engines.node
        }`
    );
}

const generate = (params = {}) => {
    const options = parseOptions(params);
    const { root, engine = {}, baseUrl, defaultCollection } = options;

    if (options.verbose === true) {
        logger.setLevel(0);
    }

    logger.verbose(
        `[generator]: Processing with options: ${JSON.stringify(options)}`
    );

    logger.verbose(
        `[generator]: Destination folder resolved at ${options.dest}\n
        [generator]: Templates folder resolved at ${options.template}`
    );

    const defaultMeta = (file, filename) => {
        if (file.index) {
            return file;
        }

        const { collection } = file;

        if (
            !collection ||
            (Array.isArray(collection) && collection.length === 0)
        ) {
            logger.verbose(
                `[generator]: Adding default collection to ${filename}`
            );
            file.collection = [defaultCollection]; // eslint-disable-line no-param-reassign
        }

        return file;
    };

    const generator = Metalsmith(root);

    generator
        .clean(options.watch === false)
        .metadata({
            pkg: require(pkgUp.sync(root)),
            baseUrl
        })
        .ignore([...options.ignore, '!**/*.md', '**/_*.*'])
        .use(options.watch ? changed() : empty)
        .use(drafts())
        .use(defaultmeta(defaultMeta))
        .use(indexRename)
        .use(collections())
        .use(
            markdown({
                render: ({ content }) => pug.render(content, engine.options)
            })
        )
        .use(
            permalinks({
                pattern: `${options.permalinks}`,
                relative: false
            })
        )
        .use(
            layouts({
                default: `default${engine.ext}`,
                directory: path.resolve(options.template, 'layouts'),
                engineOptions: engine.options || {}
            })
        )
        .use(debug())
        .destination(options.dest);

    if (options.server) {
        generator.use(serve(options));
    }

    if (options.build && options.src) {
        return new Promise((res, reject) => {
            generator.fromSources(options.src, true, (err) => {
                if (err) {
                    reject(err);
                }
                res(generator);
            });
        });
    }

    return generator;
};

module.exports = {
    generate,
    Metalsmith,
    logger
};
