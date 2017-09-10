const express = require('express');
const app = express();
const request = require('request');
var http = require('http').Server(app)
var io = require("socket.io")(http)
var cheerio = require('cheerio');


var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

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


function Scrape(word){
	var data = {names : [], prices : [], marketCaps : [], descriptions : [] }

	var dict = {};
	var query = word; // Hardcode for now
	var url = "https://www.google.com/finance?noIL=1&q=" + query;
	tickers = [];
	request(url, function (error, response, html) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('td.symbol').each(function(i, element){
        	var a = $(this);
        	var ticker = /[A-Z]+/
        	var res = ticker.exec(a.text());
        	if(res != null){
        		if(res in dict){
        			console.log("duplicate");
        			data.names.push(null);
        		} else {
        			dict[res] = true;
        			// hardcode if it is length 3 or 4 keep it (not 5)
        			if(res[0].length == 3 || res[0].length == 4){
        				data.names.push(res[0]);
        			} else {
        				data.names.push(null);
        			}
        		}	
        	} else {
        		data.names.push(null);
        	}
        });

        // Get the prices 
        $('td.price').each(function(i, element){
        	// $('td.exch');
        	var a = $(this);
        	var ticker = /[0-9]+\.[0-9]+/
        	var res = ticker.exec(a.text());
        	if(res != null){
        		data.prices.push(res[0]);
        		console.log(res[0]);
        	} else {
        		data.prices.push(null);
        	}
        });
        console.log(data.prices);

        // Get the marketCaps
        $('td.mktCap').each(function(i, element){
        	var a = $(this);
        	var ticker = /[0-9]+\.[0-9]+[A-Z]?/
        	var res = ticker.exec(a.text());
        	if(res != null){
        		data.marketCaps.push(res[0]);
        		console.log(res[0]);
        	} else {
        		data.marketCaps.push(null);
        	}
        });
        console.log(data.marketCaps);

        // Get the descriptions
        $('div.description').each(function(i, element){
        	var a = $(this);
        	var ticker = /.*/
        	var res = ticker.exec(a.text());
        	if(res != null){
        		data.descriptions.push(res[0]);
        		console.log(res[0]);
        	} else {
        		data.descriptions.push(null);
        	}
        });
        console.log(data.descriptions);
    }
    // Validate the data by checking each row
    var resultsPerPage = 15;
    var alteredData = {names : [], prices : [], marketCaps : [], descriptions : []}
    for(var i = 0; i < resultsPerPage; i++){
    	if(data.names[i] != null && data.prices[i] != null && data.marketCaps[i] != null && data.descriptions[i] != null){
    		alteredData.names.push(data.names[i]);
    		alteredData.prices.push(data.prices[i]);
    		alteredData.marketCaps.push(data.marketCaps[i]);
    		alteredData.descriptions.push(data.descriptions[i]);
    	}
    }

    // Send the data to the front end
	console.log("queried");
	io.emit('tickersreceived', {tickerData: alteredData.names, priceData: alteredData.prices, marketCapData: alteredData.marketCaps,
		descriptionsData : alteredData.descriptions });
  });
}

