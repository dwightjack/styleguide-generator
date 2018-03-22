const path = require('path');
const Metalsmith = require('metalsmith');
const unyield = require('unyield');
const ora = require('ora');
const rm = require('rimraf').sync;

const logger = require('./logger');

// Patching Metalsmith to support multiple sources
Metalsmith.prototype.fromSources = unyield(function* fromSources(
    folders,
    build = true,
    watch = false
) {
    const files = {};
    const spinner = ora(`Processing files`).start();

    try {
        for (let i = 0; i < folders.length; i += 1) {
            const pathname = this.path(folders[i]);
            logger.verbose(`\n`);
            logger.verbose(
                `[multi-source]: Processing folder ${[pathname]}...`
            );
            const newFiles = yield this.read(pathname);
            logger.verbose(
                `[multi-source]: Found ${
                    Object.keys(newFiles).length
                } new files.`
            );
            Object.assign(files, newFiles);
        }

        logger.verbose(
            `[multi-source]: Start processing ${
                Object.keys(files).length
            } files...`
        );

        const results = yield this.run(files);

        logger.verbose(`[multi-source]: Files processed.`);

        if (build === true) {
            const clean = this.clean();
            const dest = this.destination();
            if (clean) {
                rm(path.join(dest, '*'));
            }

            logger.verbose(`[multi-source]: Writing files...`);
            yield this.write(results);
            spinner.succeed('Completed!');
            logger.log(
                `The following files have been generated in ${this.destination()}:`
            );
            Object.keys(files).forEach((filename) => {
                logger.log(`  * ${filename}`);
            });
        }
        return results;
    } catch (e) {
        spinner.fail('Error!');
        if (!watch) {
            logger.fatal(e);
        } else {
            logger.error(e);
        }
    }
    return '';
});

module.exports = Metalsmith;
