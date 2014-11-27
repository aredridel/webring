var db = require('../lib/db');

module.exports = function (router) {
    router.get('/*', function (req, res) {
        get(req.params[0]);

        function get(site, fallback) {
            db.sublevel('sites').get(site, function (err, data) {
                if (!fallback && ((err && err.type == 'NotFoundError') || !data || data == '#')) {
                    return get('HEAD', true);
                } else if (!err) {
                    res.redirect(data);
                } else {
                    res.send(500, err.toString());
                }
            });
        }
    });
};
