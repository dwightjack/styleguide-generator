const isPlainObject = require('lodash/isplainobject');

const logger = require('./logger');

module.exports = (generator, options = {}) => {
    const bs = require('browser-sync').create();
    const { dest, server, watch, src, root } = options;

    if (server === false || bs.active) {
        return;
    }

    if (watch === true) {
        const watcher = bs.watch(
            src.map((s) => `${root}/${s}`),
            {
                ignored: /(^|[/\\])\../,
                ignoreInitial: true
            },
            (event, path) => {
                logger.log(`Change detected in ${path} (${event}).`);
                generator.fromSources(src, true, (err) => {
                    if (err) {
                        logger.error(err);
                    }
                });
            }
        );

        process.on('exit', () => {
            watcher.close();
        });
    }

    generator.server = bs; // eslint-disable-line no-param-reassign

    bs.init({
        notify: false,
        ui: false,
        files: watch ? `${options.dest}/**/*` : false,
        server: Object.assign(
            {
                baseDir: [dest]
            },
            isPlainObject(server) ? server : {}
        ),
        ghostMode: false,
        open: false
    });

    process.on('exit', () => {
        bs.exit();
    });
};
