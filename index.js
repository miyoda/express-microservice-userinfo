'use strict';

module.exports = function(db, swaggerDefinition, options) {
  var swaggerUtils = require('swagger-utils');
  var extend = require('extend');
  var express = require('express');
  var router = express.Router();

  swaggerDefinition = extend({
    "info": {
        "title": "Userinfo API",
        "description": "User info microservice 4 store info/profile/settings",
        "version": "1.0.0"
    },
    swagger: '2.0',
    host: 'localhost:3000',
    basePath: '/userinfo',
    schemes: ['http'],
    responses: {},
    parameters: {},
    securityDefinitions: {},
    tags: []
  }, swaggerDefinition);

  options.path = swaggerUtils.uri(swaggerDefinition);
  console.log("express-miroservice-userinfo options: ",options);

  //static
  router.use(express.static('static'));

  //crud - Basic API 4 models
  swaggerUtils.add(swaggerDefinition, require('./routes/crud')(router, db, options));

  //my - API 4 user view or modify his own userinfo
  swaggerUtils.add(swaggerDefinition, require('./routes/my')(router, db, options));

  swaggerUtils.setup(router, swaggerDefinition);
  return router;
};
