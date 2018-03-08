const markdownIt = require('metalsmith-markdownit');
const omit = require('lodash/omit');
const identity = require('lodash/identity');
const highlighter = require('../helpers/highlight');

const markdown = (options = {}, instanceOptions) => {
    const opts = Object.assign(
        {
            highlight: highlighter,
            customize: identity
        },
        options
    );
    const md = markdownIt(omit(opts, 'customize'));

    opts.customize(md.parser, instanceOptions);

    return md;
};

module.exports = markdown;
