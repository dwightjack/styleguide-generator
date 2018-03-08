const { generate, merge } = require('../../lib/generator');

generate({
    src: ['src', 'docs'],
    dest: 'public/styleguide',
    baseUrl: '/styleguide',
    verbose: true,
    collections: merge({
        sortCollections: true
    }),
    locale: 'ja'
});
