const airbnb = [
    'eslint-config-airbnb-base/rules/best-practices',
    'eslint-config-airbnb-base/rules/errors',
    'eslint-config-airbnb-base/rules/node',
    'eslint-config-airbnb-base/rules/style',
    'eslint-config-airbnb-base/rules/variables',
    'eslint-config-airbnb-base/rules/es6'
].map(require.resolve);

module.exports = {
    root: true,

    plugins: ['node', 'prettier'],

    env: {
        node: true,
        es6: true
    },

    extends: [...airbnb, 'plugin:node/recommended', 'prettier'],

    rules: {
        indent: ['error', 4],
        'consistent-return': 'error',
        'global-require': 'off',

        'prettier/prettier': 'error'
    }
};
