module.exports = function handleError(efn, sfn) {
    return function (err, data) {
        if (err && err.type != 'NotFoundError') {
            efn(err);
        } else {
            sfn(data);
        }
    };
};
