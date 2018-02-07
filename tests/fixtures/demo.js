const { generate } = require('../../lib/generator');

generate({
    src: ['src', 'docs'],
    dest: 'public/styleguide',
    baseUrl: '/styleguide',
    watch: true,
    server: {
        baseDir: ['public']
    }
});
