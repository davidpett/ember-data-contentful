/*jshint node:true*/

var EOL         = require('os').EOL;
var chalk       = require('chalk');

module.exports = {
  description: 'ember-data-contentful',

  normalizeEntityName: function() {
  },

  afterInstall: function() {
    return this.addAddonToProject('ember-network', '0.2.0')
    .then(function() {
      return this.addAddonToProject('torii', '0.6.1')
    })
    .then(function() {
      var output = EOL;
      output += chalk.yellow('ember-data-contentful') + ' has been installed. Please configure your contentful space and accessTokens in ' + chalk.green('config/environment.js') + EOL;
      console.log(output);
    });
  }
};
