var mysql = require("mysql");
// cadena de conexion para bd de esquemas de usuario
//const config = require("../database/conf-mysql");
const config = require('../database/conf-mysqlBI');

var db = mysql.createConnection(config);
db.connect(); // abrir conexion a la base de datos
const Moment = require("moment");

const controller = {};

// consulta por los campos de la tabla para la grafica requerida por el usuario
controller.camposTabla = (req, res) => {
  //  db.connect(); // abrir conexion a la base de datos
  // var SQL = "SELECT * FROM " + req.params.table + " LIMIT 1";
  var SQL =
    "SELECT COLUMN_NAME COLUMNAS, DATA_TYPE TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" +
    req.params.table +
    "' AND TABLE_SCHEMA = '" +
    req.params.schema +
    "'";
  console.log("EL CLIENTE ESTA CONSULTANDO LOS CAMPOS DE ...");
  console.log(SQL);
  db.query(SQL, (err, result) => {
    try {
      if (err) throw err;
      db.end(); // cerrar la conexion a la base de datos
      res.json(result);
    } catch (error) {
      console.error("Ocurrio un error ->", error);
    }
  });
};

// consulta por la informacion de la grafica requerida por el usuario, tipo 1 cuando x es real y y tiene operacion
controller.infoGraph = (req, res) => {
  // var operacion = req.params.operacion;
  // if (operacion == 'day') {
  //     tipoConsulta = 2;
  //     req.params.campoY = "DATE_FORMAT(" + req.params.campoY + ", '%a')";
  // }
  // // dias del mes
  // if (operacion == 'dayM') {
  //     tipoConsulta = 2;
  //     req.params.campoY = "DATE_FORMAT(" + req.params.campoY + ", '%d')";

  // }
  // // mes
  // if (operacion == 'month') {
  //     tipoConsulta = 2;
  //     req.params.campoY = "DATE_FORMAT(" + req.params.campoY + ", '%M')";
  // }
  // // año
  // if (operacion == 'year') {
  //     tipoConsulta = 2;
  //     req.params.campoY = "DATE_FORMAT(" + req.params.campoY + ", '%Y')";
  // }
  try {
    var SQL =
      "SELECT  " +
      req.params.campoX +
      " AS campoX," +
      req.params.campoY +
      " AS  campoY FROM " +
      req.params.esquema +
      "." +
      req.params.table +
      " GROUP BY " +
      req.params.campoX +
      " ORDER BY " +
      req.params.campoX +
      " LIMIT 40000";
    console.log("EL CLIENTE ESTA CONSULTANDO LOS CAMPOS DE ...");
    console.log(SQL);
    // req.getConnection((err, conn) => {
    db.query(SQL, (err, result) => {
      try {
        if (err) throw err;
        // db.end(); // cerrar la conexion a la base de datos
        res.json(result);
      } catch (error) {
        console.error("Ocurrio un error ->", error);
      }
    });
    // });
  } catch (error) {}
};

// consulta por la informacion de la grafica requerida por el usuario, tipo 2 cuando x tiene operacion y x es real
controller.infoGraph2 = (req, res) => {
  // var operacion = req.params.operacion;
  // if (operacion == 'day') {
  //     tipoConsulta = 2;
  //     this.campoY = "DATE_FORMAT(" + req.params.campoY + ", '%a')";
  // }
  // // dias del mes
  // if (operacion == 'dayM') {
  //     tipoConsulta = 2;
  //     this.campoY = "DATE_FORMAT(" + req.params.campoY + ", '%d')";

  // }
  // // mes
  // if (operacion == 'month') {
  //     tipoConsulta = 2;
  //     this.campoY = "DATE_FORMAT(" + req.params.campoY + ", '%M')";
  // }
  // // año
  // if (operacion == 'year') {
  //     tipoConsulta = 2;
  //     this.campoY = "DATE_FORMAT(" + req.params.campoY + ", '%Y')";
  // }
  try {
    var SQL =
      "SELECT  " +
      req.params.campoX +
      " AS campoX," +
      req.params.campoY +
      " AS  campoY FROM " +
      req.params.esquema +
      "." +
      req.params.table +
      " GROUP BY " +
      req.params.campoY +
      " ORDER BY " +
      req.params.campoY +
      " LIMIT 40000";
    console.log("EL CLIENTE ESTA CONSULTANDO LOS CAMPOS DE ...");
    console.log(SQL);
    // req.getConnection((err, conn) => {
    db.query(SQL, (err, result) => {
      try {
        if (err) throw err;
        // db.end(); // cerrar la conexion a la base de datos
        res.json(result);
      } catch (error) {
        console.error("Ocurrio un error ->", error);
      }
    });
  } catch (error) {
    console.error("Ocurrio un error ->", error);
  }

  // });
};
// consulta por la informacion de la grafica requerida por el usuario, tipo 3 cuando x es real y x es real o si ambos con operacion
controller.infoGraph3 = (req, res) => {
  // var operacion = req.params.operacion;
  // var campoy = req.params.campoY;

  // if (operacion == 'day') {
  //     tipoConsulta = 2;
  //     campoy = "DATE_FORMAT(" + campoy + ", '%a')";
  // }
  // // dias del mes
  // if (operacion == 'dayM') {
  //     tipoConsulta = 2;
  //     campoy = "DATE_FORMAT(" + campoy + ", '%d')";

  // }
  // // mes
  // if (operacion == 'month') {
  //     tipoConsulta = 2;
  //     campoy = "DATE_FORMAT(" + campoy + ", '%M')";
  // }
  // // año
  // if (operacion == 'year') {
  //     tipoConsulta = 2;
  //     campoy = "DATE_FORMAT(" + campoy + ", '%Y')";
  // }
  try {
    var SQL =
      "SELECT  " +
      req.params.campoX +
      " AS campoX," +
      req.params.campoX +
      " AS  campoY FROM " +
      req.params.esquema +
      "." +
      req.params.table +
      " ORDER BY " +
      req.params.campoX +
      " LIMIT 40000";
    console.log("EL CLIENTE ESTA CONSULTANDO LOS CAMPOS DE ...");
    console.log(SQL);
    // req.getConnection((err, conn) => {
    db.query(SQL, (err, result) => {
      try {
        if (err) throw err;
        // db.end(); // cerrar la conexion a la base de datos
        res.json(result);
      } catch (error) {
        console.error("Ocurrio un error ->", e);
      }
    });
  } catch (e) {
    console.error("Ocurrio un error ->", e);
  }

  // });
};

// consulta por la informacion de la grafica  agrupada requerida por el usuario
controller.infoGraphGroup = (req, res) => {
  try {
    //  db.connect(); // abrir conexion a la base de datos
    var tipoAgrupamiento = req.params.tipoAgrupar;
    var agrupar = req.params.campoAgrupar;
    // dias de la semana
    if (tipoAgrupamiento == "DAY") {
      var campoAgrupar = "DATE_FORMAT(" + agrupar + ", '%a')";
    }
    // dias del mes
    if (tipoAgrupamiento == "DAYM") {
      var campoAgrupar = "DATE_FORMAT(" + agrupar + ", '%d')";
    }
    // mes
    if (tipoAgrupamiento == "MONTH") {
      var campoAgrupar = "DATE_FORMAT(" + agrupar + ", '%M')";
    }
    // año
    if (tipoAgrupamiento == "YEAR") {
      var campoAgrupar = "DATE_FORMAT(" + agrupar + ", '%Y')";
    }
    var SQL =
      "SELECT " +
      campoAgrupar +
      ", " +
      req.params.campoX +
      " AS campoX, " +
      req.params.operacion +
      "(" +
      req.params.campoY +
      ") AS  campoY FROM " +
      req.params.table +
      " GROUP BY " +
      campoAgrupar +
      "," +
      req.params.campoX +
      " ORDER BY " +
      campoAgrupar +
      " LIMIT 40000";
    console.log("EL CLIENTE ESTA CONSULTANDO LOS CAMPOS DE ...");
    console.log(SQL);
    //   req.getConnection((err, conn) => {
    db.query(SQL, (err, result) => {
      try {
        if (err) throw err;
        // db.end(); // cerrar la conexion a la base de datos
        res.json(result);
      } catch (error) {
        console.error("Ocurrió un error ->", error);
      }
    });
  } catch (error) {
    console.error("Ocurrió un error ->", error);
  }

  //  });
};
// guarda la grafica que el usuario crea o genra
controller.guardarDatosGrafica = (req, res) => {
  try {
    // db.connect(); // abrir conexion a la base de datos
    let nombre = req.body.nameGraph;
    let dataset = req.body.dataset;
    let fecha_creacion = Moment().format("YYYY-MM-DD HH:mm:ss");
    let data = [nombre, fecha_creacion, 1, dataset];
    //  req.getConnection((err, conn) => {
    db.query(
      `INSERT INTO grafico (nombre, fech_creacion, tabla_id, dataset)  VALUES( ? )`,
      [data],
      (err, result) => {
        try {
          if (err) throw err;
          //  db.end(); // cerrar la conexion a la base de datos
          res.json({
            success: true
          });
        } catch (error) {
          console.error("Ocurrió un error ->", error);
        }
      }
    );
  } catch (error) {
    console.error("Ocurrió un error ->", error);
  }

  // });
};

controller.getInfoGraph = (req, res) => {
  try{
    db.query('', (error, result)=>{
      try{

      } catch(error){
        
      }
    })
  } catch (error) {
    console.error("Ocurrió un error ->", error);
  }
}

module.exports = controller;
