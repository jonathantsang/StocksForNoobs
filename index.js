const express = require('express');
const app = express();
const request = require('request');
var cheerio = require('cheerio');

app.use(express.static('.'));

app.listen(3000, function () {
  console.log('Example app listening on port 3000');
  var names = Scrape();
  console.log(names);
})

function Scrape(){
  var names = [];
  var query = "bread"; // Hardcode for now
  var url = "https://www.google.com/finance?noIL=1&q=" + query;

  request(url, function (error, response, html) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('td.symbol').each(function(i, element){
          var a = $(this);
          var ticker = /[A-Z][A-Z][A-Z][A-Z]?/
        var res = ticker.exec(a.text());
          if(res != null){
            names.push(res[0]);
            console.log(res[0]);
            }
        });
      }
    console.log(names);
  });
  return names;
}