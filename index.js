/* jshint node: true */
'use strict';

var path = require('path');

module.exports = {
  name: 'ember-data-contentful',

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  }
};
