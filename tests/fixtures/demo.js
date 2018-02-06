const { generate } = require('../../lib/generator');

const generator = generate();

generator.fromSources(['src', 'docs'], true, (err, files) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Done!');
    console.log(
        `The following files have been generated in ${generator.destination()}:`
    );
    Object.keys(files).forEach((filename) => {
        console.log(`  * ${filename}`);
    });
});
