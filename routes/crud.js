'use strict';

module.exports = function(app, db, options) {
  var swaggerUtils = require('swagger-utils');
  var Resource = require('resourcejs');
  var express = require('express');
  var router = express.Router();

  var UserinfoModel = require('../models/userinfo')(db, options.fields);

  var models = {
    'userinfo': {
      model: UserinfoModel
    }
  };

  router.use(require('express-middleware-apikey')(options.api_keys));

  var swaggerDefinition = {
    'basePath': '/crud'
  };

  prepareCrud(models, '');

  function prepareCrud(models, basePath, before) {
    for (var modelKey in models) {
        var modelInfo = models[modelKey];
        //var modelResource = Resource(router, '', modelKey, modelInfo).rest(); //without dependencies
        var modelResource = Resource(router, basePath, modelKey, modelInfo.model).rest({
          before: before ? before : function(req, res, next)  {
            req.query.populate = req.query.populate ? req.query.populate : '__NONE__';
            next();
          }
        });
        swaggerUtils.add(swaggerDefinition, modelResource.swagger());

        if (modelInfo.parentOf) {
          prepareCrud(modelInfo.parentOf, basePath+"/"+modelKey+"/:"+modelKey+"Id", function(req, res, next)  {
            req.body[modelKey] = req.params[modelKey+"Id"];
            req.modelQuery = this.model.where(modelKey, req.params[modelKey+"Id"]);
            //req.modelQuery = req.modelQuery.populate(modelKey)
              req.query.populate = req.query.populate ? req.query.populate : '__NONE__';
              next();
          });
        }
    }

  }

  app.use(swaggerDefinition.basePath, router);

  console.log(JSON.stringify(swaggerDefinition));

  return swaggerDefinition;
}
