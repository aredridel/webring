var level = require('level');
var sublevel = require('level-sublevel');
var path = require('path');

module.exports = sublevel(level(path.resolve('__dirname', '../db')));
