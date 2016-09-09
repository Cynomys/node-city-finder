// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var url =  require('url');
var _ = require('lodash');
var rest = require('restler');
var events = require('events');
var eventEmitter = new events.EventEmitter();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/cities", function(request, response){
  var url_parts =  url.parse(request.url,true);
  var query = url_parts.query;
  if (typeof query.zip === 'undefined' || typeof query.radius === 'undefined') 
  {
    response.status(400).send('Invalid Request!You did not send a \'zip\' and \'radius\' parameter.');
    response.end();
  }
  else
  {
    if(_.size(query)>2)
    {
     response.status(400).send('Invalid Request!Only two parameters(zip,radius) allowed in request.');  
     response.end();
     return;
    }
    if(query.zip.length<5 || query.zip.length>5 || query.zip.match(/^\d{5}(?:[-\s]\d{4})?$/)=== null || query.radius.match(/^\d{2,3}$/)=== null)
    {
      response.status(400).send('Invalid Request!Invalid ZIP code or radius format.(radius has to be between 10 and 999)');
      response.end();
      return;
    }
    var citylist;
    var zip_url = 'https://www.zipcodeapi.com/rest/'+process.env.ZIP_API_KEY+'/radius.json/'+query.zip+'/'+query.radius+'/mile';
    rest.get(zip_url).on('complete', function(result) 
    {
      if (result instanceof Error) 
      {
          console.log('Error:', result.message);
          this.retry(5000); // try again after 5 sec
      } 
      else 
      {
          var citylist_obj = result.zip_codes;
          citylist_obj = _.uniqBy(citylist_obj,'city');
          citylist_obj = _.sortBy(citylist_obj,'distance');
           citylist = _.map(citylist_obj,'city');
           response.end(JSON.stringify(citylist, null, 4));
      }
    });
  }
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
function getCitylist(zip,radius)
{
  var citylist;
  var zip_url = 'https://www.zipcodeapi.com/rest/'+process.env.ZIP_API_KEY+'/radius.json/'+zip+'/'+radius+'/mile';
  rest.get(zip_url).on('complete', function(result) {
  if (result instanceof Error) {
      console.log('Error:', result.message);
      this.retry(5000); // try again after 5 sec
  } else {
      var citylist_obj = result.zip_codes;
      citylist_obj = _.uniqBy(citylist_obj,'city');
      citylist_obj = _.sortBy(citylist_obj,'distance');
      citylist = _.map(citylist_obj,'city');
    }
  });

}