var kraken = require('kraken-js');
var express = require('express');
var app = express();

app.use(kraken());

app.listen(process.env.PORT || 8080);
