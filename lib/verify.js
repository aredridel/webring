var jsdom = require('jsdom');
var http = require('http');
var bl = require('bl');
var url = require('url');

function verifySite(site, encoding, next) {
    console.warn('site', site);
    http.get(site.value, function (res) {
        res.pipe(bl(handleErrors(function (page) {
            jsdom.env(page.toString(), function (err, window) {
                var links = window.document.getElementsByTagName('a');
                var verifiableLinks = Array.prototype.map.call(links, function (l) {
                    return url.parse(l.getAttribute('href'));
                }).filter(function (l) {
                    return l.protocol == 'http:' && l.host == 'webring.blah';
                });

                console.log('verify?', verifiableLinks.filter(nextLink).length && verifiableLinks.filter(prevLink).length);

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

function nextLink(l) {
    return l.path == '/next/after/123';
}

function prevLink(l) {
    return l.path == '/the/one/before/123';
}
