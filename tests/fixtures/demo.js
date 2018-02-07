const { generate } = require('../../lib/generator');

generate({
    src: ['src', 'docs'],
    dest: 'public/styleguide',
    baseUrl: '/styleguide',
    index: 'docs/README.md',
    watch: true,
    server: {
        baseDir: ['public']
    }
});
