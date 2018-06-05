/*jshint node:true*/

var EOL         = require('os').EOL;
var chalk       = require('chalk');

module.exports = {
  description: 'ember-data-contentful',

  normalizeEntityName: function() {
  },

  afterInstall: function() {
    return this.addAddonToProject('ember-fetch', '3.4.3')
    .then(function () {
      var output = EOL;
      output += chalk.yellow('ember-data-contentful') + ' has been installed. Please configure your contentful space and accessTokens in ' + chalk.green('config/environment.js') + EOL;
      console.log(output);
    });
  }
};
