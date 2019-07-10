const { JSDOM } = require('jsdom');
var http = require('http');
var bl = require('bl');
var url = require('url');

function verifySite(baseURL) {
    var base = url.parse(baseURL);
    return async function verifySiteInner(site, encoding, next) {
        var stream = this;
        try {
            const dom = await JSDOM.fromURL(site.value)
            const { window } = dom;

            const links = Array.from(window.document.querySelectorAll('a[href]'));
            var verifiableLinks = Array.from(links).map(l => {
                return url.parse(l.getAttribute('href'));
            }).filter(l => {
                return l.protocol == base.protocol && l.host == base.host;
            });

            if (verify(verifiableLinks)) {
                console.warn('verified', site.value);
                stream.push(site.value);
            } else {
                console.warn(site.value, "failed verify");
            }

            next();
        } catch (e) {
            console.warn(e);
            next();
        }

        function verify(links) {
            return links.some(nextLink) && links.some(prevLink);
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

