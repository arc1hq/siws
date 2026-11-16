const path = require("node:path")

const appRoot = process.cwd()
const workspaceRoot = path.resolve(appRoot, "../..")

module.exports = {
  appRoot,
  workspaceRoot,
  babel: {
    dev: process.env.NODE_ENV === "development",
    runtimeInjection: false,
    treeshakeCompensation: true,
    unstable_moduleResolution: { type: "commonJS", rootDir: workspaceRoot },
    aliases: {
      "@ui/*": [path.join(workspaceRoot, "packages/ui/src/*")],
      "@/*": [path.join(appRoot, "src/*")],
    },
  },
}
