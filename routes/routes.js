//var AuthMiddleware           = require('.././middleware/auth'); 

var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var InfoGraphController = require('../controllers/HomeController');
var usuarioController = require('../controllers/UsuarioController');
var planController = require('../controllers/PlanController');
var EmpresaController = require('../controllers/EmpresaController');
var UserDatabaseController = require('../controllers/UserDatabaseController');
var GraficoController = require('../controllers/GraficoController');
var EspacioTrabajoController = require('../controllers/EspacioTrabajoController');
var RolController = require('../controllers/RolController');
var EsquemaController = require('../controllers/EsquemaController');
var verifyToken = require('../middleware/verifyToken');
var CheckAuthController = require('../controllers/CheckAuthController');
const infoCDCController = require('../controllers/InfoCDCController');
const IconsController = require('../controllers/IconsController');

// JWT
var findAllUsers = require('../middleware/findAllUsers');
var welcome = require('../middleware/welcome');




// Pagina login para el BI
router.get('/', (req, res, next) => {

    res.send(`
        <html>
            <head>
                <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
                <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body class="w3-indigo" >
                <h1 class="w3-center" style="margin-top:40vh">Página de inicio del <b>BI</b></h1>
            </body>
        </html>
    `);
});
router.post('/postLogin', (req, res, next) => {
    console.log(config)
    var db = mysql.createConnection(config);
});
// Usuario
router.post('/crearUsuario', usuarioController.crearUsuario);

router.get('/consultarPorId/:usuario_id', verifyToken, usuarioController.consultarPorId);

router.post('/editarUsuario', verifyToken, usuarioController.editarUsuario);

router.post('/desactivarUsuario', verifyToken, usuarioController.desactivarUsuario);

router.post('/asocUsuarioPlan', verifyToken, usuarioController.asocUsuarioPlan);

router.post('/desasocUsuarioPlan', verifyToken, usuarioController.desasocUsuarioPlan);

router.post('/getListadoUsuarios', verifyToken, usuarioController.getListadoUsuarios);

router.get('/getWorkspaceUsers/:workspace_id', verifyToken, usuarioController.getWorkspaceUsers);

router.post('/assignUsersToWorkSpace', verifyToken, usuarioController.assignUsersToWorkSpace);

router.post('/crearRol', verifyToken, RolController.crearRol);

router.get('/getRoles', verifyToken, RolController.getRoles);

router.post('/getPlanesUsuario', verifyToken, usuarioController.getPlanesUsuario);

router.post('/getEmpresasPorUsuarioId', verifyToken, usuarioController.getEmpresasPorUsuarioId);

router.get('/getDepartamentos', verifyToken, usuarioController.getDepartamentos);

router.get('/getCiudadPorDepartamento/:departamento_id', verifyToken, usuarioController.getCiudadPorDepartamento);

router.post('/setEstadoTurorial', verifyToken, usuarioController.setEstadoTurorial);

router.post('/checkAuth', CheckAuthController.checkAuth);


//InformesCDCController
router.post('/getTotalInfoCDC', infoCDCController.getTotalInfo);
router.get('/getClientsInfoCDC', infoCDCController.getClients);




// @author por Yeison Osorio
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});


// Plan
router.post('/crearPlan', verifyToken, planController.crearPlan);

router.get('/obtenerPlan/:plan_id', verifyToken, planController.obtenerPlan);

router.get('/getPlanes', verifyToken, planController.getPlanes);



// Empresa 
router.post('/crearEmpresa', verifyToken, EmpresaController.crearEmpresa);

router.post('/obtenerEmpresa', verifyToken, EmpresaController.obtenerEmpresa);

router.post('/asocEmpresaUsuario', verifyToken, EmpresaController.asocEmpresaUsuario);

router.post('/cambEstadoUsuEmp', verifyToken, EmpresaController.cambEstadoUsuEmp);



// Archivo 
router.post('/subirArchivo', verifyToken, UserDatabaseController.subirArchivo);

// DB de los datos
router.post('/crearTabla', verifyToken, UserDatabaseController.crearTabla);

router.post('/eliminarTabla', verifyToken, UserDatabaseController.eliminarTabla);

router.post('/getTabla', verifyToken, UserDatabaseController.getTabla);

router.post('/getTablasPorEmpresa', verifyToken, UserDatabaseController.getTablasPorEmpresa);

router.post('/getColumnasTabla', verifyToken, UserDatabaseController.getColumnasTabla);



// Espacio de Trabajo

// Inserta un nuevo registro en `espacio_trabajo`
router.post('/crearEspacioTrabajo', verifyToken, EspacioTrabajoController.crearEspacioTrabajo);

// Desactiva un espacio de trabajo
router.post('/desactivarEspacioTrabajo', verifyToken, EspacioTrabajoController.desactivarEspacioTrabajo);

router.post('/getEspaciosTrablajoPorUsuario', verifyToken, EspacioTrabajoController.getEspaciosTrablajoPorUsuario);

router.post('/getEspaciosPorEmpresa', verifyToken, EspacioTrabajoController.getEspaciosPorEmpresa);

router.post('/getEspaciosPorEmpresaYUsuario', EspacioTrabajoController.getEspaciosPorEmpresaYUsuario);

router.post('/asocGraficosEspacio', verifyToken, EspacioTrabajoController.asocGraficosEspacio);

router.get('/getGraficosDeEspacio/:espacio_trabajo_id', verifyToken, EspacioTrabajoController.getGraficosDeEspacio);

router.post('/borrarGraficoDeEspacio', verifyToken, EspacioTrabajoController.borrarGraficoDeEspacio);

router.post('/getListaGraficosEmpresa', verifyToken, GraficoController.getListaGraficosEmpresa);

router.post('/editarEspacioTrabajo', verifyToken, EspacioTrabajoController.editarEspacioTrabajo);

// yeison - Se obtienen datos de graficas guardadas
router.get('/api/obtenerDatosGrafica', verifyToken, GraficoController.obtenerDatosGrafica);

// yeison - Guardado de areas de trabajo
router.post('/guardarEspacioTrabajo', verifyToken, EspacioTrabajoController.guardarEspacioTrabajo);
// Eciro - Guardado de espacios de trabajo
router.post('/saveWorkSpace', verifyToken, EspacioTrabajoController.saveWorkSpace);
// Eciro - Guardado de espacios de trabajo
router.post('/saveChangesWorkSpace', verifyToken, EspacioTrabajoController.saveChangesWorkSpace);

// editar de areas de trabajo
router.post('/editarEspacioTrabajo', verifyToken, EspacioTrabajoController.editarEspacioTrabajo);

// Eliminar grafica de espacio de trabajo
router.post('/removeWorkSpaceItem', verifyToken, EspacioTrabajoController.removeWorkSpaceItem);


// ---------solo ruta de graficas ------------------------------------------------------
// grafica - consultas

// ruta para consultar los campos de la tabla y/o informacion completa de la tabla
router.get('/api/:table&:schema', verifyToken, InfoGraphController.camposTabla);
// ruta para consultar la informacion de la tabla para graficar tipo 1, cuando en x es real y en y tiene operacion
router.get('/api/infoGraph/:table&:campoX&:campoY&:esquema', verifyToken, InfoGraphController.infoGraph);
// ruta para consultar la informacion de la tabla para graficar tipo 2, cuando en x es tiene operacion y en y es real
router.get('/api/infoGraph2/:table&:campoX&:campoY&:esquema', verifyToken, InfoGraphController.infoGraph2);
// ruta para consultar la informacion de la tabla para graficar tipo 3, cuando en x es real y en y es real
router.get('/api/infoGraph3/:table&:campoX&:campoY&:esquema', verifyToken, InfoGraphController.infoGraph3);
// ruta para consultar la informacion de la tabla para graficar con campo de agrupamiento
router.get('/api/infoGraphAgrupa/:table&:campoX&:campoY&:operacion&agrupar&tipoAgrupar', verifyToken, InfoGraphController.infoGraphGroup);

router.get('/getFunctionTest', verifyToken, InfoGraphController.getInfoGraph);

// --------- fin solo ruta de graficas ------------------------------------------------------

// --------- Rutas de controlador iconos --------------------------------------
router.get('/getIcons/:schema_id', verifyToken, IconsController.getIcons);
router.get('/getIcons/:schema_id/:icon_id', verifyToken, IconsController.getIconID);
router.get('/getImages', verifyToken, IconsController.getImages);
router.post('/saveIcon', verifyToken, IconsController.saveIcon);
router.post('/doCalculate', verifyToken, IconsController.doCalculateField);
// --------- Fin rutas de controlador iconos --------------------------------------


//---- rutas de graficas en la base de datos-------------------------------------
//Ruta para consultar datos de la grafica
router.post('/api/paintGraph', verifyToken, GraficoController.getInfoGraph);
// guarda la info de la grafica en una tabla
router.post('/guardarDatosGrafica', verifyToken, GraficoController.guardarDatosGrafica);
//Elimina un grafico por su id
router.post('/eliminarGraficaPorId', verifyToken, GraficoController.eliminarGraficaPorId);

//Editor un grafico 
router.post('/editarGrafico', verifyToken, GraficoController.editarGrafico);

router.get('/getGraficoPorId/:grafico_id', verifyToken, GraficoController.getGraficoPorId);
//---- fin rutas de graficas en la base de datos-------------------------------------



// Esquema
router.post('/getEsquemas', verifyToken, EsquemaController.getEsquemas);

router.post('/getEsquemasUsuario', verifyToken, EsquemaController.getEsquemasUsuario);


// JWT
router.get('/', welcome);
router.get('/users', findAllUsers);


module.exports = router;