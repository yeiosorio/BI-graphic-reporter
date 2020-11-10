//import queryStatement  from './prototypes/querysPrototypes';
const { queryStatement } = require("./prototypes/querysPrototypes");
var mysql = require("mysql");

// cadena de conexion para bd de esquemas de usuario
const configBI = require("../database/conf-mysqlBI");
var dbBI = mysql.createConnection(configBI);
dbBI.connect();

const infoCDCController = {};

// Promesas Reflect envolver una promesa en otra promesa, donde la respuesta se camufla en succes o fail

infoCDCController.getClients = (req, res, next) => {
  try {
    console.log("getClients");
    dbBI.query(
      "select distinct Cliente_id_1 as id, Cliente_1 as clientName from empresa_17.informe_sst"
    ),
      (err, rows) => {
        console.log(rows);
        if (err) {
          res.send({ success: false, result: err });
        } else {
          res.send({ success: true, result: rows });
        }
      };
  } catch (error) {
    res.send({ success: false, result: error });
  }
};

infoCDCController.getTotalInfo = (req, res, next) => {
  const queryPromises = queryStatement.map(obj => queryPromise(obj));
  Promise.all(queryPromises)
    .then(result => {
      //const request = result.reduce((accum, currentValue)=>{return {...accum, [currentValue.name]: currentValue}},{});
      res.send({ success: true, result: result });
    })
    .catch(error => {
      res.send({ success: true, error: error });
    });
};

function queryPromise(obj) {
  return new Promise((resolve, reject) => {
    dbBI.query(obj.query, (err, rows) => {
      if (err) return reject(err);
      const results = rows.reduce((accum, currentValue) => {
        accum.name = obj.name;
        if (accum.labels === undefined) accum.labels = [];
        if (accum.total === undefined) accum.total = [];
        if (currentValue.labels === undefined)
          accum.labels = [...accum.labels, obj.name];
        else accum.labels = [...accum.labels, currentValue.labels];
        accum.total = [
          ...accum.total,
          currentValue.total % 1 !== 0
            ? currentValue.total.toFixed(2)
            : currentValue.total
        ]; //Guarda la cantidad de la fila correspondiente, si tiene decimales, lo limite a 2
        accum.chart = obj.chart;
        accum.typeChart = obj.typeChart;
        accum.column = obj.column;
        return accum;
      }, {});
      resolve(results);
    });
  });
}

module.exports = infoCDCController;
