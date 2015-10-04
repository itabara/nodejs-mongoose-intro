// Invoke 'strict' JavaScript mode
'use strict';

var config = require('./config'); //read any config files
var express = require('express'); //web app engine
var morgan = require('morgan'); //logging
var compress = require('compression'); //for compression
var bodyParser = require('body-parser'); //body parsing
var methodOverride = require('method-override'); //override HTTP verbs
var session = require('express-session');

module.exports = function() {
    var app = express();
    
    if(process.env.NODE_ENV === 'development')
    {
        app.use(morgan('dev'));
    }
    else if(process.env.NODE_ENV === 'production')
    {
        app.use(compress());
    }
    
    app.use(bodyParser.urlencoded(
        {
            extended: true
        }
    ));
    
    app.use(bodyParser.json());
    app.use(methodOverride());
    
    app.use(session(
        {
            saveUninitialized: true,
            resave: true,
            secret: config.sessionSecret
        }
    ));
    
    app.set('views','./app/views');
    app.set('view engine', 'ejs');
    
    //this calls the routes modules and passes the app parameter to it
    require('../app/routes/index.server.routes.js')(app);
    require('../app/routes/users.server.routes.js')(app);
    
    //for static file handling
    app.use(express.static('./client'));
    
    return app;
};