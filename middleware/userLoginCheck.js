
var mysql   = require("mysql");
var express = require("express");
var md5     = require("MD5");
var jwt     = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config  = require('../config');
//var connection = require("../database"); // get our config file

const configBI = require('../database/conf-mysqlBI');
var dbBI 	   = mysql.createConnection(configBI);
dbBI.connect();


var userLoginCheck = function (req, res) {

	//var em = req.body.email || req.query.email;
	var post = {
		contrasena : req.body.contrasena,
		correo     : req.body.correo
	}

	var query = "SELECT * FROM ?? WHERE ??=? AND ??=? OR ??=?";

	var table = ["usuario", "contrasena", md5(post.contrasena), "correo", post.correo, "nomb_usuario", post.correo];

	query = mysql.format(query, table);

	dbBI.query(query, function (err, rows) {
		if (err) {
			res.json({ "success": false, "message": "Error ejecutando consulta", "error": err });
		}
		else {

			if (rows.length == 1) {
				var token = jwt.sign(rows, config.secret, {
					expiresIn: '1d'
				});
				usuario_id = rows[0].id;
				var data = {
					usuario_id   : rows[0].id,
					device_type  : rows[0].device_type,
					access_token : token,
					device_token : rows[0].device_token,
					ip_address   : rows[0].ip_address
				}
				var query = "INSERT INTO  ?? SET  ?";
				var table = ["access_token"];
				query = mysql.format(query, table);
				dbBI.query(query, data, function (err, rows) {
					if (err) {
						res.json({ "success": true, "message": "error ejecutando consulta" });
					} else {
						res.json({
							success: true,
							message: 'Token generated',
							token: token,
							currUser: usuario_id
						});
					} // return info including token
				});
			}
			else {
				res.json({ "success": false, "message": "Combiancion email/password erronea" });
			}

		}
	});
}

module.exports = userLoginCheck;



// 	User.findOne({ email: em }, function (err, user) {
// 		if (err) {
// 			res.error(err);
// 		} else if (!user) {
// 			// res.json({ success: false, message: 'Authentication failed wrong email' });
// 			res.sendStatus(401);

// 		} else if (user) {
// 			// check if password matches
// 			if (!bcrypt.compareSync(req.body.password, user.password)) {
// 				// res.json({ success: false, message: 'Wrong password' })
// 				res.sendStatus(401);
// 			} else {
// 				// create token
// 				var token = jwt.sign(user, config.secret, {
// 					expiresInMinutes: 1440
// 				});
// 				// return info including token
// 				res.json({
// 					success: true,
// 					message: 'Token generated',
// 					token: token,
// 					currUser: user._id
// 				});
// 			}
// 		}
// 	});
// }
