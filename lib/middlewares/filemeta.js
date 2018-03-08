const isNil = require('lodash/isNil');
const logger = require('../logger');
const each = require('./each');

const filemeta = (meta) =>
    each((file, filename, metadata) => {
        if (file.index || filename.endsWith('.md') === false) {
            return;
        }

        Object.keys(meta).forEach((prop) => {
            const val = meta[prop];
            const prev = file[prop];
            let next;
            if (typeof val === 'function') {
                next = val(prev, { file, filename, metadata });
            } else if (isNil(prev)) {
                next = val;
            }

            if (next !== undefined) {
                // eslint-disable-next-line no-param-reassign
                file[prop] = next;
                logger.verbose(
                    `[default-meta]: Assign value "${next}" to ${filename}/${prop}. Was "${prev}"`
                );
            }
        });
    });

module.exports = filemeta;
