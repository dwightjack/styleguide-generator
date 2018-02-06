const markdown = require('metalsmith-markdownit');
const hljs = require('highlight.js');
const SG_REGEXP = /([a-z0-9]+)\s?\+sg$/;

const defaultHighlighter = (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
        try {
            return hljs.highlight(lang, str).value;
        } catch (e) {
            console.error(e); // eslint-disable-line no-console
        }
    }

    return ''; // use external default escaping
};

const markdownParser = (params = {}) => {
    const { highlight, render } = Object.assign(
        {
            highlight: defaultHighlighter,
            render: ({ content }) => content
        },
        params
    );
    const md = markdown({
        highlight
    });
    const fenceRenderer = md.parser.renderer.rules.fence;

    md.parser.renderer.rules.fence = (tokens, idx, options, env, self) => {
        // pass token to default renderer.
        const token = tokens[idx];
        const match = token.info.match(SG_REGEXP);
        if (match.length > 0) {
            const [, lang] = match;
            if (lang === 'pug') {
                token.content = render(token);
                token.info = 'html';
            } else {
                token.info = lang;
            }

            return `<div class="sg-example">
                <div class="sg-example__component">
                    ${token.content}
                </div>
            </div>
            ${fenceRenderer(tokens, idx, options, env, self)}`;
        }
        return fenceRenderer(tokens, idx, options, env, self);
    };

    return md;
};

module.exports = markdownParser;
