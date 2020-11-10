var mysql = require('mysql');

// cadena de conexion para bd de esquemas de usuario
const configBI = require('../database/conf-mysqlBI');
var dbBI = mysql.createConnection(configBI);
dbBI.connect();


const PlanController = {};
const Moment = require('moment');


// Funcion para insertar un usuario en la base de datos
PlanController.crearPlan = (req, res, next) => {

    let plan = [
        req.body.cant_usuarios, // cant_usuarios
        req.body.cant_graficos, // cant_graficos
        Moment().format('YYYY-MM-DD HH:mm:ss'), // fech_creacion 
        1 // estado
    ]

    // req.getConnection((err, conn) => {

    dbBI.query(`INSERT INTO plan (cant_usuarios, cant_graficos, fech_creacion, estado)  VALUES( ? )`, [plan], (err, rows) => {
        if (err) {
            res.send({
                success: false,
                message: err
            });
        } else {
            res.send({
                success: true,
                message: "Se ha guardado el plan."
            });
        }
    });

    //  });


}


// Funcion para insertar un usuario en la base de datos
PlanController.obtenerPlan = (req, res, next) => {
    console.log(req.params);
    let planId = req.params.plan_id;


    // req.getConnection((err, conn) => {

    dbBI.query('SELECT * FROM plan WHERE plan.id =' + planId, null, (err, rows) => {
        if (err) {
            res.send({
                success: false,
                message: err
            });
        } else {
            res.send({
                success: true,
                plan: rows[0]
            });
        }
    });

}


/**
 * Carlos Aguirre 2018-12-05 15:23:24
 * Obtiene todos los planes activos en la base de datos
 */
PlanController.getPlanes = ( req, res, next )=>{
    dbBI.query(
        `SELECT * FROM plan WHERE estado = 1`,
        null,
        ( err, result ) =>{
            if( !err ){
                res.send({success: true, planes: result});
            }
            else{
                res.send({success: false, error: err});
            }
        }
    );
}




module.exports = PlanController;