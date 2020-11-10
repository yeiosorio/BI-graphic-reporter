// get our mongoose model
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get our config file

/**
 * This api is use to verify token for each request,
 * when client requests with a token this API decodes that match with existing token  and send with 
 * decoded object.
 * We set currUser i.e. current user to req object so we can access somewhere else.
 * 
 */

var CheckAuthController = {};
CheckAuthController.checkAuth = (req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['token'];
    if (token) {
        // verify secret and checks exp
        jwt.verify(token, config.secret, function(err, currUser) {
            if (err) {
                res.send({
                    success: false,
                    error: err
                });
            } else {
                res.send({
                    success: true,
                    message: 'usuario loggeado'
                });
            }
        });
    } else {
        // send not found error
        //res.send(401, " ");
        res.status(401).send({
            success: false,
            message: "No está loggeado en el sistema"
        });
    }
};
module.exports = CheckAuthController;