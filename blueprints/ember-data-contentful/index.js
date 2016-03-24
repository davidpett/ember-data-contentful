/*jshint node:true*/

var EOL         = require('os').EOL;
var chalk       = require('chalk');
var fs          = require('fs-extra');
var Promise     = require('rsvp');
var readFile    = Promise.denodeify(fs.readFile);

module.exports = {
  description: 'ember-data-contentful',

  normalizeEntityName: function() {
  },

  availableOptions: [
    {
      name: 'space',
      type: String
    }, {
      name: 'accesstoken',
      type: String
    }
  ],

  afterInstall: function(options) {
    var self = this;
    var contentfulSpace = options.space || 'YOUR-CONTENTFUL-SPACE';
    var contentfulAccessToken = options.accesstoken || 'YOUR-CONTENTFUL-ACCESS-TOKEN';

    return this.addAddonToProject('ember-network', '0.2.0')
    .then(function() {
      return self.addToConfig('contentfulSpace', '\'' + contentfulSpace + '\'');
    })
    .then(function () {
      return self.addToConfig('contentfulAccessToken', '\'' + contentfulAccessToken + '\'');
    })
    .then(function () {
      var output = EOL;
      output += chalk.yellow('ember-data-contentful') + ' has been installed. Please configure your contentful space and accessToken in ' + chalk.green('config/environment.js') + EOL;
      console.log(output);
    });
  },

  addToConfig: function (key, value) {
    var self = this;
    return this.fileContains('config/environment.js', key + ':').then(function (contains) {
      if (contains) { return true; }

      var options = { after: '    environment: environment,' + EOL };
      return self.insertIntoFile('config/environment.js', '    ' + key + ': ' + value + ',', options);
    });
  },

  fileContains: function (filePath, snippet) {
    return readFile(filePath).then(function (fileContents) {
      return fileContents.toString().indexOf(snippet) !== -1;
    });
  }
};
