const markdownIt = require('metalsmith-markdownit');
const _ = require('lodash');
const highlighter = require('../helpers/highlight');

const markdown = (params = {}) => {
    const { highlight, customize } = Object.assign(
        {
            highlight: highlighter,
            customize: _.identity
        },
        params
    );
    const md = markdownIt({
        highlight
    });

    customize(md.parser);

    return md;
};

module.exports = markdown;
