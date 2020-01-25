const {patchStorybookWebpackConfig} = require('react-zeroconfig');

module.exports = async ({config}) => {
  patchStorybookWebpackConfig({config});
  
  config.module.rules.push(
    {
      test: /\.stories\.(js|jsx)$/,
      loaders: [
        {
          loader: require.resolve('@storybook/addon-storysource/loader'),
          options: {parser: 'javascript'},
        },
      ],
      enforce: 'pre',
    },
  );
  
  return config;
};