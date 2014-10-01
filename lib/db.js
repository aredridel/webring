var level = require('level');
var path = require('path');

module.exports = level(path.resolve('__dirname', '../db'));
