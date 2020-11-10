var express = require('express');
const uuid = require('uuid/v4')
var passport = require('passport');


var router = express.Router();
var mysql = require('mysql');
var controller = require('../controllers/HomeController');
var usuarioController = require('../controllers/UsuarioController');
var planController = require('../controllers/PlanController');
var EmpresaController = require('../controllers/EmpresaController');




router.get('/api/:table', controller.index);

// Pagina login para el BI
router.get('/', (req, res, next) => {
    const uniqueId = uuid()
    res.send(`<b>Pagina de inicio de login para el BI: </b>${uniqueId} - ${req.sessionID}`);
});


router.post('/postLogin', (req, res, next) => {

    console.log(config)
    var db = mysql.createConnection(config);
});


// Usuario
router.post('/crearUsuario', usuarioController.crearUsuario);

router.get('/consultarPorId/:usuario_id', usuarioController.consultarPorId);

router.post('/editarUsuario', usuarioController.editarUsuario);

router.post('/desactivarUsuario', usuarioController.desactivarUsuario);

router.post('/asocUsuarioPlan', usuarioController.asocUsuarioPlan);

router.post('/desasocUsuarioPlan', usuarioController.desasocUsuarioPlan);

// @author por Yeison Osorio
// Autenticacion de usuarios
router.post('/auth', passport.authenticate('local'), function(req, res) {
        // autenticacion exitosa
        // res.redirect('/' + req.user.nombre);
        res.json(req.user)
    }
);

// @author por Yeison Osorio
router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });


// Plan
router.post( '/crearPlan',  planController.crearPlan);

router.get( '/obtenerPlan/:plan_id',  planController.obtenerPlan);


// Empresa 
router.post( '/crearEmpresa',  EmpresaController.crearEmpresa);

router.post( '/obtenerEmpresa',  EmpresaController.obtenerEmpresa);

router.post( '/asocEmpresaUsuario',  EmpresaController.asocEmpresaUsuario);

router.post( '/cambEstadoUsuEmp',  EmpresaController.asocEmpresaUsuario);



module.exports = router;