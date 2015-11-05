var db = require('../lib/db');
var concat = require('concat-stream');

module.exports = function (router) {
    router.get('/', function (req, res) {
        db.sublevel('sites').createReadStream().pipe(concat(function (sites) {
            sites = sites.filter(function (e) { return e.key != 'HEAD' });

            var site = sites[Math.floor(Math.random() * sites.length)];

            res.redirect(site.key);
        }));
    });
};
