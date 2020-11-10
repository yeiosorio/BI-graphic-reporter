var mysql = require("mysql");
// cadena de conexion para bd de esquemas de usuario
const configBI = require("../database/conf-mysqlBI");
var dbBI = mysql.createConnection(configBI);
dbBI.connect();


const Moment = require("moment");
const UserDatabaseController = {};

UserDatabaseController.subirArchivo = (req, res, next) => {
  let EDFile = req.files.file;
  EDFile.mv(`./uploads/${EDFile.name}`, err => {
    if (err) {
      return res.status(500).send({
        success: false,
        message: err
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Archivo subido."
      });
    }
  });
};

UserDatabaseController.getNombreFormateado = nombre => {
  try {
    let charBefore = false; //Para controlar si hay 2 espacios seguidos y no agreguen '_' seguidos
    const specialChars = "!@#$^&%*()+=-[]/{}|:<>?,.";

    nombre = nombre
      .trim()
      .toLowerCase()
      .split("")
      .map((elem, key) => {
        if (specialChars.indexOf(elem) !== -1) {
          //Verifica que no sea un caracter especial
          return "";
        }
        if (key === 0) {
          //El primer caracter siempre sera en mayuscula
          return elem.toUpperCase();
        }
        if (!charBefore && elem === " ") {
          //Verifica que sea el primer espacio encontrado
          charBefore = true;
          return "_";
        } else if (elem === " ") {
          return "";
        } //Indica que es un espacio seguido de otro y lo elimina

        charBefore = false; //En este punto quiere decir que ya noi hay mas espacios
        if ("á" === elem) {
          return "a";
        }

        if ("é" === elem) {
          return "e";
        }

        if ("í" === elem) {
          return "i";
        }

        if ("ó" === elem) {
          return "o";
        }

        if ("ú" === elem) {
          return "u";
        }

        if ("ñ" === elem) {
          return "ñ";
        }
        return elem;
      })
      .join("");

    /*

    for (i in nombre) {
      if (nombre[i] == " ") {
        if (i > 0 && nombFormatedo[nombFormatedo.length - 1] != "_") {
          nombFormatedo += "_";
        } else {
          nombFormatedo += "";
        }
      }
      // Si hay letras mayusculas
      else if (nombre[i] == nombre[i].toUpperCase()) {
        if (i > 0 && nombFormatedo[nombFormatedo.length - 1] != "_") {
          nombFormatedo += "_";
        }
        nombFormatedo += nombre[i].toLowerCase();
      } else if ("áéíóú".indexOf(nombre[i]) != -1) {
        if (nombre[i] == " ") {
          console.log("..........");
        }

        if ("á" == nombre[i]) {
          nombFormatedo += "a";
        }

        if ("é" == nombre[i]) {
          nombFormatedo += "e";
        }

        if ("í" == nombre[i]) {
          nombFormatedo += "i";
        }

        if ("ó" == nombre[i]) {
          nombFormatedo += "o";
        }

        if ("ú" == nombre[i]) {
          nombFormatedo += "u";
        }
      } else {
        nombFormatedo += nombre[i];
      }
    }*/
    return nombre;
  } catch (error) {
    console.error("Se genero un error ->", error);
  }
};

// Funcion que crea la tabla donde se guardaran los datos
// que se suben por archivo plano
UserDatabaseController.crearTabla = (req, res, next) => {
  let empresa_id = req.body.empresa_id;
  let usuario_id = req.body.usuario_id;
  let nombre = req.body.nombre;
  var esquema_id = "";
  let data = JSON.parse(req.body.datos);

  let nombreTabla = UserDatabaseController.getNombreFormateado(nombre);

  dbBI.query(
    'INSERT INTO bi.tabla (nomb_tabla, nombre, empresa_id) VALUES("' +
      nombreTabla +
      '", "' +
      nombre +
      '", "' +
      empresa_id +
      '")',
    null,
    (err, result) => {
      try {
        if (!err) {
          // Crea la estructura de la tabla en la base de datos
          UserDatabaseController.crearTablaDB(
            req,
            data,
            nombreTabla,
            "empresa_" + empresa_id
          );

          // homologa los nombres de las columnas del archivo con los nombres de las columnas en el esquema de DB
          /*
          UserDatabaseController.crearHomologacion(
            req,
            data[0],
            nombreTabla,
            "empresa_" + empresa_id
          );*/

          // Inserta los datos en la base de datos
          UserDatabaseController.insertarDatos(
            req,
            res,
            data,
            nombreTabla,
            "empresa_" + empresa_id
          );

          res.send({
            success: true,
            insert_id: result.insertId
          });
        } else {
          res.send({
            success: false,
            message:
              "error insertando informacion de la tabla en `bi`.`tabla`"
          });
        }
      } catch (error) {
        console.log("Ocurrio un error -> ", e.message);
      }
    }
  );
  // Crear el registro de que se ingreso un archivo de datos al bi
  // req.getConnection((err, conn) => {
    /*
  dbBI.query(
    'SELECT empresa.id FROM bi.empresa WHERE empresa_id = "' + empresa_id + '"',
    null,
    (err, result) => {
      try {
        if (!err) {
          esquema_id = result[0].id;

        } else {
          res.send({
            success: false,
            error: "error obteniendo el id del esquema"
          });
        }
      } catch (e) {
        console.log("Ocurrio un error -> ", e.message);
        console.log("datos", result);
        res.send({
          success: false,
          error: "error obteniendo el id del esquema"
        });
      }
    }
  );*/
};

/**
 * Carlos Aguirre 2018-12-13 10:58:15
 * inserta los datos subidos por el archivo
 */
UserDatabaseController.insertarDatos = (
  req,
  res,
  data,
  nombreTabla,
  nombreDB
) => {
  // req.getConnection((err, conn) => {
  dbBI.query(
    `SHOW COLUMNS FROM ${nombreDB}.${nombreTabla};`,
    null,
    (err, result) => {
      console.log(err);
      if (!err) {
        console.log(result);
        let columnas = "";
        for (let i = 1; i < result.length; i++) {
          columnas += result[i].Field + ",";
        }
        columnas = columnas.substr(0, columnas.length - 1);

        /**
         * Se debe validar tambien que la cantidad de datos
         * corresponda con el numero de columnas de la tabla
         * para eso es la condicion ( columnas.split(',').length  == data[i].length  )
         */

        for (
          let i = 1;
          i < Object.keys(data).length &&
          columnas.split(",").length == data[i].length;
          i++
        ) {
          dbBI.query(
            `INSERT INTO ${nombreDB}.${nombreTabla} (${columnas}) VALUE(?)`,
            [data[i]],
            (err, result) => {
              if (err) {
                console.log("error insertando datos");
                console.log(err);
              }
            }
          );
        }
      } else {
        res.send({
          success: false,
          message: err
        });
      }
    }
  );
  // });
};

/**
 * Homologa los nombres de las columnas de los archivos con los nombres
 * de las columnas en la base de datos
 */
UserDatabaseController.crearHomologacion = (
  req,
  data,
  nombreTabla,
  nombreDB
) => {
  let nombHomologado = "";
  console.log("crearHomologacion()");
  for (let i in data) {
    data[i] = UserDatabaseController.checkRepeticionColumna(data[i], data);
    if (data[i] == "id") {
      data[i] += 2;
    }
    //  req.getConnection((err, conn) => {
    nombHomologado = UserDatabaseController.getNombreFormateado(data[i]);
    dbBI.query(
      "INSERT INTO " +
        nombreDB +
        '.headers_tabla (nomb_tabla, nomb_columna_original, nomb_columna_registrado) VALUES("' +
        nombreTabla +
        '", "' +
        data[i] +
        '", "' +
        nombHomologado +
        '")'
    );
    // })
  }
  console.log("crearHomologacion()");
};

/**
 * Crea la tabla que sera usada para añadir los datos por archivo
 */
UserDatabaseController.crearTablaDB = (req, data, nombreTabla, baseDatos) => {
  try {
    let queryTabla = `
        CREATE TABLE IF NOT EXISTS ${nombreTabla}(
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `;
    for (var i in data[1]) {
      data[0][i] = UserDatabaseController.checkRepeticionColumna(
        data[0][i],
        data[0]
      );
      if (data[0][i] == "id") {
        data[0][i] += 2;
      }

      if (isNumeric(data[1][i])) {
        queryTabla +=
          "`" +
          UserDatabaseController.getNombreFormateado(data[0][i]) +
          "` double,\n";
      } else if (
        Moment(data[1][i], [
          "YYYY-MM-DD HH:mm:ss",
          "YYYY-MM-DD",
          "YYYY/MM/DD",
          "YYYY/MM/DD HH:mm:ss"
        ]).isValid()
      ) {
        queryTabla +=
          "`" +
          UserDatabaseController.getNombreFormateado(data[0][i]) +
          "` datetime,\n";
      } else {
        queryTabla +=
          "`" +
          UserDatabaseController.getNombreFormateado(data[0][i]) +
          "` VARCHAR(200),\n";
      }
    }

    queryTabla =
      queryTabla.substr(0, queryTabla.length - 2) +
      ") ENGINE=MyISAM DEFAULT CHARSET=utf8mb4";
    //  req.getConnection((err, conn) => {
    dbBI.query(`use ${baseDatos};`);
    dbBI.query(queryTabla, null, (err, result) => {
      try {
        if (err) {
          // console.log( err ) ;
          // console.log( queryTabla ) ;
        } else {
          // console.log('Tabla creada exitosamente');
        }
      } catch (error) {
        console.error("Se genero un error ->", error);
      }
    });
  } catch (error) {
    console.error("Se genero un error ->", error);
  }

  // });
};

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Carlos Aguirre 2018-11-27 15:24:41
 * Elimina los datos subidos a bi
 */
UserDatabaseController.eliminarTabla = (req, res, next) => {
  let usuario_id = req.body.usuario_id;
  let empresa_id = req.body.empresa_id;
  let nombre = req.body.nombre;
  let nombTabla = UserDatabaseController.getNombreFormateado(nombre);

  // Borra la tabla
  dbBI.query(
    `
        DROP TABLE empresa_${empresa_id}.${nombTabla}
    `,
    (err, conn) => {
      if (err) {
        res.send({
          success: false,
          message: err,
          line: "Error eliminando tabla"
        });
      }
    }
  );

  // Borra los registros de homologacion de los nombres de las columnas
  dbBI.query(
    `
        DELETE FROM empresa_${empresa_id}.headers_tabla WHERE nomb_tabla = '${nombTabla}';
    `,
    (err, conn) => {
      if (err) {
        res.send({
          success: false,
          message: err,
          line: "error eliminando homologacion de nombres"
        });
      }
    }
  );

  // Cambia el estado de la tabla de donde se registran las tablas del esquema a 0
  dbBI.query(
    `
        SELECT 
            tabla.id 
        FROM tabla 
        JOIN esquema 
            ON tabla.esquema_id = esquema.id 
        WHERE esquema.empresa_id = '${empresa_id}' AND tabla.nombre = '${nombre}' LIMIT 1`,
    null,
    (err, result) => {
      if (!err) {
        dbBI.query(
          `UPDATE tabla SET estado = 0, usuario_id='${usuario_id}', fech_modificado = '${Moment().format(
            "YYYY-MM-DD HH:mm:ss"
          )}'  WHERE id = ${result[0].id}`
        );
        res.send({
          success: true,
          message: "tabla borrada"
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

// Obtiene los datos ingresados en una tabla de la db
// a partir de los archivos
UserDatabaseController.getTabla = (req, res, next) => {
  try {
    const empresa_id = req.body.empresa_id;
    const nombre = req.body.nombre; // Nombre de la tabla
    const onlyHeadersInfo = req.body.onlyHeadersInfo;
    let nombreTabla = UserDatabaseController.getNombreFormateado(nombre);

    dbBI.query(
      "SELECT * FROM empresa_" + empresa_id + "." + nombreTabla,
      null,
      (err, result) => {
        try {
          if (err) throw err;

          if(result.length>0){
            if(onlyHeadersInfo){
              res.send({
                success: true,
                headers: Object.keys(result[0])
              })
            }

            const columns = result.map(data => Object.values(data));

            res.send({
              success: true,
              headers: Object.keys(result[0]),
              columns: columns
            })
          }
        } catch (error) {
          res.send({
            success: false,
            message: err
          });
        }
      }
    );
  } catch (error) {}
};

/**
 * Carlos Aguirre 2018-11-29 15:25:59
 * Esta funcion obtiene las tablas actualmente existentes
 * con los datos creados a partir de los arcivos subidos
 */
UserDatabaseController.getTablasPorEmpresa = (req, res, next) => {
  let empresa_id = req.body.empresa_id;
  let inicio = req.body.inicio;
  let limite = req.body.limite;
  let filtro = req.body.filtro;
  //esto se comenta ya que no se usa en este momento
  // LIMIT ${inicio},${limite}
  // AND
  //     tabla.nombre LIKE '%${filtro}%'
  dbBI.query(
    `
    SELECT
        tabla.id as 'tableID',
        tabla.nomb_tabla,
        tabla.nombre as 'nombre'
    FROM bi.tabla
    JOIN bi.empresa
    ON tabla.empresa_id = empresa.id
    WHERE 
        tabla.estado = 1 
        AND 
        empresa.id ='${empresa_id}'
    `,
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

/**
 * Funcion que genera nombres unicos para columnas repetidas
 * ejemplo: si hay dos columnas llamadas cantidad entonces
 * quedaran catidad, cantidad_2 ...
 */
UserDatabaseController.checkRepeticionColumna = (nombre, columnas) => {
  let repeticiones = 0;
  for (let i in columnas) {
    if (nombre == columnas[i]) {
      repeticiones++;
    }
  }

  if (repeticiones == 0) {
    return nombre;
  }
  return nombre + "_" + repeticiones;
};

/**
 * Obtiene el nombre de las columnas
 * de una tabla junto con los tipos de datos que tiene
 */
UserDatabaseController.getColumnasTabla = (req, res) => {
  let data = [
    req.body.nomb_tabla
    // yenifer- no se usa ya que se le envia el nombre real de la tabla
    // UserDatabaseController.getNombreFormateado( req.body.nomb_tabla )
  ];

  dbBI.query(
    `
    DESC empresa_${req.body.empresa_id}.${req.body.nomb_tabla.replace(/ /g, "_")}
    `,
    data,
    (err, result) => {
      if (!err) {
        res.send({
          success: true,
          desc_tabla: result,
          nomb_tabla: UserDatabaseController.getNombreFormateado(
            req.body.nomb_tabla
          )
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

module.exports = UserDatabaseController;
