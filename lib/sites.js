var db = require('./db');
var through2 = require('through2');
var verifySite = require('./verify');
var handleError = require('./handleError');

module.exports = {
    enqueue: enqueue
};

function enqueue(site, baseURL, cb) {
    db.get(site, handleError(cb, function (data) {
        if (data) {
            verifySites(baseURL);
            cb(null, JSON.parse(data));
        } else {
            var m = {
                url: site,
                validated: false
            };

            var pending = db.sublevel('pending');
            db.batch([
                {
                    type: 'put',
                    key: site,
                    value: JSON.stringify(m)
                },
                {
                    type: 'put',
                    key: site,
                    value: site,
                    prefix: pending
                }
            ], handleError(cb, function() {
                verifySites(baseURL);
                cb(null, m);
            }));
        }
    }));

}

function verifySites(baseURL) {
    db.sublevel('pending').createReadStream()
        .pipe(through2.obj(verifySite(baseURL)))
        .pipe(through2.obj(activateSite))
        .on('error', function (err) {
            console.log('error', err);
        });
}

function activateSite(site, encoding, next) {
    var sites = db.sublevel('sites');
    var pending = db.sublevel('pending');
    sites.get('HEAD', handleError(next, function (nextSite) {
        if (!nextSite) nextSite = '#';
        db.batch([
            {
                type: 'put',
                key: site,
                value: nextSite,
                prefix: sites
            },
            {
                type: 'put',
                key: 'HEAD',
                value: site,
                prefix: sites
            },
            {
                type: 'del',
                key: site,
                prefix: pending
            }
        ], next);
    }));
}
