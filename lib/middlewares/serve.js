const bs = require('browser-sync').create();
const isPlainObject = require('lodash.isplainobject');

const logger = require('../logger');

module.exports = (options = {}) => (_, metalsmith, done) => {
    const { dest, server, watch, src } = options;

    if (server === false) {
        done();
        return;
    }

    if (watch === true) {
        const watcher = bs.watch(
            src,
            {
                ignored: /(^|[/\\])\../
            },
            () => {
                metalsmith.fromSources(src, true, (err) => {
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

    metalsmith.server = bs; // eslint-disable-line no-param-reassign

    bs.init(
        {
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
        },
        done
    );

    process.on('exit', () => {
        bs.exit();
    });
};
