
var mysql   = require("mysql");
var express = require("express");
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config');
// var connection = require("../database");

const configBI = require('../database/conf-mysqlBI');
var dbBI = mysql.createConnection(configBI);
dbBI.connect();

var findAllUsers = function (req, res) {

	var query = "SELECT * FROM ?? ";

    var table = ["usuario"];

    query = mysql.format(query,table);

    dbBI.query(query,function(err,rows){
        if(err) {
            res.json({"success" : false, "message" : "Error ejecutando consulta.", "error": err});
        } else {
            res.json({"success" : true, "usuarios" : rows});
        }
    });
};
module.exports = findAllUsers;