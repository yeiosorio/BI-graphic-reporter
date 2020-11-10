var mysql = require("mysql");
// cadena de conexion para bd de esquemas de usuario
const configBI = require("../database/conf-mysqlBI");
var dbBI = mysql.createConnection(configBI);
dbBI.connect();


const EspacioTrabajoController = {};

/**
 * Carlos Aguirre 2018-12-04 15:00:24
 * Crea un grafico en la db
 */
EspacioTrabajoController.crearEspacioTrabajo = (req, res, next) => {
  // primero se crea el registro en la tabla `esquema`

  let tablaEspacio = [
    req.body.nombEspacio, // nombre
    Moment().format("YYYY-MM-DD HH:mm:ss"), // fech_creacion
    req.body.esquema_id // esquema_id,
  ];
  dbBI.query(
    "INSERT INTO espacio_trabajo ( nombre, fech_creacion, esquema_id ) VALUES (?)",
    [tablaEspacio],
    (err, result) => {
      if (!err) {
        res.send({
          success: true,
          insert_id: result.insertId
        });
      } else {
        res.send({
          success: false,
          message: err,
          line: "error insertando en esquema"
        });
      }
    }
  );
};

/**
 * Edita un registro en la tabla espacio_trabajo a partir de su id
 */
EspacioTrabajoController.editarEspacioTrabajo2 = (req, res, next) => {
  // primero se crea el registro en la tabla `esquema`
  let tablaEspacio = [
    req.body.nombEspacio, // nombre
    Moment().format("YYYY-MM-DD HH:mm:ss"), // fech_creacion
    req.body.estado, // esquema_id
    req.body.espacio_id
  ];

  dbBI.query(
    "UPDATE espacio_trabajo SET nombre = ?, fech_creacion = ?, estado=? WHERE id = ?",
    tablaEspacio,
    (err, result) => {
      if (!err) {
        res.send({
          success: true,
          message: "registro " + req.body.espacio_id + " editado"
        });
      } else {
        res.send({
          success: false,
          message: err,
          line: "error insertando en esquema"
        });
      }
    }
  );
};

/**
 * Carlos Aguirre 2018-12-04 15:32:19
 * Cambia el estado de un registro en la tabla `espacio_trabajo`
 */
EspacioTrabajoController.desactivarEspacioTrabajo = (req, res, next) => {
  // primero se crea el registro en la tabla `esquema`
  let espacio_id = req.body.espacio_id;
  dbBI.query(
    `UPDATE espacio_trabajo SET estado = 0 WHERE id = '${espacio_id}'`,
    null,
    (err, result) => {
      if (!err) {
        res.send({
          success: true,
          message: "espacio desactivado"
        });
      } else {
        res.send({
          success: false,
          message: err
        });
      }
    }
  );
};

/**
 * Carlos Aguirre 2018-12-04 16:46:21
 * Obtiene un listado de los espacios de trabajo ACTIVOS de un usuario
 */
EspacioTrabajoController.getEspaciosTrablajoPorUsuario = (req, res, next) => {
  let data = [req.body.usuario_id, "%" + req.body.filtro + "%"];

  let limit = req.body.limit;
  let offset = req.body.offset;

  dbBI.query(
    `SELECT 
                    esquema.id as 'esquema_id',
                    espacio_trabajo.nombre as 'nomb_espacio',
                    esquema.empresa_id,
                    esquema.nombre as 'nomb_esquema',
                    espacio_trabajo.id as 'espacio_trabajo_id'
                FROM espacio_trabajo
                JOIN esquema ON esquema.id = espacio_trabajo.esquema_id
                WHERE 
                    espacio_trabajo.estado = 1 AND esquema.usuario_id = ?
                    AND 
                    espacio_trabajo.nombre LIKE ?
                ORDER BY espacio_trabajo.id DESC
                LIMIT ${limit},${offset}
                `,
    data,
    (err, result) => {
      if (!err) {
        res.send({
          success: true,
          espacios: result
        });
      } else {
        res.send({
          success: false,
          message: err
        });
      }
    }
  );
};

/**
 * Carlos Aguirre 2018-12-05 08:40:28
 * Asocia un espacio de trabajo con sus respectivos graficos
 * insertando registros en la tabla `grafico_espacio_trabajo`
 */
EspacioTrabajoController.asocGraficosEspacio = (req, res, next) => {
  let espacio_trabajo_id = req.body.espacio_trabajo_id;
  let list_graficos_id = req.body.graficos_id;

  for (let i in list_graficos_id) {
    dbBI.query(
      'INSERT INTO grafico_espacio_trabajo (espacio_trabajo_id,grafico_id) VALUES("' +
        espacio_trabajo_id +
        '","' +
        list_graficos_id[i] +
        '")',
      (err, result) => {
        if (err) {
          res.rend({
            success: false,
            error: err
          });
        } else if (i == list_graficos_id.length - 1) {
          res.send({
            success: true
          });
        }
      }
    );
  }
};

/**
 * Carlos Aguirre 2018-12-05 08:54:20
 * Obtiene todos los graficos asociados a un espacio
 * de trabajo
 */

EspacioTrabajoController.getGraficosDeEspacio = (req, res, next) => {
  let espacio_trabajo_id = req.params.espacio_trabajo_id;

  dbBI.query(
    `SELECT 
                grafico.id as 'grafico_id',
                grafico_espacio_trabajo.espacio_trabajo_id,
                grafico.nombre,
                grafico.dataset,
                grafico.tabla_id
             FROM grafico_espacio_trabajo
             JOIN grafico ON grafico.id = grafico_espacio_trabajo.grafico_id
             WHERE grafico_espacio_trabajo.espacio_trabajo_id = ${espacio_trabajo_id}
             GROUP BY grafico.id`,
    null,
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
};

/**
 * Carlos Aguirre 2018-12-05 09:16:33
 * Elimina un grafico de un espacio de trabajo
 */
EspacioTrabajoController.borrarGraficoDeEspacio = (req, res, next) => {
  let grafico_id = req.body.grafico_id;
  let espacio_id = req.body.espacio_id;

  dbBI.query(
    `DELETE FROM grafico_espacio_trabajo 
        WHERE espacio_trabajo_id = '${espacio_id}' AND grafico_id = '${grafico_id}'`,
    null,
    (err, result) => {
      if (!err) {
        res.send({
          success: true
        });
      } else {
        res.send({
          success: false
        });
      }
    }
  );
};

/**
 * Carlos Aguirre 2018-12-12 11:33:55
 * Obtiene el listado de espacios de trabajo activos por empresa
 */
EspacioTrabajoController.getEspaciosPorEmpresa = (req, res, next) => {
  let empresa_id = req.body.empresa_id;

  dbBI.query(
    `SELECT 
            espacio_trabajo.id as 'espacio_trabajo_id',
            esquema.id as 'esquema_id',
            esquema.usuario_id as 'usuario_id',
            esquema.empresa_id as 'empresa_id',
            espacio_trabajo.*
        FROM espacio_trabajo 
        JOIN esquema ON esquema.id = espacio_trabajo.esquema_id 
        WHERE 
        espacio_trabajo.estado = 1
        AND 
        esquema.estado = 1
        AND
        esquema.empresa_id = ${empresa_id}`,
    null,
    (err, result) => {
      if (!err) {
        res.send({
          success: true,
          espacios_trabajo: result
        });
      } else {
        res.send({
          success: false,
          error: err
        });
      }
    }
  );
};

/**
 * Obtiene el listado de los espacios de trabajo `paneles` que un usuario ha
 * realizado dentro de una empresa y estan activos
 */
EspacioTrabajoController.getEspaciosPorEmpresaYUsuario = (req, res, next) => {
  try {
    let data = [
      req.body.empresa_id, // id empresa
      req.body.usuario_id //id usuario
    ];

    // para el rol de cliente se genera JOIN para filtrarsen
    const filter =
      req.body.rol == 2 ? " AND usuario_espacio_trabajo.usuario_id = ?" : "";
    const filterJoin =
      req.body.rol == 2
        ? " INNER JOIN usuario_espacio_trabajo ON cet.workspace_id = usuario_espacio_trabajo.espacio_trabajo_id"
        : "";

    // Consulta a vista de BD [compilacion_espacio_trabajo] por el id de empresa
    dbBI.query(
      `SELECT cet.*
      FROM bi.compilacion_espacio_trabajo cet
        ${filterJoin}
        WHERE workspace_status = 1
        AND business_id = ?
        ${filter}`,
      data,
      (err, result) => {
        try {
          if (err) throw err;
          //Se recorre el resultado para generarlo de forma estructurado
          const workspace = result.reduce((accum, current) => {
            //se inicializa el objeto
            if (!accum[current.workspace_id]) {
              accum[current.workspace_id] = {};
            }
            //se inicializa el array
            if (accum[current.workspace_id].items === undefined) {
              accum[current.workspace_id].items = new Array();
            }

            // Acumulador de los items creados en cada llamada del reduce
            const workSpaceItems = [
              ...accum[current.workspace_id].items,
              {
                fieldCDK:
                  current.item_type === "chart"
                    ? JSON.parse(current.item_dataset)
                    : null,
                config: JSON.parse(current.item_config_grid),
                type: current.item_type,
                table:
                  current.item_type === "table"
                    ? { name: current.item_name, tableID: current.id_item }
                    : null,
                icon:
                  current.item_type === "icon" ? { id: current.id_item } : null,
                  id: current.id_item
              }
            ];
            //Se agrupan los datos correspondientes a un espacio de trabajo
            const workSpace = {
              name: current.workspace_name,
              items: workSpaceItems,
              description: current.workspace_description,
              idWorkSpace: current.workspace_id
            };
            accum[current.workspace_id] = workSpace;
            return accum;
          }, {});
          res.send({
            success: true,
            espacios_trabajo: Object.values(workspace) // se retorna el objeto con solo los valores como un array
          });
        } catch (error) {
          res.send({
            success: false,
            error: error
          });
        }
      }
    );
  } catch (error) {
    res.send({
      success: false,
      error: error
    });
  }
};

// guardar espacios de trabajo
EspacioTrabajoController.guardarEspacioTrabajo = (req, res) => {
  let dataset_graficas = req.body.dataset_graficas;
  let nombre = req.body.nombre;
  let fech_creacion = Moment().format("YYYY-MM-DD HH:mm:ss");
  let esquema_id = req.body.esquema_id;
  let estado = 1;
  let descripcion = req.body.descripcion;

  let data = [
    nombre,
    fech_creacion,
    esquema_id,
    estado,
    dataset_graficas,
    descripcion
  ];

  dbBI.query(
    `INSERT INTO espacio_trabajo (nombre, fech_creacion, esquema_id, estado, dataset_graficas, descripcion)  VALUES( ? )`,
    [data],
    (err, result) => {
      if (err) throw err;
      res.json({
        success: true,
        result: result
      });
    }
  );
};

EspacioTrabajoController.saveChangesWorkSpace = (req, res) => {
  try {
    const { idWorkSpace, name, items, description } = req.body;
    dbBI.query(
      `UPDATE bi.espacio_trabajo SET nombre=?, descripcion=? where id=?`,
      [name, description, idWorkSpace],
      (error, results, fields) => {
        try {
          if (!error) {
            dbBI.query(
              `DELETE FROM items_espacio_trabajo WHERE espacio_trabajo_id = ${idWorkSpace}`,
              null,
              (err, result) => {
                try {
                  if (err) {
                    res.send({ success: false, message: err });
                  } else {
                    buildValueInsertItems(res, items, idWorkSpace);
                  }
                } catch (error) {
                  res.send({
                    success: false,
                    error: error
                  });
                }
              }
            );
          }
        } catch (error) {
          res.send({
            success: false,
            error: error
          });
        }
      }
    );
  } catch (error) {
    res.json({
      success: false,
      error: error
    });
  }
};

const buildValueInsertItems = (res, items, workSpaceID) => {
  try {
    // Construye la estructura paa el query de los valores a insertar en items_espacio_trabajo
    const values = items
      .reduce((accum, current) => {
        return (accum += ` ( ${workSpaceID},
      ${current.fieldCDK},
      '${JSON.stringify(current.config)}',
      '${current.type}'
      ),`);
      }, "")
      .slice(1, -1);
    dbBI.query(
      `INSERT INTO items_espacio_trabajo(espacio_trabajo_id, item_id, config_grid_item, type) VALUES ${values}`,
      (err, subResult) => {
        try {
          if (err) {
            res.send({ success: false, message: err });
          } else {
            res.send({ success: true, message: subResult });
          }
        } catch (error) {
          res.send({ success: false, message: error });
        }
      }
    );
  } catch (err) {
    res.send({ success: false, message: err });
  }
};

// guardar espacios de trabajo
EspacioTrabajoController.saveWorkSpace = (req, res) => {
  try {
    let nombre = req.body.name;
    let fech_creacion = Moment().format("YYYY-MM-DD HH:mm:ss");
    let esquema_id = req.body.idSchema;
    let estado = 1;
    let descripcion = req.body.description;

    let data = [nombre, fech_creacion, esquema_id, estado, descripcion];

    dbBI.query(
      `INSERT INTO espacio_trabajo (nombre, fech_creacion, empresa_id, estado, descripcion)  VALUES (?)`,
      [data],
      (err, result) => {
        try {
          if (err) {
            res.send({ success: false, message: err });
          } else {
            // Construye la estructura de los valores a insertar en items_espacio_trabajo
            if (req.body.items.length > 0) {
              buildValueInsertItems(res, req.body.items, result.insertId);
            } else {
              res.send({ success: true, message: result });
            }
          }
        } catch (error) {
          res.send({ success: false, message: error });
        }
      }
    );
  } catch (error) {
    res.send({
      success: false,
      result: error
    });
  }
};

// editar espacios de trabajo
EspacioTrabajoController.editarEspacioTrabajo = (req, res) => {
  let id = req.body.id;
  let dataset_graficas = req.body.dataset_graficas;
  let nombre = req.body.nombre;
  let fech_creacion = Moment().format("YYYY-MM-DD HH:mm:ss");
  let esquema_id = req.body.esquema_id;
  let estado = 1;
  let descripcion = req.body.descripcion;

  dbBI.query(
    `UPDATE espacio_trabajo SET nombre ='${nombre}' , fech_creacion='${fech_creacion}', esquema_id ='${esquema_id}' , estado ='${estado}' , dataset_graficas='${dataset_graficas}' , descripcion='${descripcion}' WHERE id='${id}'`,
    (err, result) => {
      if (err) throw err;
      res.json({
        success: true,
        result: result
      });
    }
  );
};

EspacioTrabajoController.removeWorkSpaceItem = (req, res) => {
  const { graphId, WorkSpaceId } = req.body;

  dbBI.query(
    `DELETE FROM items_espacio_trabajo WHERE espacio_trabajo_id = ${WorkSpaceId} AND item_id = ${graphId} `,
    (err, result) => {
      if (err) throw err;
      res.json({
        success: true
      });
    }
  );
};
module.exports = EspacioTrabajoController;
