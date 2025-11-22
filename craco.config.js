const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      const srcPath = path.resolve(__dirname, 'src');
      
      if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
      }
      
      if (!webpackConfig.resolve.alias) {
        webpackConfig.resolve.alias = {};
      }
      
      webpackConfig.resolve.alias['@'] = srcPath;
      
      return webpackConfig;
    },
  },
};

