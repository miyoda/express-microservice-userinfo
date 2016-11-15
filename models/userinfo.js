'use strict';

module.exports = function(db, fields) {
  var extend = require('extend');
  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;

  var UserinfoSchema = Schema(
    extend({
      /*user --> _id: {type: mongoose.Schema.Types.ObjectId, index: { unique: true }}*/
    },fields),
  {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
  });

  db.modelUserinfo = db.modelUserinfo ? db.modelUserinfo : db.model('Userinfo', UserinfoSchema);

  return db.modelUserinfo;
};
