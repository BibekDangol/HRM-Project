const { getDefaultConfig } = require('expo/metro-config');

// Keep native color tokens in sync even when starting Expo directly with npx.
require('./scripts/sync-theme.cjs');

module.exports = getDefaultConfig(__dirname);
