'use strict';

module.exports = function(app, db, options) {
  var swaggerUtils = require('swagger-utils');
  var Resource = require('resourcejs');
  var express = require('express');
  var router = express.Router();
  var ObjectId = require('mongoose').Types.ObjectId;

  var UserinfoModel = require('../models/userinfo')(db, options.fields);

  var swaggerDefinition = {
    'basePath': '/my',
    tags: [],
    definitions: {},
    paths: {},
    "securityDefinitions": {
       "Bearer": {
           "type": "apiKey",
           "name": "Authorization",
           "in": "header"
       }
   },
  };

  router.use(require('express-jwt')({secret: options.jwt.secretOrKey}));

  createRest4fields('', options.fields);

  function createRest4fields(path, fields) {
    for (var attr in fields) {
      var definition = fields[attr];
      createRest4field((path ? path+'.' : '')+attr, definition);
      if (typeof definition == "Object" && !definition["type"]) {
        createRest4fields((path ? path+'.' : '')+attr, fields);
      }
    }
  }

  function mongooseFieldToSchema(type) {
    var schema = {};
    if (type == String || type == Date) {
        schema.type = "string";
    } else if (type == Boolean) {
        schema.type = "boolean";
    } else if (type == Number) {
        schema.type = "number";
    } else if (typeof type == "object") {
        schema.type = "array";
        schema.items = mongooseFieldToSchema(type[0]);
    } else {
        throw "Unknown mongoose field type "+type+" 4 swagger";
    }
    return schema;
  }

  function createRest4field(path, fieldDefinition) {
    if (typeof fieldDefinition != "object") {
      fieldDefinition = {type: fieldDefinition};
    }
    var schema = {};
    if (!fieldDefinition.type) {
      swaggerDefinition.definitions["my"+path] = {

      };
      schema["$ref"] = "#/definitions/my"+path;
    } else {
      schema = mongooseFieldToSchema(fieldDefinition.type);
    }
    var parameterBody = {
      "name": "body",
      "description": "Data to set",
      "required": true
    }
    if (schema.type != "array") {
      parameterBody.in = "query";
      parameterBody.type = schema.type;
    } else {
      parameterBody.in = "body";
      parameterBody.schema = schema;
    }
    swaggerDefinition.paths["/"+path] = {
      "get": {
        "tags": [
          "my"
        ],
        "security": [
            {
                "Bearer": []
            }
        ],
        "summary": "get my "+path,
        "description": "This operation allows you to get the attr "+path+" of userinfo.",
        "operationId": "get"+path,
        "responses": {
          "200": {
            "description": "Resource(s) found.  Returned the value.",
            "schema": schema
          },
          "401": {
            "description": "Unauthorized."
          }
        },
        "parameters": [
          {
            "name": "Authorization",
            "in": "header",
            "description": "Bearer jwt",
            "required": false,
            "type": "string"
          },
        ]
      },
      "put": {
        "tags": [
          "my"
        ],
        "security": [
            {
                "Bearer": []
            }
        ],
        "summary": "put my "+path,
        "description": "This operation allows you to put the attr "+path+" of userinfo.",
        "operationId": "put"+path,
        "responses": {
          "200": {
            "description": "Resource(s) found.  Put the value.",
            "schema": schema
          },
          "401": {
            "description": "Unauthorized."
          }
        },
        "parameters": [
          {
            "name": "Authorization",
            "in": "header",
            "description": "Bearer jwt",
            "required": false,
            "type": "string"
          },
          parameterBody
        ]
      }
    };
    router.get("/"+path, function(req, res){
      getAndFill(req, res, function(userinfo) {
        var pathParts = path.split('.');
        var val = userinfo._doc;
        for (var i=0; i<pathParts.length; i++) {
          val = val[pathParts[i]];
        }
        res.status(200).send(val);
      });
    });

    router.put("/"+path, function(req, res){
      getAndFill(req, res, function(userinfoPm) {
        var pathParts = path.split('.');
        var val = userinfoPm._doc;
        var newVal = req.query.body ? req.query.body : req.body;
        if (!fieldDefinition.type) {
          newVal = JSON.parse(newVal);
        }
        for (var i=0; i<pathParts.length; i++) {
          if (i==pathParts.length-1) {
            if (val[pathParts[i]] != newVal) {
              val[pathParts[i]] = newVal;
              userinfoPm.markModified(path);
            }
          }
          val = val[pathParts[i]];
        }
        userinfoPm.save(function() {
          res.status(200).send(val);
        });
      });
    });

    function getAndFill(req, res, callback) {
      UserinfoModel.findOne({ _id: new ObjectId(req.user._id) }, function (err, userinfoPm) {
        if (err) {
          res.status(500).send({err: err});
        } else if (!userinfoPm) {
          var userinfo = {_id: req.user._id};
          fillDefaults(undefined, userinfo);
          UserinfoModel.create(userinfo, callCallback);
        } else {
          fillDefaults(userinfoPm, userinfo);
          userinfoPm.save(callCallback);
        }
      });

      function callCallback(err, userinfo) {
        if (err) {
          res.status(500).send({err: err});
        } else {
          callback(userinfo);
        }
      }
    }

    function fillDefaults(userinfoPm, userinfo) {
      //TODO if modified prop and userinfoPm != undefined --> userinfoPm.markModified(prop);

    }
  }

  app.use(swaggerDefinition.basePath, router);

  console.log(JSON.stringify(swaggerDefinition));

  return swaggerDefinition;
};
