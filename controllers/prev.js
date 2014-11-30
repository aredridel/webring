var db = require('../lib/db').sublevel('sites');

module.exports = function (router) {
    router.get('/*', function (req, res) {
        var target = req.params[0];
        var prev;
        get('HEAD');

        function get(site) {
            db.get(site, function (err, data) {
                if (prev && ((err && err.type == 'NotFoundError') || !data || data == '#' || data == target)) {
                    return res.redirect(prev);
                } else if (!err) {
                    prev = data;
                    get(data);
                } else {
                    res.send(500, err.toString());
                }
            });
        }
    });
};
