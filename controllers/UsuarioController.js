var md5 = require("md5");
var mysql = require("mysql");
// cadena de conexion para bd de esquemas de usuario
const configBI = require("../database/conf-mysqlBI");
var dbBI = mysql.createConnection(configBI);
dbBI.connect();

const UsuarioController = {};
const Moment = require("moment");

// Funcion para insertar un usuario en la base de datos
UsuarioController.crearUsuario = (req, res, next) => {
  let salt = bcrypt.genSaltSync(10);
  let usuario = [
    req.body.rol_id,
    req.body.nomb_usuario,
    md5(req.body.contrasena),
    req.body.nombre,
    req.body.apellido,
    req.body.correo,
    req.body.identificacion,
    req.body.observacion,
    1
  ];
  dbBI.query(
    `INSERT INTO usuario (rol_id,nomb_usuario,contrasena,nombre,apellido,correo,identificacion,observacion,estado)  VALUES( ? )`,
    [usuario],
    (err, rows) => {
      if (err) {
        res.send(err);
      } else {
        res.send({
          success: true,
          message: "usuario creado",
          usuario_id: rows.insertId
        });
      }
    }
  );

  //  });
};

// Obtiene la informacion de un usuario a partir del id
UsuarioController.consultarPorId = (req, res, next) => {
  let usuarioId = req.params.usuario_id;

  //  req.getConnection((err, conn)=>{
  dbBI.query(
    `SELECT id, nomb_usuario as userName, concat(nombre, ' ', apellido) as fullName, identificacion as identification, rol, tutorial FROM usuario WHERE usuario.id =${usuarioId}`,
    (err, rows) => {
      try {
        res.send(rows);
      } catch (error) {
        res.send(error);
      }
    }
  );
  //  });
};

// Edita los campos de la tabla users para un id especificado
UsuarioController.editarUsuario = (req, res, next) => {
  let usuario_id = req.body.usuario_id;
  let usuario = [
    req.body.rol_id,
    req.body.nomb_usuario,
    md5(req.body.contrasena),
    req.body.nombre,
    req.body.apellido,
    req.body.correo,
    req.body.identificacion,
    req.body.observacion,
    Moment().format("YYYY-MM-DD HH:mm:ss"),
    1
  ];
  // req.getConnection((err, conn)=>{

  dbBI.query(
    `UPDATE usuario 
                    SET rol_id='${usuario[0]}', nomb_usuario='${usuario[1]}',
                    contrasena='${usuario[2]}', nombre='${usuario[3]}',
                    apellido='${usuario[4]}', correo='${usuario[5]}',
                    identificacion='${usuario[6]}', observacion='${
      usuario[7]
    }', modified_date = '${usuario[8]}' WHERE id = '${usuario_id}'`,
    [],
    (err, rows) => {
      if (err) {
        res.send(err);
      } else {
        res.send(
          JSON.stringify({
            success: true,
            message: "usuario editado"
          })
        );
      }
    }
  );
  // });
};

// Activa o desactiva un usuario dependiendo del estado actual
// si esta activado lo desactiva y viceversa
UsuarioController.desactivarUsuario = (req, res, next) => {
  let usuarioId = req.body.usuario_id;
  console.log(`SELECT * FROM usuario WHERE usuario.id =${usuarioId}`);
  // req.getConnection((err, conn)=>{
  dbBI.query(
    `SELECT estado FROM usuario WHERE usuario.id =${usuarioId}`,
    [],
    (err, rows) => {
      if (rows[0].estado == 1) {
        dbBI.query(
          `UPDATE usuario SET estado = 0 WHERE id = ${usuarioId}`,
          [],
          (err, conn) => {
            res.send({
              success: true,
              message: "Desactivado"
            });
          }
        );
      } else {
        dbBI.query(
          `UPDATE usuario SET estado = 1 WHERE id = ${usuarioId}`,
          [],
          (err, conn) => {
            res.send({
              success: true,
              message: "Activado"
            });
          }
        );
      }
    }
  );
  //  });
};

// Obtiene la informacion de un usuario a partir del id
UsuarioController.asocUsuarioPlan = (req, res, next) => {
  let usuarioId = req.body.usuario_id;
  let planId = req.body.plan_id;
  let fechIni = req.body.fech_ini;
  let fechFin = req.body.fech_fin;

  dbBI.query(
    `SELECT * FROM plan WHERE plan.id = ${planId}`,
    null,
    (err, rows) => {
      if (!err) {
        let asociacion = [
          usuarioId, // usuario_id
          planId, // plan_id
          rows[0].cant_usuarios, // cant_usuarios
          rows[0].cant_graficos, // cant_graficos
          fechIni, // fech_ini
          fechFin, // fech_fin
          Moment().format("YYYY-MM-DD HH:mm:ss"),
          1
        ];

        // Verifica que el usuario no tenga un plan asociado
        dbBI.query(
          `SELECT * FROM usuario_plan WHERE usuario_id = '${usuarioId}' AND plan_id = '${planId}' AND estado = 1 GROUP BY usuario_plan.id`,
          null,
          (err, result) => {
            if (!err) {
              if (result.length == 0) {
                dbBI.query(
                  `INSERT INTO usuario_plan ( usuario_id, plan_id, cant_usuarios, cant_graficos, fech_ini, fech_fin, fech_creacion, estado ) VALUES (?)`,
                  [asociacion],
                  (err, rows) => {
                    if (!err) {
                      res.send({
                        success: true,
                        message: "Plan y usuario asociados"
                      });
                    }
                  }
                );
              } else {
                res.send({
                  success: false,
                  message: "Este usuario ya posee un plan asociado"
                });
              }
            } else {
              res.send({
                success: false
              });
            }
          }
        );
      } else {
        res.send({
          success: false,
          error: err
        });
      }
    }
  );
};

// Des asocia un usuario y un plan
UsuarioController.desasocUsuarioPlan = (req, res, next) => {
  let usuarioId = req.body.usuario_id;
  let planId = req.body.plan_id;

  dbBI.query(
    "UPDATE usuario_plan SET estado = 0 WHERE usuario_id = " +
      usuarioId +
      " AND plan_id = " +
      planId,
    (err, rows) => {
      if (err) {
        res.send({
          success: false,
          message: err
        });
      } else {
        res.send({
          success: true,
          message: "Plan desasociado"
        });
      }
    }
  );
};

/**
 * Carlos Aguirre 2018-11-29 16:05:26
 * Obtiene un listado de usuarios filtrado
 * ya sea por nombre, identificacion ó nombre de usuarios
 */
UsuarioController.getListadoUsuarios = (req, res, next) => {
  let inicio = req.body.inicio;
  let limite = req.body.limite;
  let filtro = req.body.filtro;

  dbBI.query(
    ` SELECT * FROM usuario
    WHERE CONCAT( usuario.nomb_usuario, ' ', usuario.nombre, ' ', usuario.apellido, ' ', usuario.identificacion, ' ', usuario.nomb_usuario ) LIKE '%${filtro}%'
    LIMIT ${inicio},${limite} `,
    null,
    (err, result) => {
      if (!err) {
        res.send(result);
      } else {
        res.send({
          success: false,
          message: err
        });
      }
    }
  );
};

//Obtiene los usuarios asignados y no asignados al espaco de trabajo
UsuarioController.getWorkspaceUsers = (req, res, next) => {
  //consulta los usuarios asignados al espacio de trabajo
  dbBI.query(
    `select uet.usuario_id from bi.usuario_espacio_trabajo uet where uet.espacio_trabajo_id = ${
      req.params.workspace_id
    }`,
    null,
    (err, result) => {
      try {
        if (!err) {
          dbBI.query(
            `select u.id, u.nomb_usuario as userName from bi.usuario u`,
            null,
            (subErr, subResult) => {
              try {
                if (!subErr) {
                  // Se convierte el arreglo de objetos con el id a un solo arreglo de ids
                  const ids = result.reduce((accum, current) => {
                    return [...accum, current.usuario_id];
                  }, []);
                  // se valida si el id del usuario esta relacionado al espacio de trabajo
                  const response = subResult.map(item => {
                    item.checked = ids.indexOf(item.id) !== -1 ? 1 : 0;
                    return item;
                  });
                  res.send({
                    success: true,
                    res: response
                  });
                } else {
                  res.send({
                    success: false,
                    message: subErr
                  });
                }
              } catch (error) {
                res.send({
                  success: false,
                  message: error
                });
              }
            }
          );
        } else {
          res.send({
            success: false,
            message: err
          });
        }
      } catch (error) {
        res.send({
          success: false,
          message: error
        });
      }
    }
  );
};

UsuarioController.assignUsersToWorkSpace = (req, res, next) => {
  const { idWorkSpace, users } = req.body;
  dbBI.query(
    `delete from bi.usuario_espacio_trabajo where espacio_trabajo_id = ${idWorkSpace}`,
    null,
    (err, result) => {
      try {
        if (!err) {
          const values = users
            .reduce((accum, current) => {
              return (accum += ` (${current.id}, ${idWorkSpace}),`);
            }, "")
            .slice(1, -1);
          dbBI.query(
            `INSERT into bi.usuario_espacio_trabajo(usuario_id, espacio_trabajo_id) VALUES ${values} `,
            null,
            (errInsert, resultInsert) => {
              try {
                if (!errInsert) {
                  res.send({
                    success: true,
                    res: resultInsert
                  });
                } else {
                  res.send({
                    success: false,
                    res: errInsert
                  });
                }
              } catch (error) {
                res.send({
                  success: false,
                  res: error
                });
              }
            }
          );
        } else {
          res.send({
            success: false,
            res: err
          });
        }
      } catch (error) {
        res.send({
          success: false,
          res: error
        });
      }
    }
  );
};

/**
 * Carlos Aguirre 2018-12-05 15:31:24
 * Obtiene un listado de los planes activos por usuario
 */
UsuarioController.getPlanesUsuario = (req, res, next) => {
  let usuario_id = req.body.usuario_id;
  dbBI.query(
    `SELECT 
            plan.id as 'plan_id',
            usuario_plan.cant_usuarios as 'cant_usuarios',
            usuario_plan.cant_graficos as 'cant_graficos',
            usuario_plan.fech_ini as 'fech_ini',
            usuario_plan.fech_fin as 'fech_fin'
        FROM usuario_plan
        JOIN plan ON usuario_plan.plan_id = plan.id
        WHERE usuario_plan.estado =1 AND usuario_id='${usuario_id}'`,
    null,
    (err, result) => {
      if (!err) {
        res.send({
          success: true,
          planes: result
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
 * Carlos Aguirre 2018-12-05 15:40:25
 * Obtiene un listado de las empresas que tiene asociadas
 * un usuario dentro del bi
 */
UsuarioController.getEmpresasPorUsuarioId = (req, res, next) => {
  let usuario_id = req.body.usuario_id;

  dbBI.query(
    `SELECT 
    bs.id,
    bs.nombre as name,
    bs.descripcion as description,
    bs.fech_creacion as creationDate,
    bs.nombre_esquema as schemaName
        FROM bi.empresa bs
        JOIN bi.usuario_empresa userbs ON userbs.empresa_id = bs.id
        WHERE  userbs.usuario_id='${usuario_id}' and bs.estado=1`,
    null,
    (err, result) => {
      if (!err) {
        res.send({
          success: true,
          empresas: result
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
 * Carlos Felipe Aguirre 2018-12-13 15:55:29
 * Obtiene todos los departamentos en la base de datos
 */
UsuarioController.getDepartamentos = (req, res) => {
  dbBI.query(
    `
    SELECT
        *
    FROM departamento
    `,
    null,
    (err, result) => {
      res.send({
        success: true,
        departamentos: result
      });
    }
  );
};

/**
 * Carlos Felipe Aguirre
 * Obtiene las ciudades que hay dentro de un departamentos
 */
UsuarioController.getCiudadPorDepartamento = (req, res) => {
  let departamento_id = req.params.departamento_id;

  dbBI.query(
    `
    SELECT
        *
    FROM municipios WHERE departamento_id = ${departamento_id}
    `,
    null,
    (err, result) => {
      res.send({
        success: true,
        ciudades: result
      });
    }
  );
};

/**
 * Carlos Felipe Aguirre 2018-12-13 16:13:07
 * Establece el estado de un tutorial, si ya
 * esta completado debe ser  = 1
 *
 */
UsuarioController.setEstadoTurorial = (req, res) => {
  let data = [req.body.estado_tuto_id, req.body.usuario_id];

  dbBI.query(
    `
    UPDATE usuario SET tutorial = ? WHERE usuario.id = ?
    `,
    data,
    (err, result) => {
      res.send({
        success: true,
        message: "registro modificado"
      });
    }
  );
};

module.exports = UsuarioController;
