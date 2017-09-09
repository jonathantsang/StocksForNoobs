const request = require('request');
var cheerio = require('cheerio');

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


