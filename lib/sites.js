var db = require('./db');
var through2 = require('through2');
var verifySite = require('./verify');

module.exports = {
    enqueue: enqueue
};

function enqueue(site, cb) {
    db.get(site, handleError(function (data) {
        if (data) {
            verifySites();
            cb(null, JSON.parse(data));
        } else {
            var m = {
                url: site,
                validated: false
            };
            db.batch([
                {
                    type: 'put',
                    key: site,
                    value: JSON.stringify(m)
                },
                {
                    type: 'put',
                    key: 'pending ' + site,
                    value: site
                }
            ], handleError(function() {
                verifySites();
                cb(null, m);
            }));
        }
    }));

    function handleError(fn) {
        return function (err, data) {
            if (err && err.type != 'NotFoundError') {
                console.warn(err);
                cb(err);
            } else {
                fn(data);
            }
        };
    }
}

function verifySites() {
    db.createReadStream({start: 'pending ', end: 'pending \xff'})
        .pipe(through2.obj(verifySite))
        .pipe(through2.obj(function (site, encoding, next) {
            console.log('verified', site);
            next();
        }));
}

