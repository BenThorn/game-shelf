//Requires
var http = require('http');
var url = require('url');
var query = require('querystring');
var fs = require('fs');

//API Link
var GiantBombAPI = require('../node_modules/giantbombing-api');
var config = {
    apiKey: 'a8c50336272d5cf222a55a2e86f8486011b9e0ee',
    userAgent: 'User'
};
var giantBombAPI = new GiantBombAPI(config);

var index = fs.readFileSync(__dirname + "/../client/gameshelf.html");

var main = fs.readFileSync(__dirname + "/../js/main.js");

var port = process.env.PORT || 3000;

function onRequest(req, res) {
  
  var parsedUrl = url.parse(req.url);
  var params = query.parse(parsedUrl.query);
  
  console.dir(parsedUrl.pathname)

  if(parsedUrl.pathname === "/gameSearch") {
    gameSearch(req, res, params); //Search database for certain term
  }
  else if(parsedUrl.pathname === "/gameInfo"){
    getSingleGame(req, res, params);   //Get a singular game
  }
  else if(parsedUrl.pathname === "/js/main.js"){
    res.writeHead(200, { "Content-Type" : "application/javascript"} );
    res.write(main);
    res.end();
  }
  else {
    res.writeHead(200, { "Content-Type" : "text/html"} );
    res.write(index);
    res.end();
  }
}

//Search
function gameSearch(req, res, params){
    console.log('Searching...');
    let options = {
        field_list: 'name,id,original_release_date,platforms, developers',
        query: params.term,
        resources: 'game',
        resource_type: 'game',
        limit: 35
    };
    
    giantBombAPI.getSearch(options, function(err, data) {
        if (err) {
            console.log('failure');
            res.writeHead(400, { "Content-Type" : "application/json"});
            res.write(JSON.stringify(err));
            res.end();
            return console.log(err);
        }
        res.writeHead(200, { "Content-Type" : "application/json"});
        res.write(JSON.stringify(data.results));
        res.end();
        console.log('success');
    });
}

//Single game
function getSingleGame(req, res, params){
    options = {
        field_list: 'id,name,description,deck,platforms,image,developers,platforms,expected_release_year,genres,people,original_release_date',
    };

    giantBombAPI.getGame(params.term, options, function(err, data) {
        if (err) {
            console.log('failure');
            res.writeHead(400, { "Content-Type" : "application/json"});
            res.write(JSON.stringify(err));
            res.end();
            return console.log(err);
        }
        res.writeHead(200, { "Content-Type" : "application/json"});
        res.write(JSON.stringify(data.results));
        res.end();
        console.log('success');
    });
}

http.createServer(onRequest).listen(port);
console.log("listening on port " + port);