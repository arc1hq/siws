export const LOCAL_STORAGE_KEY = "siws-package-manager"

export const packageManagers = ["npm", "pnpm", "yarn", "bun"] as const

export function getInstallCommand(pm: string, pkg = "@siws/core") {
  switch (pm) {
    case "pnpm":
      return `pnpm add ${pkg}`
    case "yarn":
      return `yarn add ${pkg}`
    case "bun":
      return `bun add ${pkg}`
    default:
      return `npm i ${pkg}`
  }
}
