var mysql = require('mysql');
// cadena de conexion para bd de esquemas de usuario
const configBI = require('../database/conf-mysqlBI');
var dbBI = mysql.createConnection(configBI);
dbBI.connect();


const EmpresaController = {};
const Moment = require('moment');


// Obtiene la informacion de un usuario a partir del id
EmpresaController.crearEmpresa = (req, res, next) => {
    console.log('usuario creando empresa.....');

    let empresa = [
        req.body.nombre, // nombre
        req.body.nit, // NIT
        req.body.email, // email
        req.body.telefono, // telefono
        req.body.direccion, // direccion
        req.body.ciudad, // ciudad
        req.body.departamento, // departamento
        req.body.descripcion, // descripcion
        Moment().format('YYYY-MM-DD HH:mm:ss'), // fech_creacion
    ];
    console.log(empresa);

    //req.getConnection((err, conn) => {
    dbBI.query('INSERT INTO bi.empresa (nombre, nit, email, telefono, direccion, ciudad, departamento,descripcion, fech_creacion)  VALUES(?)', [empresa], (err, rows) => {
        if (!err) {
            res.send({
                success: true,
                message: 'realizado',
                insert_id: rows.insertId
            });
        } else {
            res.send({
                success: false,
                message: err
            });
        }
    });
    //  });
}


// Asociar un Usuario y una empresa
EmpresaController.asocEmpresaUsuario = (req, res, next) => {
    console.log('usuario asociando  empresa .....');

    let usuarioId = req.body.usuario_id;
    let empresaId = req.body.empresa_id;
    let nombProyecto = req.body.nomb_proyecto;
    let descProyecto = req.body.desc_proyecto;
    console.log(nombProyecto);
    // req.getConnection((err, conn) => {
    dbBI.query(`INSERT INTO bi.usuario_empresa (usuario_id, empresa_id)  VALUES('${usuarioId}','${empresaId}')`, null, (err, rows) => {
        if (!err) {

            // Seccion para crear el esquema de bd para cada negocio registrado
            dbBI.query('CREATE DATABASE IF NOT EXISTS empresa_' + empresaId, null, (err, result) => {
                if (err) {
                    res.send({
                        success: false,
                        message: err
                    });
                } else {
                    console.log('creo db')
                    dbBI.query(`INSERT INTO bi.esquema( usuario_id, empresa_id, fech_creacion, nombre, nomb_proyecto, desc_proyecto, estado ) VALUES( '${usuarioId}', '${empresaId}', '` + Moment().format('YYYY-MM-DD HH:mm:ss') + `', 'empresa_${empresaId}', '${nombProyecto}', '${descProyecto}', 1 )`);
                }

            })
            dbBI.query('use empresa_' + empresaId, null, (err, result) => {
                if (err) {
                    res.send({
                        success: false,
                        message: err
                    });
                }
            })
            dbBI.query(`
                    CREATE TABLE IF NOT EXISTS headers_tabla (
                        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                        nomb_tabla VARCHAR(100) NOT NULL,
                        nomb_columna_original VARCHAR(100) NOT NULL,
                        nomb_columna_registrado VARCHAR(100)
                    ) 
                `, null, (err, result) => {
                if (err) {
                    res.send({
                        success: false,
                        message: err
                    });
                }
            })

            res.send({
                success: true,
                message: 'Usuario y empresa asociados'
            });
        } else {
            res.send({
                success: false,
                message: err
            });
        }
    });
    //  });
}

// Asociar un Usuario y una empresa
EmpresaController.obtenerEmpresa = (req, res, next) => {
    let empresa_id = req.body.empresa_id;


    // req.getConnection((err, conn) => {
    dbBI.query(`SELECT * FROM empresa WHERE id = ${empresa_id}`, null, (err, rows) => {
        if (!err) {
            res.send({
                success: true,
                empresa: rows[0]
            });
        } else {
            res.send({
                success: false,
                message: err
            });
        }
    });
    //  });
}


// Cambia el estado de la tabla 
EmpresaController.cambEstadoUsuEmp = (req, res, next) => {
    let usuarioId = req.body.usuario_id;
    let empresaId = req.body.empresa_id;


    //  req.getConnection((err, conn) => {
    dbBI.query(`SELECT id,estado FROM usuario_empresa WHERE usuario_id='${usuarioId}' AND empresa_id = '${empresaId}';`, null, (err, rows) => {
        if (!err) {
            if (rows[0].estado == 1) {
                dbBI.query('UPDATE usuario_empresa SET estado = 0 WHERE id=' + rows[0].id, null, (err, conn) => {

                });
            } else {
                dbBI.query('UPDATE usuario_empresa SET estado = 1 WHERE id=' + rows[0].id, null, (err, conn) => {

                });
            }

            res.send({
                success: true,
                message: 'El estado ha sido cambiado'
            });
        } else {
            res.send({
                success: false,
                message: err
            });
        }
    });
    //  });
}



module.exports = EmpresaController;