import { ProyectoService } from 'src/services/proyecto/proyecto.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../app.component';
import { RouterModule, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Papa } from 'ngx-papaparse';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { MatStepper, MatSidenavContainer } from '@angular/material';
import { UploadService } from '../../services/upload/upload.service';
import { log } from 'util';
import {
	CdkDragDrop,
	moveItemInArray,
	transferArrayItem,
	copyArrayItem
} from '@angular/cdk/drag-drop';
import { Chart } from 'chart.js';

import * as moment from 'moment';
import { GraficosService } from 'src/services/graficos/graficos.service';
import { UsuarioService } from 'src/services/Login/login.service';
import { FormControl } from '@angular/forms';
import { NgGridConfig, NgGridItemConfig, NgGridItemEvent, NgGrid } from 'angular2-grid';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { GlobalService } from 'src/services/global/global.service';
interface Box {
	id: number;
	idGra: number;
	descGra: string;
	config: NgGridItemConfig;
	nombre: string;
	canvas: any;
	datosX: any;
	datosY: any;
	campoY: string;
	tipo: string;
	categoria: string;
	columnas: any;
	datos: any;
}

// interface grafh {
// 	canvas: any;
// 	datosX: any;
// 	datosY: any;
// 	campoY: string;
// 	tipo: string;
// }
declare var M: any;

@Component({
	selector: 'app-esp-trabajo',
	templateUrl: './esp-trabajo.component.html',
	styleUrls: [ './esp-trabajo.component.css' ]
})
export class EspTrabajoComponent implements OnInit {
	dataDrop: any;
	graficas: {};
	type: string;
	panel: any;
	// stepper
	isLinear = false; // comportamiento de los pasos del tutorial
	isEditable = true; // si es editable los pasos del tutorial
	isDisable = true; // ver el listado de origenes de datos, graficas y espacios

	IcondesableOri: string;
	IcondesableEsp: string;
	IcondesableGra: string;
	isDisableOrigen: string;
	isDisableGraph: string;
	isDisableSpace: string;
	firstFormGroup: FormGroup; // primer paso del tutorial

	events: string[];
	opened: boolean; // abrir o cerra panel interno
	expand: string; // contraer o expandir  panel externo
	expand2: string; // tamaño del panel interno, corre al contraer el panel externo
	margiLeftDinamic: string; // posicion del panel interno de acuerdo a la posicion del externo
	verEnMenu: boolean; // componentes dentro del menu externo
	usuario: any; // usuario que se autentica
	//  datatable
	header: any;
	datos: any;
	files: any;
	headerSave: any;
	infHead: any;

	// tabs
	asyncTabs: any[];
	agregadosIdx: any = [];
	dataSource: any = [];
	displayedColumns: string[] = [];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	nameTable: string;
	nameEsp: string;
	nameWorkSpace: string;

	esquema: any; // esquema del usuario autenticado
	clientes: any; // clientes del usuario autenticado

	dehabilitado: string;

	selectEmpresa: string; // empresa seleccionada
	selectTable: string; // tabla seleccionada
	selectGraphType: string; // tipo de graafica seleccionado
	tablas: any; // tablas del usuario autenticado

	ejex = []; // columna en eje x
	ejey = []; // columna en eje y
	// operacion para campo entero
	operacion = [
		{ nombre: 'Real', id: '' },
		{ nombre: 'Conteo', id: 'COUNT' },
		{ nombre: 'Suma', id: 'SUM' },
		{ nombre: 'Promedio', id: 'AVG' }
	];
	selectOperation: string;

	listGraph = [ { id: 1, nombre: 'img1' }, { id: 2, nombre: 'img2' } ];

	// grafica
	graphInit: any;
	@ViewChild('lineCanvas') lineCanvas;
	tamano: number;
	col: any;
	columnas: any;
	tipoCampo: any;
	columnasTemp: any;
	operEjeX: any;
	operEjeY: any;
	datosEjeY: any;
	infoTable: any;
	datosEjeX: any;
	campoY: string;
	lineChart: void;
	campoX: any;
	chartGenerate: any;
	/// graficas ind
	selected = new FormControl(0);
	espacios: {};
	verOpcion: boolean = false;
	// grid ------------
	@ViewChild(NgGrid) private grid: NgGrid;
	public curNum = 3;
	public boxes: Array<Box> = [];
	graphData = [];
	public gridConfig: NgGridConfig = <NgGridConfig>{
		margins: [ 5 ],
		draggable: true,
		resizable: true,
		max_cols: 0,
		max_rows: 0,
		visible_cols: 0,
		visible_rows: 0,
		min_cols: 1,
		min_rows: 1,
		col_width: 2,
		row_height: 2,
		cascade: 'up',
		min_width: 70,
		min_height: 55,
		fix_to_grid: true,
		auto_style: true,
		auto_resize: false,
		maintain_ratio: false,
		prefer_new: true,
		zoom_on_drag: false,
		limit_to_screen: true,
		element_based_row_height: false,
		center_to_screen: true,
		fix_item_position_direction: 'vertical',
		fix_collision_position_direction: 'vertical'
	};
	private curItemCheck = 0;
	allBoxes: any = [];
	descripcionEsp: any;
	selectGraph: any;
	idxBox: number;
	allChartGenerate: any = [];
	header_column: any;

	constructor(
		private appComponent: AppComponent,
		private router: Router,
		private _formBuilder: FormBuilder,
		private papa: Papa,
		private proyectoService: ProyectoService,
		private graficosService: GraficosService,
		private uploadService: UploadService,
		private globalService: GlobalService,
		private translate: TranslateService
	) {
		//tabs
		this.asyncTabs = [];
		// permite obtener la informacion del usuario autenticado
		this.usuario = JSON.parse(sessionStorage.getItem('usuario'));
		// definen que tipo de menu debe aparecer
		this.appComponent.menu2 = 'block';
		this.appComponent.menu1 = 'none';
		// permite obtener la informacion del usuario autenticado
		this.usuario = JSON.parse(sessionStorage.getItem('usuario'));
		this.margiLeftDinamic = 'margin-left-dinamic1';
		this.expand2 = 'tam-row-lateral2';
		this.expand = 'tam-row-lateral';
		this.verEnMenu = true;
		// si es deshabilitado
		if (this.isDisable) {
			this.dehabilitado = 'disabled';
			this.isDisableOrigen = this.dehabilitado;
			this.isDisableGraph = this.dehabilitado;
			this.isDisableSpace = this.dehabilitado;
			this.IcondesableOri = 'iconos-origen-disable';
			this.IcondesableGra = 'iconos-graficos-disable';
			this.IcondesableEsp = 'iconos-espacios-disable';
		} else {
			this.dehabilitado = '';
			this.isDisableOrigen = this.dehabilitado;
			this.isDisableGraph = this.dehabilitado;
			this.isDisableSpace = this.dehabilitado;
			this.IcondesableOri = 'iconos-origen';
			this.IcondesableGra = 'iconos-graficos';
			this.IcondesableEsp = 'iconos-espacios';
		}
	}

	ngOnInit() {
		// inicia los componentes de materialize
		setTimeout(() => {
			M.AutoInit();
		}, 100);
		// carga los clientes que el usuario tenga asociados
		this.cargarClientes();
	}

	//Carga los tabs de acuerdo a la seleccion de la tabla
	cargarTabs(id, nombre, content, creando, descripcion) {
		const nuevaTab = {
			id: id,
			nombre: nombre,
			content: content,
			creando: creando,
			descripcion: descripcion
		};
		this.asyncTabs.push(nuevaTab);

		this.selected.setValue(this.asyncTabs.length - 1);
	}

	// funcion que permite contraer  el panel interno
	cerrarPanel() {
		if (this.expand == 'tam-row-lateral') {
			this.verEnMenu = false;
			this.expand = 'tam-row-lateral-menos';
			this.expand2 = 'tam-row-lateral2';
			this.margiLeftDinamic = 'margin-left-dinamic2';
		}
	}
	// funcion que permite expandir  el panel interno
	abrirPanel() {
		if (this.expand == 'tam-row-lateral-menos') {
			this.verEnMenu = true;
			this.expand = 'tam-row-lateral';
			this.expand2 = 'tam-row-lateral2';
			this.margiLeftDinamic = 'margin-left-dinamic1';
		}
	}

	// carga los clientes del usuario
	cargarClientes() {
		this.proyectoService.getClientes(this.usuario.id).subscribe((res) => {
			this.clientes = res.empresas;
			console.log(this.clientes);
			this.selectEmpresa = this.globalService.getSelectClient();
				if(this.selectEmpresa === undefined){
					this.selectEmpresa = this.clientes[0].empresa_id;
				}
				// carga los proyectos que el usuario tenga asociados
				this.cargarEsquemas();
		});
	}
	// carga los esquemas del usuario
	cargarEsquemas() {
		this.proyectoService.getProyectos(this.usuario.id, this.selectEmpresa).subscribe((res) => {
			this.esquema = res.esquemas[0];
			this.carrgarTablas();
			this.cargarGraficos();
			this.cargarEspaciosTrabajo();
		});
	}

	carrgarTablas() {
		this.uploadService.getTables(this.selectEmpresa, 1, 10).subscribe((res) => {
			if(res.length > 0 ){
				this.tablas = res;
				this.selectTable = this.tablas[0].nomb_tabla;
				this.enableList('tablas');
			} else {
				this.disableList('tablas');
			}
		});
	}

	// consulta las graficas que el usuario tiene para el cliente seleccionado
	cargarGraficos() {
		this.graficosService
			.getGraficos(this.esquema.nombre, this.selectEmpresa)
			.subscribe((res) => {
				if (res.success && res.graficos.length > 0) {  
					this.graficas = res.graficos;  
					this.enableList('graficos');
				} else {
					this.disableList('graficos');
				}
			});
	}

	cargarEspaciosTrabajo() {
		this.graficosService
			.getEspaciosTrabajo(this.usuario.id, this.selectEmpresa)
			.subscribe((res) => {
				if (res.success && res.espacios_trabajo.length > 0) {
					this.enableList('espacios');
					this.espacios = res.espacios_trabajo;
				} else {
					this.disableList('espacios');
				}
			});
	}

	// Funcion que Habilita los campos
	enableList(caso: string){

		switch(caso){
			case 'tablas': {
				this.isDisableOrigen = '';
				this.IcondesableOri = 'iconos-origen';
			}
			case 'graficos':{
				this.isDisableGraph = '';
				this.IcondesableGra = 'iconos-graficos';
			}
			case 'espacios':{
				this.isDisableSpace = '';
				this.IcondesableEsp = 'iconos-espacios';
			}
		}
	}

	// Funcion que deshabilita los campos
	disableList(caso: string){

		this.dehabilitado = 'disabled';
		switch(caso){
			case 'tablas': {
				this.isDisableOrigen = this.dehabilitado;
				this.IcondesableOri = 'iconos-origen-disable';
			}
			case 'graficos':{
				this.isDisableGraph = this.dehabilitado;
				this.IcondesableGra = 'iconos-graficos-disable';
			}
			case 'espacios':{
				this.isDisableSpace = this.dehabilitado;
				this.IcondesableEsp = 'iconos-espacios-disable';
			}
		}
	}

	// identifica si la seleccion de la tabla cmabia, para cargar las nuevas columnas
	changeSelectTable(e) {
		// reinicia los arreglos de los ejes
		this.ejex = [];
		this.ejey = [];
		this.operEjeX = [];
		this.operEjeY = [];
	}

	// identifica el cambio de operacion dentro del eje x
	changeSelectOperationEjex(e, index) {
		this.operEjeX[index] = e.value;
	}
	// identifica el cambio de operacion dentro del eje y
	changeSelectOperationEjey(e, index) {
		this.operEjeY[index] = e.value;
	}

	// identifica que se ha cambiado de tab -> tabla, de esta manera carga la info correspondiente a ella
	cambioTab(index) {
		this.header = [];
		this.selected.setValue(index);

		//if (this.asyncTabs.length > 1) {
		this.nameEsp = this.asyncTabs[index].nombre;
		this.descripcionEsp = this.asyncTabs[index].descripcion;
		this.boxes = this.allBoxes[index];
		this.idxBox = 0;

		for (let i = 0; i < this.boxes.length; i++) {
			this.idxBox = i;

			// si el contenido de la caja es un grafica
			if (this.boxes[i].categoria == 'grafica') {
				this.verOpcion = true;
				this.obtenerGraficas(i, index);
			}
			if (this.boxes[i].categoria == 'origen') {
				this.verOpcion = false;
				this.obtenerTabla(i, index);
			}
		}
		//	}
	}
	// permite recuperar las graficas en cada box
	obtenerGraficas(i, index) {
		// i de cada box, index de cada tab
		setTimeout(() => {
			let mapEle: HTMLElement = document.getElementById('lineCanvas_' + index + i);
			this.datosEjeX = this.boxes[i].datosX;
			this.datosEjeY = this.boxes[i].datosY;
			this.campoY = this.boxes[i].campoY;
			this.tiposGraficas(this.boxes[i].tipo, mapEle, i);
		}, 500);
	}
	// permite recuperar las tablas dentro de las box
	obtenerTabla(i, index) {
		// i de cada box, index de cada tab
		console.log(this.boxes[i]);
		setTimeout(() => {
			this.header[i] = this.boxes[i].columnas;
			this.displayedColumns[i] = this.header[i];
			this.dataSource[i] = new MatTableDataSource(this.boxes[i].datos);
			this.dataSource[i].paginator = this.paginator;
			this.dataSource[i].sort = this.sort;

			//	this.asociarData(idx, this.datos, this.header);
		}, 50);
	}

	// drop de la lista de origen de los datos
	dropOrigen(event: CdkDragDrop<string[]>) {
		this.datos = [];
		this.header = [];
		this.header_column = [];
		if (this.boxes == undefined) {
			this.boxes = new Array<Box>();
		}

		if (event.previousContainer === event.container) {
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
		} else {
			copyArrayItem(
				event.previousContainer.data,
				event.container.data,
				event.previousIndex,
				event.currentIndex
			);
		}
		let idx = this.boxes.length;

		let idGra = this.tablas[event.currentIndex].tabla_id; // id de la tabla
		let nombre = this.tablas[event.currentIndex].nombre; //se obtiene el nombre de la tabla
		let nombre_tabla = this.tablas[event.currentIndex].nomb_tabla;

		const conf = this._generateDefaultItemConfig(); // se agrega la configuracion de las cajas internas
		// inicia los componentes de materialize
		setTimeout(() => {
			M.AutoInit();
		}, 100);
		setTimeout(() => {
			conf.payload = idx;
			this.boxes[idx] = {
				id: idx,
				idGra: idGra,
				descGra: '',
				config: conf,
				nombre: nombre,
				canvas: '',
				datosX: [],
				datosY: [],
				campoY: '',
				tipo: '',
				categoria: 'origen',
				columnas: [],
				datos: []
			};
			this.verOpcion = false;

			this.uploadService
				.getColumnasTabla(nombre_tabla, this.selectEmpresa)
				.subscribe((res) => {
					if (res.success) {
						this.col = res.desc_tabla;
						this.graficosService
							.getInfoTable(this.selectEmpresa, nombre)
							.subscribe((res) => {
								this.col.map((columna, key) => {
									this.header_column[key] = columna.Field;
								});
								this.datos = res;
								this.datos.map((item, key) => {
									this.datos[key] = Object.values(this.datos[key]);
								});
								this.header[idx] = this.header_column;
								setTimeout(() => {
									this.displayedColumns[idx] = this.header[idx];
									this.dataSource[idx] = new MatTableDataSource(this.datos);
									this.dataSource[idx].paginator = this.paginator;
									this.dataSource[idx].sort = this.sort;
									this.boxes[idx].columnas = this.header[idx];
									this.boxes[idx].datos = this.datos;
									//	this.asociarData(idx, this.datos, this.header);
								}, 50);
							});
					}
				});
		}, 100);
	}
	// drop de la lista de espacios de trabajo
	dropEspacios(event: CdkDragDrop<string[]>) {}
	// drop de la lista de graficos
	dropGraficos(event: CdkDragDrop<string[]>) {
		if (this.boxes == undefined) {
			this.boxes = new Array<Box>();
		}

		if (event.previousContainer === event.container) {
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
		} else {
			copyArrayItem(
				event.previousContainer.data,
				event.container.data,
				event.previousIndex,
				event.currentIndex
			);
		}

		this.datosEjeX = [];
		this.datosEjeY = [];
		this.campoY = '';
		let idx = this.boxes.length;

		this.dataDrop = event.container.data;

		// se obtiene el tipo de grafica
		let idGra = this.dataDrop[event.currentIndex].id;
		let tipo = this.dataDrop[event.currentIndex].type;
		let nombre = this.dataDrop[event.currentIndex].nombre;
		// Se revierte a objeto la cadena del dataset de la grafica guardada
		let datasetGraph = JSON.parse(this.dataDrop[event.currentIndex].dataset);

		const conf = this._generateDefaultItemConfig();
		// inicia los componentes de materialize
		setTimeout(() => {
			M.AutoInit();
		}, 100);
		setTimeout(() => {
			conf.payload = idx;
			this.boxes[idx] = {
				id: idx,
				idGra: idGra,
				descGra: '',
				config: conf,
				nombre: nombre,
				canvas: '',
				datosX: [],
				datosY: [],
				campoY: '',
				tipo: tipo,
				categoria: 'grafica',
				columnas: '',
				datos: ''
			};
			this.verOpcion = true;
		}, 100);
		setTimeout(() => {
			setTimeout(() => {
				M.AutoInit();
			}, 100);
			let mapEle: HTMLElement = document.getElementById(
				'lineCanvas_' + this.selected.value + idx
			);

			this.datosEjeX = datasetGraph.labels;
			this.datosEjeY = datasetGraph.data;
			this.campoY = datasetGraph.label;
			this.tiposGraficas(tipo, mapEle, idx);
			this.boxes[idx].canvas = mapEle;
			this.boxes[idx].datosX = this.datosEjeX;
			this.boxes[idx].datosY = this.datosEjeY;
			this.boxes[idx].campoY = this.campoY;
			this.boxes[idx].descGra = 'descripcion grafica';

			//cargar graficas
			this.allBoxes[this.asyncTabs.length - 1] = this.boxes;
			// this.asyncTabs[this.asyncTabs.length - 1].creando = true;
		}, 100);
	}

	// identifica y decide que funcionar usar de acuerdo al tipo de grafica seleccionado
	tiposGraficas(tipo, canvas, i) {
		switch (tipo) {
			case 'bar':
				this.lineChart = this.getBarChart(canvas, i);
				break;
			case 'horizontalBar':
				this.lineChart = this.getBarHoriChart(canvas, i);
				break;
			case 'line':
				this.lineChart = this.getLineChart(canvas, i);
				break;
			case 'lineInterPol':
				this.lineChart = this.getLineInterPolChart(canvas, i);
				break;

			case 'lineArea':
				this.lineChart = this.getLineAreaChart(canvas, i);
				break;
			case 'pie':
				this.lineChart = this.getPieChart(canvas, i);
				break;
			case 'doughnut':
				this.lineChart = this.getDoughnutChart(canvas, i);
				break;
			case 'radar':
				this.lineChart = this.getRadarChart(canvas, i);
				break;
			default:
				break;
		}
	}
	// construccion glocal de la grafica
	getChart(context, chartType, data, options?) {
		this.chartGenerate = new Chart(context, {
			data,

			options: {
				scales: {
					yAxes: [
						{
							ticks: {
								beginAtZero: true
							}
						}
					]
				}
			},
			responsive: true,
			type: chartType,
			title: {
				fontSize: 18,
				display: true,
				text: 'I want to believe !',
				position: 'bottom'
			}
		});
		return this.chartGenerate;
	}

	// permite la construccion de la grafica de barras
	getBarChart(canvas, i) {
		this.type = 'bar';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: this.campoY,
					data: this.datosEjeY, // eje y
					backgroundColor: '#d56f77',
					borderColor: '#d56f77',
					borderCapStyle: 'round',
					borderWidth: 3,
					hoverBackgroundColor: '#5dade2',
					hoverBorderColor: '#5dade2',
					hoverBorderWidth: 7
				}
			]
		};

		return this.getChart(canvas, this.type, data, i);
	}
	// permite  la contruccion de la grafica de barras horizontal
	getBarHoriChart(canvas, i) {
		this.type = 'horizontalBar';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: 'eje x',
					data: this.datosEjeY, // eje y
					backgroundColor: '#d56f77',
					borderColor: '#d56f77',
					borderCapStyle: 'round',
					borderWidth: 3,
					hoverBackgroundColor: '#5dade2',
					hoverBorderColor: '#5dade2',
					hoverBorderWidth: 7
				}
			]
		};

		return this.getChart(canvas, this.type, data, i);
	}

	// permite la construccion de la grafica de linea
	getLineChart(canvas, i) {
		this.type = 'line';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: this.campoY,
					data: this.datosEjeY, // eje y
					fill: false,
					lineTension: 0.1,
					borderWidth: 1,
					backgroundColor: '#9c71d3',
					borderColor: '#9c71d3',
					borderCapStyle: 'square', //but , round, square -- termina la linea
					borderJoinStyle: 'miter', // "bevel" || "round" || "miter"; -- curvas
					pointRadius: 2,
					pointHitRadius: 20,
					scanGaps: true
				}
			]
		};

		return this.getChart(canvas, this.type, data, i);
	}

	// permite la construccion de la grafica de linea interpolada
	getLineInterPolChart(canvas, i) {
		this.type = 'line';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: 'eje x',
					data: this.datosEjeY, // eje y
					fill: false, // rellenar el area bajo la curva
					lineTension: 0, // si son angulos rectos, o con grado de curva en cada punto
					backgroundColor: '#71b0d3',
					borderColor: '#71b0d3',
					borderWidth: 1,
					borderCapStyle: 'square', //but , round, square -- termina la linea
					borderJoinStyle: 'miter', // "bevel" || "round" || "miter"; -- curvas
					pointRadius: 2,
					pointHitRadius: 20,
					scanGaps: true,
					steppedLine: true
				}
			]
		};

		return this.getChart(canvas, this.type, data, i);
	}

	// permite la construccion de la grafica de area
	getLineAreaChart(canvas, i) {
		this.type = 'line';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: 'eje x',
					data: this.datosEjeY, // eje y
					fill: true, // rellenar el area bajo la curva
					lineTension: 0, // si son angulos rectos, o con grado de curva en cada punto
					backgroundColor: '#cad371',
					borderColor: '#cad371',

					borderWidth: 1,

					borderCapStyle: 'square', //but , round, square -- termina la linea
					borderJoinStyle: 'miter', // "bevel" || "round" || "miter"; -- curvas
					pointRadius: 2,
					pointHitRadius: 20,
					pointHoverBorderColor: 80,
					scanGaps: false,
					steppedLine: false // linea escalonada
				}
			]
		};

		return this.getChart(canvas, this.type, data, i);
	}

	// permite  la contruccion de la grafica de radar

	getRadarChart(canvas, i) {
		this.type = 'radar';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: 'eje x',
					data: this.datosEjeY, // eje y
					fill: true, // rellenar el area bajo la curva
					lineTension: 0, // si son angulos rectos, o con grado de curva en cada punto
					backgroundColor: this.appComponent.colores[7],
					borderColor: this.appComponent.colores[7],
					borderWidth: 1,
					borderCapStyle: 'square', //but , round, square -- termina la linea
					borderJoinStyle: 'miter', // "bevel" || "round" || "miter"; -- curvas
					pointRadius: 2,
					pointHitRadius: 20,
					pointHoverBorderColor: 80,
					scanGaps: false,
					steppedLine: false // linea escalonada
				}
			]
		};

		return this.getChart(canvas, this.type, data, i);
	}

	// grafica de torta
	getPieChart(canvas, i) {
		this.type = 'pie';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: this.campoY,
					data: this.datosEjeY, // eje y
					fill: false,
					lineTension: 0.1,
					backgroundColor: this.appComponent.colores,
					borderColor: this.appComponent.colores,
					borderWidth: 1,
					borderCapStyle: 'square', //but , round, square -- termina la linea
					borderJoinStyle: 'miter', // "bevel" || "round" || "miter"; -- curvas
					pointRadius: 2,
					pointHitRadius: 20,
					scanGaps: true
				}
			]
		};

		return this.getChart(canvas, this.type, data, i);
	}
	// tipo de grafica de rosquilla
	getDoughnutChart(canvas, i) {
		this.type = 'doughnut';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: this.campoY,
					data: this.datosEjeY, // eje y
					fill: false,
					lineTension: 0.1,
					borderWidth: 1,
					backgroundColor: this.appComponent.colores,
					borderColor: this.appComponent.colores,
					borderCapStyle: 'square', //but , round, square -- termina la linea
					borderJoinStyle: 'miter', // "bevel" || "round" || "miter"; -- curvas
					pointRadius: 2,
					pointHitRadius: 20,
					scanGaps: true
				}
			]
		};

		return this.getChart(canvas, this.type, data, i);
	}
	// abre espacio de trabaho
	abrirEspacio(id) {
		let idx = this.espacios[id].id;

		if (!this.agregadosIdx.includes(idx)) {
			this.agregadosIdx[this.asyncTabs.length] = idx;
			this.cargarTabs(
				idx,
				this.espacios[id].nombre,
				'',
				false,
				this.espacios[id].descripcion
			);
			this.obtenerDatosBox(id);
		} else {
			this.selected.setValue(this.agregadosIdx.indexOf(idx));
		}
	}
	// obtiene los datos de las cajas internsa de los espacios de trabajo
	obtenerDatosBox(id) {
		let idx = this.asyncTabs.length - 1;
		// se obtiene los box que existen dentro de un espacio de trabajo
		this.allBoxes[idx] = JSON.parse(this.espacios[id].dataset_graficas);
		// // inicia los componentes de materialize
		setTimeout(() => {
			M.AutoInit();
		}, 100);
	}

	nuevoEspacio() {
		//	this.boxes = [];
		this.cargarTabs('', '', {}, true, '');
	}
	// genera la caja dentro de la grid
	private _generateDefaultItemConfig(): NgGridItemConfig {
		return {
			dragHandle: '.handle',
			col: 1,
			row: 1,
			sizex: 1,
			sizey: 1,
			minHeight: 55,
			minWidth: 70
		};
	}
	// identifica el cambio del nombre del espacio
	changeNomEspacio(index) {
		this.asyncTabs[index].nombre = this.nameEsp;
	}

	get itemCheck(): number {
		return this.curItemCheck;
	}

	set itemCheck(v: number) {
		this.curItemCheck = v;
	}

	get curItem(): NgGridItemConfig {
		return this.boxes[this.curItemCheck] ? this.boxes[this.curItemCheck].config : {};
	}

	ngAfterViewInit(): void {
		//  Do something with NgGrid instance here
	}

	setMargin(marginSize: string): void {
		this.gridConfig.margins = [ parseInt(marginSize, 10) ];
	}

	updateItem(index: number, event: NgGridItemEvent): void {}

	onDrag(index: number, event: NgGridItemEvent): void {}

	onResize(index: number, event: NgGridItemEvent): void {}
	// guardar espacio de trabajo
	guardarEspacio(index, sidenav: MatSidenavContainer) {
		console.log('guardar');
		console.log(this.boxes);
		if (this.nameEsp != undefined && this.nameEsp != '') {
			this.graficosService
				.guardarEspacioTrabajo(
					JSON.stringify(this.boxes),
					this.nameEsp,
					this.esquema.id,
					this.descripcionEsp
				)
				.subscribe((res) => {
					if (res.success) {
						this.cargarEspaciosTrabajo(); //cargar graficas
						this.allBoxes[index] = this.boxes;
						this.asyncTabs[index].creando = false;
						this.asyncTabs[index].descripcion = this.descripcionEsp;
					}
				});
		} else {
			this.translate.get('ALERT_NAME_ESP').subscribe((msn) => {
				M.toast({ html: msn });
			});
		}
	}
	// editar espacio de trabajo
	editarEspacio(index, sidenav: MatSidenavContainer) {
		sidenav.close(); //abre el panel interno
		console.log('editar');
		console.log(this.boxes);
		//	if (this.nameEsp != undefined && this.nameEsp != '') {
		this.graficosService
			.editarEspacioTrabajo(
				this.asyncTabs[index].id,
				JSON.stringify(this.boxes),
				this.nameEsp,
				this.esquema.id,
				this.descripcionEsp
			)
			.subscribe((res) => {
				if (res.success) {
					this.cargarEspaciosTrabajo(); //cargar graficas
					this.allBoxes[index] = this.boxes;
					this.asyncTabs[index].creando = false;
					this.asyncTabs[index].descripcion = this.descripcionEsp;
				}
			});
	}
	// identifica que cambia de cliente
	cambiaCliente() {
		this.globalService.setSelectClient(this.selectEmpresa);
		this.graficas = [];
		this.tablas = [];
		this.espacios = [];
		this.cargarEsquemas();
	}

	// identifica el cambio de tipo de grafica
	cambiaTipo(e) {
		setTimeout(() => {
			this.chartGenerate = this.allChartGenerate[this.selectGraph];

			let mapEle: HTMLElement = document.getElementById(
				'lineCanvas_' + this.selected.value + this.selectGraph
			);
			if (this.chartGenerate != undefined) {
				this.chartGenerate.destroy();
			}
			this.tiposGraficas(this.selectGraphType, mapEle, this.selectGraph);
			this.boxes[this.selectGraph].tipo = this.selectGraphType;
		}, 150);
	}
	// premite abrir el panel interno para el cambnio de tipo de grafica
	abrirPanelInterno(sidenav: MatSidenavContainer) {
		sidenav.open(); //abre el panel interno
		this.selectGraphType = this.boxes[this.selectGraph].tipo;
		this.chartGenerate = this.allChartGenerate[this.selectGraph];
	}
	// premite cerrar el panel interno para el cambnio de tipo de grafica
	cerrarPanelInterno(sidenav: MatSidenavContainer) {
		sidenav.close(); //cerrar el panel interno
	}
	// permite identificar en que grafica se dio click
	seleccionaGrafica(index) {
		this.selectGraph = index;
	}
	// permite eliminar la grafica indicada del espcio de trabajo
	eliminarGrafica() {
		this.boxes.splice(this.selectGraph);
	}
	// permite cerrar la pestaña abierta
	cerrarPestana(i) {
		this.asyncTabs.splice(i, 1);
		this.agregadosIdx.splice(i, 1);
	}
	// permite volver la grsafica al valor de por defecto (el tipo)
	valorDefecto() {
		let tipoGrafica = this.selectGraphType;
		let grafica = this.boxes[this.selectGraph].idGra;
		for (let key in this.graficas) {
			if (this.graficas[key].id == grafica) {
				tipoGrafica = this.graficas[key].type;
			}
		}

		setTimeout(() => {
			let mapEle: HTMLElement = document.getElementById(
				'lineCanvas_' + this.selected.value + this.selectGraph
			);
			if (this.chartGenerate != undefined) {
				this.chartGenerate.destroy();
			}
			this.tiposGraficas(tipoGrafica, mapEle, this.selectGraph);
			this.boxes[this.selectGraph].tipo = tipoGrafica;
		}, 150);
	}

	download() {
		//let doc = new jsPDF();

		// 	/* for(var i=0;i<this.images.length;i++){
		// 	  let imageData= this.getBase64Image(document.getElementById('img'+i));
		// 	  console.log(imageData);
		// 	  doc.setFontSize(40)
		//    doc.text(35, 25, 'Paranyan loves jsPDF')
		// 		doc.addImage(imageData, "JPG", 10, (i+1)*10, 180, 150);
		// 		doc.addPage();
		// 	 }*/
		//    doc.text(20, 20, 'Hello landscape world!');
		//    // Optional - set properties on the document  // metadata
		//    doc.setProperties({
		// 	   title: 'Title',
		// 	   subject: 'This is the subject',
		// 	   author: 'James Hall',
		// 	   keywords: 'generated, javascript, web 2.0, ajax',
		// 	   creator: 'MEEE'
		//    });

		var data = document.getElementById('esp-panel');
		html2canvas(data).then((canvas) => {
			// Few necessary setting options
			//var imgWidth = 100;
			var imgWidth = 130;
			var pageHeight = 200;
			var imgHeight = canvas.height * imgWidth / canvas.width;
			var heightLeft = imgHeight;

			const contentDataURL = canvas.toDataURL('image/png');
			let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
			var position = 30;
			pdf.setFont('roboto'); // tipo
			pdf.setFontSize(17); // taamaño
			pdf.text(80, 10, 'Espacio de Trabajo: ' + this.nameEsp);
			pdf.setFontSize(15); // taamaño
			pdf.text(20, 20, this.descripcionEsp);

			pdf.addImage(contentDataURL, 'PNG', 30, position, imgWidth, imgHeight);
			pdf.save('MYPdf.pdf'); // Generated PDF
			//pdf.output('dataurlnewwindow'); // previasualiza en una nueva ventana
		});
		// 	 doc.output('datauri'); // previasualiza
		//	var elem = document.getElementById('basic-table');
		//	var res = doc.autoTableHtmlToJson(elem);
		//	doc.autoTable(res.columns, res.data);
		//doc.output('datauri'); // previasualiza en la misma ventana

		// doc.save('table.pdf');
	}
}
