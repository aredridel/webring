var sites = require('../lib/sites');
var url = require('url');

module.exports = function (router) {
    router.get('/', function (req, res) {
        res.render('join');
    });

    router.post('/', function (req, res) {
        sites.enqueue(req.body.url, handleError(function (data) {
            res.render('success');
        }));

        function handleError(fn) {
            return function (err, result) {
                if (err) {
                    console.log(err);
                    res.send(500);
                } else {
                    return fn(result);
                }
            };
        }
    });
};
