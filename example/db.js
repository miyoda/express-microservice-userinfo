var mongoose = require('mongoose');

var mongoUri = 'mongodb://localhost:27017/userinfo';
var db = mongoose.createConnection(mongoUri);

db.on('connected', function () {
    console.log('Mongoose connection open', mongoUri);
});

db.on('disconnected', function () {
    console.log('Mongoose connection '+mongoUri+' disconnected');
});

db.on('error', function (error) {
    console.log('Mongoose connection '+mongoUri+' error: ',error);
});

module.exports = db;
