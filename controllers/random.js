var db = require('../lib/db');
var concat = require('concat-stream');

module.exports = function (router) {
    router.get('/', function (req, res) {
        db.sublevel('sites').createReadStream().pipe(concat(function (sites) {
            var site = sites[Math.floor(Math.random() * sites.length)];

            db.sublevel('sites').get(site.value, function (err, data) {
                if (!err && data) {
                    res.redirect(data);
                } else {
                    res.send(500, err.toString());
                }
            });
        }
        ));
    });
};
