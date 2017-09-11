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
	var data = {names : [], titles : [], prices : [], marketCaps : [], descriptions : [] }

	var dict = {};
	var query = word; // Hardcode for now
	var url = "https://www.google.com/finance?noIL=1&q=" + query;
	tickers = [];
    var counter = 0;
	request(url, function (error, response, html) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        // Getting tickers
        $('td.symbol').each(function(i, element){
        	var a = $(this);
        	var ticker = /[A-Z]+/
        	var res = ticker.exec(a.text());
        	if(res != null){
        		if(res in dict){
        			data.names.push(null);
        		} else {
        			dict[res] = true;
        			// hardcode if it is length 3 or 4 keep it (not 5)
        			if(res[0].length == 3 || res[0].length == 4){
        				data.names.push(res[0]);
                        data.descriptions.push(null);
                        tickers[res[0]] = counter;
                        counter++;
                        getDescrips(res[0], data);
        			} else {
                        counter++;
        				data.names.push(null);
        			}
        		}	
        	} else {
                counter++;
        		data.names.push(null);
        	}
        });
        console.log(data.names);

        // Get the stock full name
        $('td.localName').each(function(i, element){
        	var a = $(this);
        	var res = a.text();
        	if(res != null){
        		data.titles.push(res);
        	} else {
        		data.titles.push(null);
        	}
        });
        console.log(data.titles);

        // Get the prices 
        $('td.price').each(function(i, element){
        	// $('td.exch');
        	var a = $(this);
        	var ticker = /[0-9]+\.[0-9]+/
        	var res = ticker.exec(a.text());
        	if(res != null){
        		data.prices.push(res[0]);
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
        	} else {
        		data.marketCaps.push(null);
        	}
        });
        console.log(data.marketCaps);

        // Get the descriptions 
        /*$('div.description').each(function(i, element){
        	var a = $(this);
        	var ticker = /.
        	var res = ticker.exec(a.text());
        	if(res != null){
        		data.descriptions.push(res[0]);
        	} else {
        		data.descriptions.push(null);
        	}
        });  */      
    }

    // Send the data to the front end
    slow(data);
    });
}

function getDescrips(query, data){
    var url = "https://www.google.com/finance?q=" + query;
    request(url, function (error, response, html) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
         $('div.companySummary').each(function(i, element){
            var a = $(this);
            var res = a.text();
            if(res != null){
                data.descriptions[tickers[query]] = res;
            } else {
                data.descriptions.push(null);
            }
        });
    }
    console.log(data.descriptions);
    })
}

function slow(data){
    setTimeout( function(){
    console.log( 'slow api call' );
    // Validate the data by checking each row
    var resultsPerPage = 15;
    var alteredData = {names : [], titles : [], prices : [], marketCaps : [], descriptions : []}
    for(var i = 0; i < resultsPerPage; i++){
        if(data.names[i] != null && data.titles[i] != null && data.prices[i] != null && data.marketCaps[i] != null && data.descriptions[i] != null){
            // Need to check if the callback for the descriptions comes back
            alteredData.names.push(data.names[i]);
            alteredData.titles.push(data.titles[i]);
            alteredData.prices.push(data.prices[i]);
            alteredData.marketCaps.push(data.marketCaps[i]);
            alteredData.descriptions.push(data.descriptions[i]);
        }
    }

    io.emit('tickersreceived', {tickerData: alteredData.names, titleData: alteredData.titles, priceData: alteredData.prices, marketCapData: alteredData.marketCaps,
        descriptionsData : alteredData.descriptions });
    console.log("sent");
  }, 3000 );
    
}


