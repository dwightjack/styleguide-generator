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

const defaultmeta = require('./middlewares/defaultmeta');
const markdown = require('./middlewares/markdown');

const rootPath = path.dirname(pkgUp.sync());

const defaults = {
    root: rootPath,
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
    template: 'default'
};

const resolve = (pathname, root) =>
    path.isAbsolute(pathname) ? pathname : path.resolve(root, pathname);

// Patching Metalsmith to support multiple sources
Metalsmith.prototype.fromSources = unyield(function*(folders, build = true) {
    const files = {};
    for (let i = 0; i < folders.length; i += 1) {
        const pathname = this.path(folders[i]);
        Object.assign(files, yield this.read(pathname));
    }
    const results = yield this.run(files);
    if (build === true) {
        yield this.write(results);
    }
    return results;
});

const generate = (params = {}) => {
    const options = Object.assign({}, defaults, params);
    const {
        root,
        dest,
        ignore,
        template,
        engine = {},
        baseUrl,
        defaultCollection
    } = options;

    const destFolder = resolve(dest, root);
    const tmplFolder = path.isAbsolute(template)
        ? template
        : path.resolve(root, 'sg-templates', template);

    const generator = Metalsmith(root);

    generator
        .metadata({
            pkg: require(pkgUp.sync(root)),
            baseUrl
        })
        .ignore([...ignore, '!**/*.md', '**/_*.*'])
        .use(drafts())
        .use(
            defaultmeta((file) => {
                const { collection } = file;
                if (
                    !collection ||
                    (Array.isArray(collection) && collection.length === 0)
                ) {
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

    return generator;
};

module.exports = {
    generate,
    Metalsmith
};
