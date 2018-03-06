const { generate } = require('../../lib/generator');

generate({
    src: ['src', 'docs'],
    dest: 'public/styleguide',
    baseUrl: '/styleguide',
    verbose: true,
    sortCollections: 'reverse',
    locale: 'ja'
});
