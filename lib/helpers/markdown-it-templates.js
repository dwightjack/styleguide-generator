const _ = require('lodash');
const SG_REGEXP = /([a-z0-9]+)\s?\+sg$/;

module.exports = (md, engineName, render = _.identity) => {
    const fenceRenderer = md.renderer.rules.fence;

    // eslint-disable-next-line no-param-reassign
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        // pass token to default renderer.
        const token = tokens[idx];
        const match = token.info.match(SG_REGEXP);
        if (match) {
            const [, lang] = match;
            if (lang === engineName) {
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
