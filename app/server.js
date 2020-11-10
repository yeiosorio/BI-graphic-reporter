var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mysql = require('mysql');
var myConnection = require('express-myconnection');
var cors = require('cors');

// importing routes
var routes = require('../routes/routes');

// JWT
var addNewUser = require('../middleware/addNewUser');
var userLoginCheck = require('../middleware/userLoginCheck');

var port = 8000;

app.set('port', process.env.PORT || port);
//var URI_FRONTED = 'http://192.168.2.111:4200';
var URI_FRONTED = 'http://localhost:4200';
// view engine
app.set('views', path.join(__dirname, './../views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(morgan('dev'));
// set static folder
app.use(express.static(path.join(__dirname, 'public'))); 

//body poarser MW
app.use(
    cors({
        origin: URI_FRONTED
    })
);
app.use(morgan('dev'));
//app.use(bodyParser.json());
//Se Agrega limite maximo permitido para grandes datos en el JSON
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(
    bodyParser({
        uploadDir: 'uploads'
    })
);
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
// database
var debug = require('debug')('app:dbConn');


//BASE DE DADES REAL
/*
const config1 = {
    server: "129.158.73.193",
    database: "sambiomab_prod",
    user: "sambiomab_prod",
    password: "4GZ0pvt!8Ysk"
};
const config2 = {
    server: "191.101.12.40",
    database: "bi",
    user: "bi",
    password: "olHoFj#z+YqS",
};*/

// starting server
app.listen(app.get('port'), function() {
    console.log('servidor activo en el puerto ' + app.get('port'));
});

// JWT
routes.use(bodyParser.urlencoded({
    extended: true
}));
routes.use(bodyParser.json());

app.post('/signup', addNewUser);
app.post('/userlogin', userLoginCheck);

// routes
app.use('/', routes);