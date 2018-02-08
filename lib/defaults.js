const path = require('path');
const pkgUp = require('pkg-up');

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
    defaultCollection: 'General',
    permalinks: ':collection/:title',
    verbose: false,
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
