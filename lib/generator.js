const path = require('path');
const pkgUp = require('pkg-up');
const Metalsmith = require('metalsmith');
const drafts = require('metalsmith-drafts');
const permalinks = require('metalsmith-permalinks');
const collections = require('metalsmith-collections');
const debug = require('metalsmith-debug');
const layouts = require('metalsmith-layouts');
const pug = require('pug');
const unyield = require('unyield');
const ora = require('ora');
const semver = require('semver');
const hasFlag = require('has-flag');

const pkg = require('../package.json');
const logger = require('./logger');
const defaultmeta = require('./middlewares/defaultmeta');
const markdown = require('./middlewares/markdown');

if (hasFlag('verbose')) {
    logger.setLevel(0);
}

if (semver.satisfies(process.version, pkg.engines.node) === false) {
    logger.fatal(
        `Your current version of Node.js doesn't satisfy the minimun requirement: ${
            pkg.engines.node
        }`
    );
}

const rootPath = path.dirname(pkgUp.sync());

const defaults = {
    root: rootPath,
    src: ['src'],
    dest: 'public/styleguide',
    baseUrl: '/styleguide',
    ignore: [],
    defaultCollection: 'General',
    permalinks: ':collection/:title',
    engine: {
        name: 'pug',
        ext: '.pug',
        options: {
            basedir: path.resolve(rootPath, 'src'),
            pretty: '\t'
        }
    },
    build: true,
    template: 'default'
};

const resolve = (pathname, root) =>
    path.isAbsolute(pathname) ? pathname : path.resolve(root, pathname);

// Patching Metalsmith to support multiple sources
Metalsmith.prototype.fromSources = unyield(function* fromSources(
    folders,
    build = true
) {
    const files = {};
    const spinner = ora(`Processing files`).start();
    for (let i = 0; i < folders.length; i += 1) {
        const pathname = this.path(folders[i]);
        logger.verbose(`\n`);
        logger.verbose(`[multi-source]: Processing folder ${[pathname]}...`);
        const newFiles = yield this.read(pathname);
        logger.verbose(
            `[multi-source]: Found ${Object.keys(newFiles).length} new files.`
        );
        Object.assign(files, newFiles);
    }
    logger.verbose(
        `[multi-source]: Start processing ${Object.keys(files).length} files...`
    );
    const results = yield this.run(files);
    logger.verbose(`[multi-source]: Files processed.`);
    if (build === true) {
        try {
            logger.verbose(`[multi-source]: Writing files...`);
            yield this.write(results);
            spinner.succeed('Completed!');
            logger.log(
                `The following files have been generated in ${this.destination()}:`
            );
            Object.keys(files).forEach((filename) => {
                logger.log(`  * ${filename}`);
            });
        } catch (e) {
            spinner.fail('Error!');
            logger.fatal(e);
        }
    }
    return results;
});

const generate = (params = {}) => {
    const options = Object.assign({}, defaults, params);
    const {
        root,
        src,
        dest,
        ignore,
        template,
        engine = {},
        baseUrl,
        defaultCollection
    } = options;

    logger.verbose(
        `[generator]: Processing with options: ${JSON.stringify(options)}`
    );

    const destFolder = resolve(dest, root);
    const tmplFolder = path.isAbsolute(template)
        ? template
        : path.resolve(root, 'sg-templates', template);

    logger.verbose(`[generator]: Destination folder resolved at ${destFolder}`);
    logger.verbose(`[generator]: Templates folder resolved at ${tmplFolder}`);

    const generator = Metalsmith(root);

    generator
        .metadata({
            pkg: require(pkgUp.sync(root)),
            baseUrl
        })
        .ignore([...ignore, '!**/*.md', '**/_*.*'])
        .use(drafts())
        .use(
            defaultmeta((file, filename) => {
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
            })
        )
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
                directory: path.resolve(tmplFolder, 'layouts'),
                engineOptions: engine.options || {}
            })
        )
        .use(debug())
        .destination(destFolder);

    if (options.build && src) {
        return new Promise((res, reject) => {
            generator.fromSources(src, true, (err) => {
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
