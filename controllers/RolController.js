var mysql = require( 'mysql' );

// cadena de conexion para bd de esquemas de usuario
const configBI = require('../database/conf-mysqlBI');
var dbBI = mysql.createConnection(configBI);
dbBI.connect();


const Moment = require('moment');

const RolController = {};

/**
 * Carlos Aguirre 2018-12-05 08:27:57
 * Funcion para crear un rol en la base de datos
 * insertando un registro en la tabla rol
 */
RolController.crearRol = ( req, res, next )=>{
    let data = [
        req.body.nombre,
        req.body.descripcion
    ]

    dbBI.query( `INSERT INTO rol(nombre, descripcion) VALUES(?)`, [data], ( err, result )=>{
        if(!err){
            res.send({ success: true, insert_id: result.insertId });
        }
        else{
            res.send({ success: false, error: err });
        }
    } );

}


/**
 * Carlos Aguirre 2018-12-05 08:31:40
 * Obtiene un listado de los roles que 
 * actualmente existen en la base de datos
 */

RolController.getRoles = ( req, res, next )=>{

    dbBI.query( `SELECT * FROM rol`, null, ( err, result )=>{
        if(!err){
            res.send({ success: true, roles: result});
        }
        else{
            res.send({ success: false, error: err });
        }
    } );

}


module.exports = RolController;