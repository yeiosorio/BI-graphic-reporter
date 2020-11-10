var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var mongojs = require('mongojs');
var config = require('.././database/conf-mysql');


router.get('/task', function(req, res, next) {
    res.send('Pagina tas');
});

module.exports = router;