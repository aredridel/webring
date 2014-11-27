var jsdom = require('jsdom');
var http = require('http');
var bl = require('bl');
var url = require('url');

function verifySite(baseURL) {
    var base = url.parse(baseURL);
    return function verifySiteInner(site, encoding, next) {
        var stream = this;
        http.get(site.value, function (res) {
            res.pipe(bl(handleErrors(function (page) {
                jsdom.env(page.toString(), function (err, window) {
                    var links = window.document.getElementsByTagName('a');
                    var verifiableLinks = Array.prototype.map.call(links, function (l) {
                        return url.parse(l.getAttribute('href'));
                    }).filter(function (l) {
                        return l.protocol == base.protocol && l.host == base.host;
                    });

                    if (verify(verifiableLinks)) {
                        console.warn('verified', site.value);
                        stream.push(site.value);
                    } else {
                        console.warn(site.value, "failed verify");
                    }

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

        function verify(links) {
            return links.filter(nextLink).length && links.filter(prevLink).length;
        }

        function nextLink(l) {
            return l.path == '/next/' + site.value;
        }

        function prevLink(l) {
            return l.path == '/prev/' + site.value;
        }
    };
}

module.exports = verifySite;

