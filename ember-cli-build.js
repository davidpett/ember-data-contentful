/*jshint node:true*/
/* global require, module */
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
var postcssImport = require('postcss-import');
var postcssCustomProperties = require('postcss-custom-properties');
var postcssCustomMedia = require('postcss-custom-media');
var autoprefixer = require('autoprefixer');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    postcssOptions: {
      compile: {
        plugins: [{
            module: postcssImport,
            options: {
              glob: true
            }
          }, {
            module: postcssCustomProperties
          }, {
            module: postcssCustomMedia
          }, {
            module: autoprefixer,
            options: {
              browsers: 'last 2 versions'
            }
          }
        ]
      }
    }
  });
  return app.toTree();
};
