//
// # nodejs-mongoose-intro
//
// Introduction to Mongoose.

//configure here
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('./config/mongoose'),
    express = require('./config/express');

//process.env.IP process.env.PORT
var db = mongoose();
var app = express();
app.listen(process.env.PORT);
module.exports = app;

console.log('server running on ' + process.env.PORT);