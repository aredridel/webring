var jsdom = require('jsdom');
var http = require('http');
var bl = require('bl');

function verifySite(site, encoding, next) {
    console.warn('site', site);
    http.get(site.value, function (res) {
        res.pipe(bl(handleErrors(function (page) {
            jsdom.env(page.toString(), function (err, window) {
                var links = window.document.getElementsByTagName('a');
                var verifiableLinks = Array.prototype.filter.call(links, function (l) {
                    return /^http:\/\/webring.blah/.test(l.getAttribute('href'));
                });

                console.log(verifiableLinks.map(function (l) {
                    return l.href;
                }));

                next();
            });
        })));
    }).on('error', handleErrors());

    function handleErrors(fn) {
        return function (err, arg) {
            if (err) {
                console.warn(err);
                return next();
            } else {
                return fn(arg);
            }
        };
    }
}

module.exports = verifySite;
