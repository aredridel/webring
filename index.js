var kraken = require('kraken-js');
var express = require('express');
var app = express();
var db = require('./lib/db');

app.use(kraken({
    protocols: {
        'leveldb-init-random': require('shortstop-leveldb-init-random')(db)
    }
}));

app.listen(process.env.PORT || 7772);
