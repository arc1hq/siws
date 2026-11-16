const { babel } = require("./stylex.options.cjs")

module.exports = {
  presets: ["next/babel"],
  plugins: [["@stylexjs/babel-plugin", babel]],
}
