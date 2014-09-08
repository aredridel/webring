var db = require('../lib/db');
var url = require('url');

module.exports = function (router) {
    router.get('/', function (req, res) {
        res.render('join');
    });

    router.post('/', function (req, res) {
        db.get(req.body.url, handleError(function (data) {
            if (data) {
                data = JSON.parse(data);
                res.render('success');
            } else {
                db.batch([
                    {
                        type: 'put',
                        key: req.body.url,
                        value: JSON.stringify({
                            url: req.body.url,
                            validated: false
                        })
                    },
                    {
                        type: 'put',
                        key: 'pending ' + req.body.url,
                        value: req.body.url
                    }
                ], handleError(function () {
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
