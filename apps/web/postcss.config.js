const { babel, workspaceRoot } = require("./stylex.options.cjs")

module.exports = {
  plugins: {
    "@stylexjs/postcss-plugin": {
      cwd: workspaceRoot,
      include: ["apps/web/src/**/*.{ts,tsx}", "packages/ui/src/**/*.{ts,tsx}"],
      exclude: ["**/*.d.ts"],
      useCSSLayers: { before: ["carbon.base"] },
      babelConfig: {
        babelrc: false,
        configFile: false,
        parserOpts: { plugins: ["typescript", "jsx"] },
        plugins: [["@stylexjs/babel-plugin", babel]],
      },
    },
  },
}
