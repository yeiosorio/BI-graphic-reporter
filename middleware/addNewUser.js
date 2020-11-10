var mysql = require("mysql");
var express = require("express");
var md5 = require("MD5");

const configBI = require('../database/conf-mysqlBI');
var dbBI = mysql.createConnection(configBI);
dbBI.connect();


var addNewUser = function(req, res, next) {
    var date = new Date();
    var post = {
        nomb_usuario    : req.body.nomb_usuario,
        nombre          : req.body.nombre,
        apellido        : req.body.apellido,
        correo          : req.body.correo,
        contrasena      : md5(req.body.contrasena),
        //dob				: req.body.dob,
        latitude        : req.body.latitude,
        longitude       : req.body.longitude,
        device_type     : req.body.device_type,
        device_token    : req.body.device_token,
        identificacion  : req.body.identificacion,
        observacion     : req.body.observacion,
        rol             : req.body.rol_id,


    };


    // Esta primera consulta verfica que el usuario no este creado ya en el sistema
    let data = [
        req.body.correo,
        req.body.identificacion,
        req.body.nomb_usuario
    ];
    dbBI.query(`
    SELECT
        id
    FROM usuario
    WHERE 
        ( usuario.correo = ? OR usuario.identificacion = ? OR usuario.nomb_usuario = ? ) 
    AND 
        usuario.estado = 1
    `, data, ( err, result ) => {

        if( !err && result.length == 0 ){
            var query = "SELECT correo FROM ?? WHERE ??=?";

            var table = ["usuario", "correo", post.correo];

            query = mysql.format(query, table);

            dbBI.query(query, function(err, rows) {
                if (err) {
                    res.json({
                        "success": false,
                        "message": "Error ejecutando consulta",
                        'error': err
                    });
                } else {

                    if (rows.length == 0) {

                        var query = "INSERT INTO  ?? SET  ?";
                        var table = ["usuario"];
                        query = mysql.format(query, table);
                        dbBI.query(query, post, function(err, rows) {
                            if (err) {
                                res.json({
                                    "success": false,
                                    "message": "Error ejecutando",
                                    'error': err
                                });
                            } else {
                                res.json({
                                    "success": true,
                                    "message": "usuario ha sido registrado",
                                    insert_id: rows.insertId
                                });
                            }
                        });

                    } else {
                        res.json({
                            "success": false,
                            "message": "email ya esta registrado"
                        });
                    }
                }
            });
        }
        else{
            res.send({ success:false, message: 'el correo, identificacion o nombre de usuario ya existen' });
        }

    } );
}

module.exports = addNewUser;