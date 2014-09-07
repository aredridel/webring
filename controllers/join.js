module.exports = function (router) {
    router.get('/', function (req, res) {
        res.render('join');
    });

    router.post('/', function (req, res) {
        res.render('success');
    });
};
