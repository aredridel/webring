var levelup = require('levelup');
var path = require('path');

module.exports = levelup(path.resolve('__dirname', '../db'));
