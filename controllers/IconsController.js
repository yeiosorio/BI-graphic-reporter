var mysql = require("mysql");

// cadena de conexion para bd de esquemas de usuario
const configBI = require("../database/conf-mysqlBI");
var dbBI = mysql.createConnection(configBI);
dbBI.connect();

const Moment = require("moment");

const IconsController = {};

IconsController.getIcons = (req, res) => {
  try {

    const query = `SELECT 
    ic.id, ic.nombre as name, ic.descripcion as description, ic.text_value as textValue, ic.empresa_id as businessID, ic.eje_value as field, ic.solo_texto as onlyText, 
    im.id as imgID, im.url as imgUrl
    FROM bi.iconos ic left join imagenes im on ic.imagen_id = im.id where ic.empresa_id = ${req.params.schema_id}`
    dbBI.query(query, (err, result) => {
      try {
        if (err) throw err;

        const icons = result.reduce((accum, current) => {
            const icon = {
                id: current.id,
                name: current.name,
                description: current.description,
                textValue: current.textValue,
                businessID: current.businessID,
                field: JSON.parse(current.field),
                image: {id:current.imgID, url: current.imgUrl},
                onlyText: current.onlyText
            };
            return [...accum, icon];
        }, []);

        res.send({
          success: true,
          result: icons
        });
      } catch (error) {
        res.send({
          success: false,
          result: error
        });
      }
    });
  } catch (error) {
    res.send({
      success: false,
      result: error
    });
  }
};


IconsController.getIconID = (req, res) => {
  try {

    const query = `SELECT 
    ic.id, ic.nombre as name, ic.descripcion as description, ic.text_value as textValue, ic.empresa_id as businessID, ic.eje_value as field, ic.solo_texto as onlyText, 
    im.id as imgID, im.url as imgUrl
    FROM bi.iconos ic left join imagenes im on ic.imagen_id = im.id where ic.empresa_id = ${req.params.schema_id} and ic.id=${req.params.icon_id}`
    dbBI.query(query, (err, result) => {
      try {
        if (err) throw err;

        const icons = result.reduce((accum, current) => {
            const icon = {
                id: current.id,
                name: current.name,
                description: current.description,
                textValue: current.textValue,
                businessID: current.businessID,
                field: JSON.parse(current.field),
                image: {id:current.imgID, url: current.imgUrl},
                onlyText: current.onlyText
            };
            return [...accum, icon];
        }, []);

        res.send({
          success: true,
          result: icons
        });
      } catch (error) {
        res.send({
          success: false,
          result: error
        });
      }
    });
  } catch (error) {
    res.send({
      success: false,
      result: error
    });
  }
};

IconsController.getImages = (req, res) => {
  try {
    dbBI.query(`select * from imagenes`, (err, result) => {
      try {
        if (err) throw err;
        res.send({
          success: true,
          result: result
        });
      } catch (error) {
        res.send({
          success: false,
          result: error
        });
      }
    });
  } catch (error) {
    res.send({
      success: false,
      result: error
    });
  }
};

IconsController.doCalculateField = (req, res) => {
  try {
    const sqlQuery = `select ${req.body.field.operacion}(${
      req.body.field.nombre
    }) from ${req.body.schema.schemaName}.${req.body.table}`;
    console.log(sqlQuery);
    dbBI.query(sqlQuery, (err, result) => {
      console.log(err, result);
      if (err) throw err;
      res.send({
        success: true,
        result: result.map(item => Object.values(item))[0]
      });
    });
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      result: error
    });
  }
};

IconsController.saveIcon = (req, res) => {
  try {
    const icon = req.body;
    const sqlQuery = `insert into bi.iconos (nombre, imagen_id, descripcion, text_value, empresa_id, eje_value, SOLO_TEXTO) values ( ? )`;
    const values = [
      icon.name,
      icon.onlyText ? null : icon.image.id,
      icon.description,
      icon.textValue,
      icon.businessID,
      JSON.stringify(icon.field),
      icon.onlyText
    ];
    //const values = Object.values(req.body.icon);
    dbBI.query(sqlQuery, [values], (err, result) => {
      if (err) throw err;
      res.send({
        success: true,
        result: result
      });
    });
  } catch (error) {
    res.send({
      success: false,
      result: error
    });
  }
};

module.exports = IconsController;
