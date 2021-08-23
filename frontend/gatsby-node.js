/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const { resolve } = require("path");

exports.onCreatePage = async ({ actions: { createPage } }) => {
  createPage({
    path: `/book/:id`,
    matchPath: `/book/:id`,
    component: resolve("./src/templates/BookDetailsPage.tsx"),
  });
};

exports.onCreateWebpackConfig = ({ stage, getConfig, actions }) => {
  if (getConfig().mode === "production") {
    actions.setWebpackConfig({
      devtool: false,
    });
  }
  if (stage === "build-javascript") {
    const config = getConfig();
    const miniCssExtractPlugin = config.plugins.find(
      plugin => plugin.constructor.name === "MiniCssExtractPlugin",
    );
    if (miniCssExtractPlugin) {
      miniCssExtractPlugin.options.ignoreOrder = true;
    }
    actions.replaceWebpackConfig(config);
  }
};
