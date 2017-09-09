const express = require('express');
const app = express();
const request = require('request');
var http = require('http').Server(app)
var io = require("socket.io")(http)
var cheerio = require('cheerio');
var unique = require('uniq');

app.use(express.static('.'));

http.listen(3000, function () {
  console.log('Example app listening on port 3000');
})

io.on('connection', function(socket){
	socket.emit('youreconnected');

	// Gets the tickers and emits tickersreceived to the index.html
	socket.on('querytickers', function(msg){
		console.log("queried " + msg);
		var tickers = [];
		Scrape(msg);
	});

	socket.on('disconnect', function() {
    	console.log('a user disconnected');
  	});
})

var names = [];
function Scrape(word){
  var query = word; // Hardcode for now
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
        	}
        });
      }
    console.log(names);
    tickers = names;
		for(var i = 0; i < tickers.length; i++){
    		console.log(i + " = " + tickers[i]);
		}
		console.log("queried " + tickers);
		io.emit('tickersreceived', {tickerData: tickers});
  });
}

