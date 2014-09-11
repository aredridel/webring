var db = require('./db');

module.exports = {
    enqueue: function enqueue(site, cb) {
        db.get(site, handleError(function (data) {
            if (data) {
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
                    cb(null, m);
                }));
            }
        }));

        function handleError(fn) {
            return function (err, data) {
                if (err && err.type != 'NotFoundError') {
                    cb(err);
                } else {
                    fn(data);
                }
            };
        }
    }
};
