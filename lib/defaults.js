const path = require('path');
const isEmpty = require('lodash/isEmpty');
const pkgUp = require('pkg-up');
const pug = require('pug');

const markdownTmpl = require('./helpers/markdown-it-templates');

const rootPath = path.dirname(pkgUp.sync());

module.exports = {
    root: rootPath,
    src: ['src'],
    dest: 'styleguide',
    baseUrl: '/',
    ignore: ['!**/*.{md,jpg,jpeg,png,gif,mp4,mp3,webp,webm}', '**/_*.*'],
    server: false,
    watch: false,
    middlewares: [],
    collections: {},
    locale: null,
    markdown: {
        customize(md, { layout }) {
            md.use(markdownTmpl, layout.use, ({ content }) =>
                pug.render(content, layout.engineOptions)
            );
            return md;
        }
    },
    filemeta: {
        collection: (coll) => (!coll || isEmpty(coll) ? ['General'] : coll),
        title(title, { filename }) {
            return (
                title ||
                path
                    .basename(filename, path.extname(filename))
                    .replace(
                        /(-|_|^)([a-z])/g,
                        (...matches) => ` ${matches[2].toUpperCase()}`
                    )
                    .trim()
            );
        }
    },
    permalinks: {
        pattern: ':collection/:title',
        relative: false
    },
    verbose: false,
    layout: {
        use: 'pug',
        default: `default.pug`,
        engineOptions: {
            basedir: path.resolve(rootPath, 'src'),
            pretty: '\t'
        }
    },
    build: true,
    template: 'default'
};
