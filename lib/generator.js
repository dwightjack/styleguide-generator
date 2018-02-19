const path = require('path');
const pkgUp = require('pkg-up');
const drafts = require('metalsmith-drafts');
const permalinks = require('metalsmith-permalinks');
const debug = require('metalsmith-debug');
const layouts = require('metalsmith-layouts');
const semver = require('semver');
const partialRight = require('lodash/partialRight');

const pkg = require('../package.json');
const Metalsmith = require('./metalsmith');
const { parseOptions, toLocale, evaluate } = require('./utils');
const logger = require('./logger');
const server = require('./server');

const defaultFileMeta = require('./helpers/default-file-meta');

const each = require('./middlewares/each');
const collections = require('./middlewares/collections');
const markdown = require('./middlewares/markdown');
const skip = require('./middlewares/skip');
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
    const { root, engine = {}, baseUrl, locale, middlewares } = options;

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

    const generator = Metalsmith(root);

    generator
        .clean(options.watch === false)
        .metadata({
            pkg: require(pkgUp.sync(root)),
            baseUrl,
            locale,
            toLocale: toLocale(locale)
        })
        .ignore(evaluate(options.ignore, options))
        .use(skip)
        .use(drafts())
        .use(each(defaultFileMeta(options.filemeta || {})))
        .use(indexRename)
        .use(collections());

    if (Array.isArray(middlewares) && middlewares.length > 0) {
        generator.plugins.push(...middlewares);
    }

    generator
        .use(
            markdown({
                customize: partialRight(options.markdown, options)
            })
        )

        .use(
            permalinks({
                pattern: options.permalinks,
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

    if (options.build && options.src) {
        return new Promise((res, reject) => {
            generator.fromSources(options.src, true, (err) => {
                if (err) {
                    reject(err);
                }
                if (options.server) {
                    server(generator, options);
                }
                res(generator);
            });
        });
    }

    if (options.server) {
        server(generator, options);
    }

    return generator;
};

module.exports = {
    generate,
    Metalsmith,
    logger
};
