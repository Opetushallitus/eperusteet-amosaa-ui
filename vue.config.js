const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const proxy = {
  '/eperusteet-amosaa-service': {
    target: `http://localhost:${process.env.AMOSAA_SERVICE_PORT || 8090}`,
    secure: false,
    onProxyReq: function(proxyReq, req, res) {
      proxyReq.setHeader('Caller-Id', '1.2.246.562.10.00000000001.eperusteet');
    },
  },
  '/eperusteet-service': {
    target: `http://localhost:${process.env.EPERUSTEET_SERVICE_PORT || 8080}`,
    secure: false,
    onProxyReq: function(proxyReq, req, res) {
      proxyReq.setHeader('Caller-Id', '1.2.246.562.10.00000000001.eperusteet');
    },
  },
};

module.exports = {
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/eperusteet-amosaa-app/uusi/' : '/',
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': path.resolve(__dirname, 'node_modules/vue'),
        '@shared': path.resolve(__dirname, 'eperusteet-frontend-utils/vue/src'),
        '@assets': path.resolve(__dirname, 'eperusteet-frontend-utils/vue/public'),
        '@public': path.resolve(__dirname, 'public'),
      },
    },
    plugins: [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ],
  },
  devServer: {
    overlay: {
      warnings: false,
      errors: true,
    },
    clientLogLevel: 'none',
    port: 9002,
    proxy,
  },
};
