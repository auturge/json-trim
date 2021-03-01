module.exports = {
    root: true,
    env: {
        browser: true,
        commonjs: true,
        es2021: true
    },
    extends: [
        "eslint:recommended",
    ],
    globals: {
        "__dirname": "readonly",
        "args": "readonly",
        "process": "readonly"
    },
    "parser": "babel-eslint",
    parserOptions: {
        ecmaVersion: 12
    },
    rules: {
    }
}
