var verifySites = require('../lib/sites').verifySites;

module.exports = function (router) {

    router.post('/', function (req, res) {
        verifySites(req.app.kraken.get('baseURL'));
        res.end("Verifying sites, check your links soon!");
    });
};
