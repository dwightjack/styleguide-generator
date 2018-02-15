const path = require('path');
const pkgUp = require('pkg-up');
const drafts = require('metalsmith-drafts');
const permalinks = require('metalsmith-permalinks');
const debug = require('metalsmith-debug');
const layouts = require('metalsmith-layouts');
const pug = require('pug');
const semver = require('semver');

const pkg = require('../package.json');
const Metalsmith = require('./metalsmith');
const { parseOptions, toLocale } = require('./utils');
const logger = require('./logger');
const defaultmeta = require('./middlewares/defaultmeta');
const collections = require('./middlewares/collections');
const server = require('./server');
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
    const {
        root,
        engine = {},
        baseUrl,
        locale,
        defaultCollection,
        middlewares
    } = options;

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
        if (file.index || filename.endsWith('.md') === false) {
            return file;
        }

        const { collection, title } = file;

        if (!title) {
            const newTitle = path
                .basename(filename, path.extname(filename))
                .replace(
                    /(-|^)([a-z])/g,
                    (...matches) => ` ${matches[2].toUpperCase()}`
                )
                .trim();
            logger.verbose(
                `[generator]: Adding auto-generated title "${newTitle}" to ${filename}`
            );

            // eslint-disable-next-line no-param-reassign
            file.title = newTitle;
        }

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
            baseUrl,
            toLocale: toLocale(locale)
        })
        .ignore(options.ignore)
        .use(skip)
        .use(drafts())
        .use(defaultmeta(defaultMeta))
        .use(indexRename)
        .use(collections());

    if (Array.isArray(middlewares) && middlewares.length > 0) {
        generator.plugins.push(...middlewares);
    }

    generator
        .use(
            markdown({
                render: ({ content }) => pug.render(content, engine.options)
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
