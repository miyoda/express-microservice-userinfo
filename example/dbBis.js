var mongoose = require('mongoose');

var mongoUri = 'mongodb://localhost:27017/userinfoBis';
var db = mongoose.createConnection(mongoUri);

db.on('connected', function () {
    console.log('Mongoose default connection open');
});

db.on('disconnected', function () {
    console.log('Mongoose connection disconnected');
});

db.on('error', function (error) {
    console.log('Mongoose connection error: ',error);
});

module.exports = db;
