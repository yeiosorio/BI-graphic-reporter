var mysql = require('mysql');

// cadena de conexion para bd de esquemas de usuario
const configBI = require('../database/conf-mysqlBI');
var dbBI = mysql.createConnection(configBI);
dbBI.connect();

const Moment = require('moment');

const EsquemaController = {};

/**
 * Carlos Aguirre 2018-12-10 12:24:13
 * Obtiene el listado de esquemas activos
 * en el sistema, los parametros `limit` y `offset`
 * son necesarios para la paginacion de los resultados
 */
EsquemaController.getEsquemas = (req, res, next) => {
    let limit = req.body.limit;
    let offset = req.body.offset;

    dbBI.query(
        `SELECT * FROM esquema WHERE estado = 1 LIMIT ${limit},${offset}`,
        null,
        (err, result) => {
            if (!err) {
                res.send({
                    success: true,
                    esquemas: result
                });
            } else {
                res.send({
                    success: false,
                    error: err
                });

            }
        }
    );
}

/**
 * Carlos Aguirre 2018-12-10 12:27:25
 * Obtiene todos los esquemas activos por usuario
 */
EsquemaController.getEsquemasUsuario = (req, res, next) => {

    let usuario_id = req.body.usuario_id;
    let empresa_id = req.body.empresa_id;



    dbBI.query(
        `SELECT * FROM bi.esquema WHERE estado = 1 AND usuario_id = '${usuario_id}' AND empresa_id='${empresa_id}'`,
        null,
        (err, result) => {
            if (!err) {
                res.send({
                    success: true,
                    esquemas: result
                });
            } else {
                res.send({
                    success: false,
                    error: err
                });

            }
        }
    );
}

module.exports = EsquemaController;