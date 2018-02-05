const path = require('path');
const metalsmith = require('metalsmith');
const drafts = require('metalsmith-drafts');
const markdown = require('metalsmith-markdownit');
const hljs = require('highlight.js');
const pug = require('pug');

const srcFolder = path.join(__dirname, 'test', 'fixtures');
const destFolder = path.join(__dirname, 'dist');

const md = markdown({
    highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (e) {
                console.error(e); // eslint-disable-line no-console
            }
        }

        return ''; // use external default escaping
    }
});

const fenceRenderer = md.parser.renderer.rules.fence;

md.parser.renderer.rules.fence = (tokens, idx, options, env, self) => {
    // pass token to default renderer.
    const token = tokens[idx];
    if (token.info === 'pug') {
        const html = pug.render(token.content, {});
        token.content = html;
        token.info = 'html';

        return `
            <div class="sg-exampleWrap">
                <div class="sg-example">
                    ${html}
                </div>
            </div>
            ${fenceRenderer(tokens, idx, options, env, self)}
        `;
    }
    return fenceRenderer(tokens, idx, options, env, self);
};

const generator = metalsmith(srcFolder);

generator
    .source('.')
    .destination(destFolder)
    .use(drafts())
    .use(md)
    // .use(layouts())
    .build((err) => {
        if (err) throw err;
    });
