/*jshint node:true*/
/* global require, module */
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    postcssOptions: {
      plugins: [
        {
          module: require('postcss-import'),
          options: {
            glob: true
          }
        },
        {
          module: require('postcss-custom-properties')
        },
        {
          module: require('postcss-custom-media')
        },
        {
          module: require('autoprefixer'),
          options: {
            browsers: 'last 2 versions'
          }
        }
      ]
    }
  });
  return app.toTree();
};
