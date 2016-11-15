'use strict';

console.log("Starting example server...");

var mongoose = require('mongoose');
mongoose.set('debug', true);

var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 3000));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var expressMicroserviceUserinfo = require('../');

var swaggerDefinition = {
  host: 'localhost:'+app.get('port'),
  basePath: '/userinfo/v1',
  schemes: ['http']
}
app.use('/userinfo/v1', expressMicroserviceUserinfo(require('./db'), swaggerDefinition, require('./options.js')));


/*var swaggerDefinitionBis = {
  host: 'localhost:'+app.get('port'),
  basePath: '/userinfoBis/v1',
  schemes: ['http']
}
app.use('/userinfoBis/v1', expressMicroserviceUserinfo(require('./dbBis'), swaggerDefinitionBis, require('./optionsBis.js')));
*/

app.get("/", function(req, res) {
  res.status(200).send("express-microservice-userinfo EXAMPLE SERVER /");
});

app.listen(app.get('port'), function() {
  console.log('Listening on %s', app.get('port'))
});
