"use strict";

var db = require('./db');
var session = require('express-session');
var util = require('util');


function Store() {
    Store.super_.call(this);
    var self = this;
    setImmediate(function() {
         self.emit('connect'); 
    });
}

util.inherits(Store, session.Store);

Store.prototype.get = function (sid, callback) {
    db.get('session ' + sid, function (err, data) {
        if (err && err.type !== 'NotFoundError') {
            return callback(err);
        } else {
            var result;
            try {
                result = JSON.parse(data);
            } catch (e) {
            }
            return callback(null, result);
        }
    });
};

Store.prototype.set = function (sid, session, callback) {
    db.put('session ' + sid, JSON.stringify(session), function () {
        callback();
    });
};

Store.prototype.destroy = function (sid, callback) {
    db.delete('session ' + sid, callback);
};

module.exports = new Store();

