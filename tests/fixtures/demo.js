const Generator = require('../../lib/generator');

const gen = Generator();

gen.fromSources(['src', 'docs'], (err, files) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Done!');
    console.log(
        `The following files have been generated in ${gen.destination()}:`
    );
    Object.keys(files).forEach((filename) => {
        console.log(`  * ${filename}`);
    });
});
