const express = require('express');
const app = express();
const request = require('request');
var cheerio = require('cheerio');

app.use(express.static('.'));

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})