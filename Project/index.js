var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');
var mysql = require('mysql');
var app = express()
var bodyParser = require('body-parser');
var router = require('./routes');



app.use(bodyParser.urlencoded({ extended: true })); 

//Using the static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);

//Handlebars registration
app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('views', path.join(__dirname, 'public/views')); 
app.set('view engine', 'hbs');

//Timeout


//Default Port Listening
app.listen(4000, function () {
  console.log('Example app listening on port 4000!'); 
});

module.exports=app;