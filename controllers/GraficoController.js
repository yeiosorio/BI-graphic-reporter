var mysql = require('mysql');

// cadena de conexion para bd de esquemas de usuario
const configBI = require('../database/conf-mysqlBI');
var dbBI = mysql.createConnection(configBI);
dbBI.connect();


const Moment = require('moment');

const GraficoController = {};


GraficoController.getInfoGraph = (req, res) => {
    const ejes = req.body.data.x.concat(req.body.data.y);
    let fields = ``; // Unión de los datos en el select
    let groupBy = ``; // Agrupación de datos en la consulta
    const data = {}; //Para apilar los resultados por nombre de parametro
    /* Se unen y recorren los ejes para estructurar los campos y operaciones que se realizaran en la consulta */
    ejes.forEach(element => {
        if (element.operacion === '' || element.operacion === undefined) {
            fields = fields.concat(` ${element.nombre},`);
            groupBy = groupBy.concat(` ${element.nombre},`);
            data[element.nombre] = []; //Se crea el objeto con el nombre del campo que ira a la consulta
        } else {
            fields = fields.concat(` ${element.operacion}(${element.nombre}) as "${element.nombre} ${element.operacion}",`);
            data[`${element.nombre} ${element.operacion}`] = []; //Se crea el objeto con el nombre del campo que ira a la consulta
        }
    });
    /* 
        Si solo se selecciono un eje en el frontEnd, se añade un campo u operación mas,
        dependiendo si se selecciono con operacion o valores reales
    */
    const lengthEjes = ejes.length;
    if (lengthEjes === 1) {

        if (ejes[0].operacion === '' || ejes[0].operacion === undefined) {
            fields = fields.concat(` count(*) as total,`);
            data['total'] = [];
        } else {
            fields = fields.concat(` ${ejes[0].nombre},`);
            groupBy = groupBy.concat(` ${ejes[0].nombre},`);
            data[ejes[0].nombre] = []; //Se crea el objeto con el nombre del campo que ira a la consulta
            //Se arega la coma al final para mantener la lógica desde forEach anterior y en la construccion del sql elimine la coma y no otro caracter
        }
    }
    const conditionDate = req.body.dates !== null && req.body.dates !== undefined ? ` where fecha_1 between '${req.body.dates.init}' and '${req.body.dates.end}' ` : '';
    //Construccion del sql
    const sqlQuery = `select ${fields.slice(0,-1)} from ${req.body.data.esquema.name}.${req.body.data.selectTable} ${conditionDate}
     ${groupBy.slice(0,-1)!==undefined ? 'group by' + groupBy.slice(0,-1) : '' } `;
     console.log(sqlQuery);
    dbBI.query(sqlQuery,
        (err, result) => {
            try {
                if (!err) {
                    //Se recorre el resultado para adjuntar los datos por nombre parametro
                    result.forEach(elem => {
                        Object.entries(elem).forEach(elem => {
                            data[elem[0]] = [...data[elem[0]], elem[1]];
                        });
                    });
                    res.send({
                        sql: sqlQuery,
                        success: true,
                        res: data
                    });
                } else {
                    res.send({
                        sql: sqlQuery,
                        success: false,
                        error: err
                    });

                }

            } catch (error) {
                console.error("Ocurrio un error: ", error)
            }
        }
    );
}

//4arda el grafico en la tabla, utilizando un dataset
GraficoController.guardarDatosGrafica = (req, res) => {
    console.table(req.body);
    let fecha_creacion = Moment().format('YYYY-MM-DD HH:mm:ss');
    const {nombGrafico, dataset, businessID, type, descripcion} = req.body;
    // Junta todos los datos necesarios para la  inserción del registro
    let allDatos = [nombGrafico, fecha_creacion, businessID, dataset, type, descripcion];


    dbBI.query(`INSERT INTO grafico (nombre, fech_creacion, empresa_id, dataset, type, descripcion)  VALUES( ? )`, [allDatos], (err, result) => {
        if (!err) {
            res.send({
                success: true,
                insert_id: result.insertId
            });
        } else {
            res.send({
                success: false,
                message: err
            })
        }
    });
}


// Elimina un registro de la tabla grafico a partir de su id
GraficoController.eliminarGraficaPorId = (req, res) => {

    let grafico_id = req.body.grafico_id;

    dbBI.query(`DELETE FROM grafico WHERE id = '${grafico_id}'`, null, (err, result) => {
        if (!err) {
            res.send({
                success: true
            });
        } else {
            res.send({
                success: false,
                message: err
            });
        }
    });
}


// Edicion de grafica
GraficoController.editarGrafico = (req, res, next) => {

    let graphId = req.body.graphId
    let nombGrafico = req.body.nombGrafico
    let dataset = req.body.dataset
    let today = Moment().format('YYYY-MM-DD H:mm:ss')
    let type = req.body.type

    dbBI.query(`UPDATE grafico 
                SET nombre = '${nombGrafico}', dataset = '${dataset}', fech_creacion='${today}',  type='${type}'
                WHERE id = '${graphId}' `, [], (err, result) => {
        if (!err) {
            res.send({
                success: true,
            });
        } else {
            res.send({
                success: false,
                message: err
            });
        }
    });
}


/**
 * Carlos Aguirre 2018-12-05 09:06:06
 * Obtiene un grafico a parir de su id ( de la tabla `grafico`)
 */
GraficoController.getGraficoPorId = (req, res, next) => {
    let grafico_id = req.params.grafico_id;
    dbBI.query(
        `SELECT * FROM grafico WHERE id = ${grafico_id} LIMIT 1 `,
        null,
        (err, result) => {
            if (!err) {
                res.send({
                    success: true,
                    grafico: result
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
 * Carlos Aguirre 2018-12-07 09:46:21
 * Obtiene un listado de los graficos ya creados para una empresa dada
 */
GraficoController.getListaGraficosEmpresa = (req, res, next) => {
    // let data = [
    //     '%' + req.body.filtro + '%',
    //     req.body.empresa_id
    // ];
    let esquema = req.body.esquema;
    let empresa_id = req.body.empresa_id;

    let limit = req.body.limit;
    let offset = req.body.offset;
    //  WHERE grafico.nombre LIKE ? AND esquema.empresa_id = ?
    // LIMIT ${limit},${offset}
    // data,
    dbBI.query(
        `SELECT
            grafico.id,
            grafico.nombre,
            grafico.dataset,
            grafico.type
        FROM bi.grafico
        where grafico.empresa_id = ${empresa_id}`,

        (err, result) => {
            if (!err) {
                res.send({
                    success: true,
                    graficos: result
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


GraficoController.obtenerDatosGrafica = (req, res) => {

    dbBI.query(`SELECT * FROM grafico`, (err, rows) => {
        if (err) throw err;
        res.json(rows);
    });


}


module.exports = GraficoController;

function newFunction(ejes) {
    console.table(ejes);
}