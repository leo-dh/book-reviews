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

exports.onCreateWebpackConfig = ({ getConfig, actions }) => {
  if (getConfig().mode === "production") {
    actions.setWebpackConfig({
      devtool: false,
    });
  }
};
