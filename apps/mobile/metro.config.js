const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Ensure lucide-react-native is transpiled
config.resolver.sourceExts.push("mjs");

// 1. Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages, starting with the project, then the workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Force resolution of critical packages to the project version (Singleton pattern)
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  react: path.resolve(workspaceRoot, "node_modules/react"),
  "react-dom": path.resolve(workspaceRoot, "node_modules/react-dom"),
  "react-native": path.resolve(workspaceRoot, "node_modules/react-native"),
  // Also crucial for nativewind/reanimated to work correctly
  nativewind: path.resolve(workspaceRoot, "node_modules/nativewind"),
  "react-native-reanimated": path.resolve(
    workspaceRoot,
    "node_modules/react-native-reanimated"
  ),
};

module.exports = withNativeWind(config, { input: "./global.css" });
