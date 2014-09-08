var db = require('../lib/db');
var url = require('url');

module.exports = function (router) {
    router.get('/', function (req, res) {
        res.render('join');
    });

    router.post('/', function (req, res) {
        var u = url.parse(req.body.url);
        db.get(u.host, handleError(function (data) {
            if (data) {
                data = JSON.parse(data);
                console.log(req.body, data, u, err);
                res.render('success');
            } else {
                db.put(u.host, JSON.stringify({
                    url: req.body.url,
                    title: req.body.title
                }), handleError(function () {
                    res.render('success');
                }));
            }
        }));

        function handleError(fn) {
            return function (err, result) {
                if (err && err.type != 'NotFoundError') {
                    console.log(err);
                    res.send(500);
                } else {
                    return fn(result);
                }
            };
        }
    });
};
