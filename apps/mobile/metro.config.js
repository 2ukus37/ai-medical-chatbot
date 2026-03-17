const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '..', '..')

const config = getDefaultConfig(projectRoot)

// Allow Metro to resolve packages from the monorepo root
config.watchFolders = [workspaceRoot]

// Add additional source extensions if needed
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'cjs']
}

module.exports = config
