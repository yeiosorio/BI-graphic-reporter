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
import { GlobalService } from 'src/services/global/global.service';
export interface TabTable {
	id: number;
	nombre: string;
	content: string;
}
declare var M: any;

@Component({
	selector: 'app-graficos',
	templateUrl: './graficos.component.html',
	styleUrls: [ './graficos.component.css' ]
})
export class GraficosComponent implements OnInit {
	dataDrop: any;
	graficas: {};
	type: string;
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
	displayedColumns: string[] = [];
	dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	nameTable: string;
	nameGraph: string;
	nameWorkSpace: string;

	esquema: any; // esquema del usuario autenticado
	clientes: any; // clientes del usuario autenticado

	dehabilitado: string;

	selectEmpresa: string; // empresa seleccionada
	selectTable: string; // tabla seleccionada
	selectGraphType: string; // tipo de graafica seleccionado
	tablas: any; // tablas del usuario autenticado
	selectEjeX: any;
	selectEjeY: any;
	indexGraficaTab: any;
	selectOperacionY: any;
	selectOperacionX: any;
	descGrafico: any;
	trashColumns = [];
	operacionY: { nombre: string; id: string }[];

	ejex = []; // columna en eje x
	ejey = []; // columna en eje y
	// operacion para campo entero
	// string = real { nombre: 'Real', id: '' },

	// fecha ={ nombre: 'Año', id: 'year' },
	// { nombre: 'Año - Mes', id: 'yearM' },
	// { nombre: 'mes', id: 'mounth' },
	// { nombre: 'día - mes', id: 'dayM' },
	// { nombre: 'día', id: 'day' },

	// operacion = [
	// 	{ nombre: 'Real', id: '' },
	// 	{ nombre: 'Conteo', id: 'COUNT' },
	// 	{ nombre: 'Suma', id: 'SUM' },
	// 	{ nombre: 'Promedio', id: 'AVG' }
	// ];
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
	// tabs
	asyncTabs: any[];
	espacios: {};
	agregadosIdx: any = [];
	allDataEjeX: any = [];
	allDataEjeY: any = [];
	alllabels: any = [];
	allTypes: any = [];
	valueType: any;
	indexType: number;
	operacion: { nombre: string; id: string }[];
	typeTemp: { type: string }[];
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
	cargarTabs(indexGraficaTab, id, nombre, content, creando) {
		const nuevaTab = {
			id: id,
			nombre: nombre,
			content: content,
			creando: creando,
			indexGraficaTab: indexGraficaTab
		};

		this.asyncTabs.push(nuevaTab);
		this.selected.setValue(this.asyncTabs.length - 1);
	}

	closeTabs(index) {
		this.asyncTabs.splice(index, 1);
		this.agregadosIdx.splice(index, 1);
	}
	// identifica el cambio del nombre de la tabla
	changeNomGrafica(index) {
		this.asyncTabs[index].nombre = this.nameGraph;
	}
	// filtro de busqueda en el datatable -> en esta pagin ano esta habilitado
	applyFilter(filterValue: string) {
		this.dataSource.filter = filterValue.trim().toLowerCase();
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
	// identifia cuando se selecciona un archivo csv
	fileUploads(event) {
		this.files = event.target.files;
	}
	// lee el archivo seleccionado y lo muestra en un datatable
	cargarDatos(stepper: MatStepper) {
		if (this.files && this.files.length > 0) {
			stepper.next();
			const file: File = this.files.item(0);

			this.tamano = file.size;
			const reader: FileReader = new FileReader();
			reader.readAsText(file);
			reader.onload = (e) => {
				this.papa.parse(file, {
					complete: (result) => {
						this.header = result.data[0];
						this.displayedColumns = this.header;
						this.headerSave = Object.assign([], this.header);
						this.datos = result.data;
						this.datos.splice(0, 1);
						this.dataSource = new MatTableDataSource(this.datos);
						this.dataSource.paginator = this.paginator;
						this.dataSource.sort = this.sort;
					}
				});
			};
		} else {
			this.translate.get('ALERT-SELECT-FILE').subscribe((msn) => {
				M.toast({ html: msn });
			});
		}
	}
	// si le da click en omitir tutorial
	omitirTutorial() {
		this.proyectoService.omitirTutorial(this.usuario.id, 1).subscribe((res) => {
			if (res.success) {
				this.router.navigate([ '/inicio' ]);
			}
		});
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
		this.cargarColumnas();

		// reinicia los arreglos de los ejes
		this.ejex = [];
		this.ejey = [];
		this.operEjeX = [];
		this.operEjeY = [];
	}
	// cargar las columnas de la tabla seleccionada
	cargarColumnas() {
		this.ejex = [];
		this.ejey = [];
		this.operEjeX = [];
		this.operEjeY = [];

		this.uploadService
			.getColumnasTabla(this.selectTable, this.selectEmpresa)
			.subscribe((res) => {
				this.columnas = [];
				this.columnasTemp = [];
				this.tipoCampo = [];
				if (res.success) {
					this.col = res.desc_tabla;
					this.col.map((columna, key) => {
						this.columnas[key] = columna.Field;
						this.columnasTemp[key] = columna.Field;
						this.tipoCampo[key] = columna.Type;
					});

					console.log('columnas');
					console.log(this.columnas);
					console.log('tipoCampo');
					console.log(this.tipoCampo);
				}
			});
	}

	// identifica el cambio de operacion dentro del eje x
	changeSelectOperationEjex(e, index) {
		this.operEjeX[index] = e.value;
	}
	// identifica el cambio de operacion dentro del eje y
	changeSelectOperationEjey(e, index) {
		this.operEjeY[index] = e.value;
	}

	
	// drop de la lista de origen de los datos
	dropOrigen(event: CdkDragDrop<string[]>) {}
	// drop de la lista de espacios de trabajo
	dropEspacios(event: CdkDragDrop<string[]>) {}
	// drop de la lista de graficos
	dropGraficos(event: CdkDragDrop<string[]>) {
		console.log(event);
		this.datosEjeX = [];
		this.datosEjeY = [];
		this.campoY = '';
		let tipo = this.graficas[event.currentIndex].type;
		console.log(tipo);
		this.dataDrop = this.graficas[event.currentIndex].dataset;
		console.log(this.graficas[event.currentIndex]);
		// Se revierte a objeto la cadena del dataset de la grafica guardada
		let datasetGraph = JSON.parse(this.dataDrop);
		console.log(datasetGraph);
	}
	// agregar una nueva grafica
	nuevaGrafica(sidenav: MatSidenavContainer) {
		this.cargarTabs('', '', '', '', true);
		sidenav.open(); //abre el panel interno
		this.cargarColumnas();
	}
	guardarGrafica(index, sidenav: MatSidenavContainer) {
		if (this.nameGraph != undefined && this.nameGraph != '') {
			if (
				this.datosEjeX != undefined &&
				this.datosEjeX.length != 0 &&
				(this.datosEjeY != undefined && this.datosEjeY.length != 0)
			) {
				let arrayEjeX = {
					nombreX: this.ejex,
					operadorX: this.operEjeX
				};
				let arrayEjeY = {
					nombreY: this.ejey,
					operadorY: this.operEjeY
				};

				let dataArray = {
					labels: this.datosEjeX,
					data: this.datosEjeY,
					label: this.campoY,
					fieldY: arrayEjeY,
					fieldX: arrayEjeX
				};
				let dataset = JSON.stringify(dataArray);
				this.cargarGraficos(); //cargar graficas
				sidenav.close(); //abre el panel interno

				this.graficosService
					.guardarGrafica(
						this.nameGraph,
						dataset,
						this.esquema.nombre,
						this.type,
						this.descGrafico
					)
					.subscribe((res) => {
						if (res.success) {
							this.cargarGraficos(); //cargar graficas
							sidenav.close(); //abre el panel interno
							this.nameGraph = '';
							this.asyncTabs[index].creando = false;
							this.agregadosIdx[index] = res.insert_id;
						} else {
							this.translate.get('ALERT-PROBLEM').subscribe((msn) => {
								M.toast({ html: msn });
							});
						}
					});
			} else {
				this.translate.get('ALERT_NAME_GRAPH_GENERATE').subscribe((msn) => {
					M.toast({ html: msn });
				});
			}
		} else {
			this.translate.get('ALERT_NAME_GRAPH').subscribe((msn) => {
				M.toast({ html: msn });
			});
		}
	}
	// evento del drag and drop entre ejes y columnas
	drop(event: CdkDragDrop<string[]>, eje) {
		console.log('event *****************');
		console.log(event);
		// debugger; // permite poner un alto dentro de las funciones

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
		/**
		 * Recorre las columnas para identificar el indice al que pertence el tipo de dato
		 */
		for (let index = 0; index < this.columnas.length; index++) {
			if (this.columnas[index] == event.container.data[0]) {
				this.indexType = index;
			}
		}

		/**
		 * asigna el tipo de dato para darle tratamiento
		 */
		this.valueType = this.tipoCampo[this.indexType];

		/**
		 * Array que contiene los tipos de datos posibles 
		 */
		this.typeTemp = [
			{ type: 'int' },
			{ type: 'datetime' },
			{ type: 'double' },
			{ type: 'varchar' },
			{ type: 'boolean' }
		];

		/**
		 * Busca en el array de tipos de datos el tipo de dato encontrado
		 */
		for (var index = 0; index < this.typeTemp.length; index++) {
			/**
			 * si es verdadero si lo contiene se guarda el indice para enviarlo al case
			 */
			if (this.valueType.includes(this.typeTemp[index]['type'])) {
				switch (index) {
					case 0:
						if (eje == 'X') {
							this.operacion = [
								{ nombre: 'Real', id: '' },
								{ nombre: 'Conteo', id: 'COUNT' },
								{ nombre: 'Suma', id: 'SUM' },
								{ nombre: 'Promedio', id: 'AVG' }
							];
						} else {
							this.operacionY = [
								{ nombre: 'Real', id: '' },
								{ nombre: 'Conteo', id: 'COUNT' },
								{ nombre: 'Suma', id: 'SUM' },
								{ nombre: 'Promedio', id: 'AVG' }
							];
						}

						break;

					case 1:
						console.log('datatime entre');
						if (eje == 'X') {
							this.operacion = [
								{ nombre: 'Real', id: '' },
								{ nombre: 'Año', id: 'year' },
								{ nombre: 'Año - Mes', id: 'yearM' },
								{ nombre: 'mes', id: 'mounth' },
								{ nombre: 'día - mes', id: 'dayM' },
								{ nombre: 'día', id: 'day' }
							];
						} else {
							this.operacionY = [
								{ nombre: 'Real', id: '' },
								{ nombre: 'Año', id: 'year' },
								{ nombre: 'Año - Mes', id: 'yearM' },
								{ nombre: 'mes', id: 'mounth' },
								{ nombre: 'día - mes', id: 'dayM' },
								{ nombre: 'día', id: 'day' }
							];
						}

						break;
					case 2:
						console.log('double entre');
						if (eje == 'X') {
							this.operacion = [
								{ nombre: 'Real', id: '' },
								{ nombre: 'Conteo', id: 'COUNT' },
								{ nombre: 'Suma', id: 'SUM' },
								{ nombre: 'Promedio', id: 'AVG' }
							];
						} else {
							this.operacionY = [
								{ nombre: 'Real', id: '' },
								{ nombre: 'Conteo', id: 'COUNT' },
								{ nombre: 'Suma', id: 'SUM' },
								{ nombre: 'Promedio', id: 'AVG' }
							];
						}

						break;
					case 3:
						console.log('varchar entre');

						if (eje == 'X') {
							this.operacion = [ { nombre: 'Real', id: '' } ];
						} else {
							this.operacionY = [ { nombre: 'Real', id: '' } ];
						}

						break;

					default:
						break;
				}
			}
		}
	}
	// evento del drag and drop entre ejes y columnas
	dropEje(event: CdkDragDrop<string[]>) {
		if (event.previousContainer === event.container) {
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
		} else {
			transferArrayItem(
				event.previousContainer.data,
				event.container.data,
				event.previousIndex,
				event.currentIndex
			);
		}
		/**
		 * Recorre las columnas para identificar el indice al que pertence el tipo de dato
		 */
		for (let index = 0; index < this.columnas.length; index++) {
			if (this.columnas[index] == event.container.data[0]) {
				this.indexType = index;
			}
		}

		/**
		 * asigna el tipo de dato para darle tratamiento
		 */
		this.valueType = this.tipoCampo[this.indexType];

		/**
		 * Array que contiene los tipos de datos posibles 
		 */
		this.typeTemp = [
			{ type: 'int' },
			{ type: 'datetime' },
			{ type: 'double' },
			{ type: 'varchar' },
			{ type: 'boolean' }
		];

		/**
		 * Busca en el array de tipos de datos el tipo de dato encontrado
		 */
		for (var index = 0; index < this.typeTemp.length; index++) {
			/**
			 * si es verdadero si lo contiene se guarda el indice para enviarlo al case
			 */
			if (this.valueType.includes(this.typeTemp[index]['type'])) {
				switch (index) {
					case 0:
						this.operacion = [
							{ nombre: 'Real', id: '' },
							{ nombre: 'Conteo', id: 'COUNT' },
							{ nombre: 'Suma', id: 'SUM' },
							{ nombre: 'Promedio', id: 'AVG' }
						];

						break;

					case 1:
						// console.log('datatime entre');
						// { nombre: 'Año - Mes', id: 'yearM' },
						this.operacion = [
							{ nombre: 'Real', id: '' },
							{ nombre: 'Año', id: 'year' },

							{ nombre: 'mes', id: 'month' },
							{ nombre: 'día - mes', id: 'dayM' },
							{ nombre: 'día', id: 'day' }
						];

						break;
					case 2:
						// console.log('double entre');
						this.operacion = [
							{ nombre: 'Real', id: '' },
							{ nombre: 'Conteo', id: 'COUNT' },
							{ nombre: 'Suma', id: 'SUM' },
							{ nombre: 'Promedio', id: 'AVG' }
						];
						break;
					case 3:
						console.log('varchar entre');
						this.operacion = [ { nombre: 'Real', id: '' } ];
						break;

					default:
						break;
				}
			}
		}
	}

	// identifica el cambio de tipo de grafica
	cambiaTipo(e) {
		setTimeout(() => {
			let mapEle: HTMLElement = document.getElementById(
				'lineCanvas_' + (this.asyncTabs.length - 1)
			);

			if (this.chartGenerate != undefined) {
				this.chartGenerate.destroy();
			}
			this.tiposGraficas(this.selectGraphType, mapEle);
		}, 150);
	}

	// identifica y decide que funcionar usar de acuerdo al tipo de grafica seleccionado
	tiposGraficas(tipo, canvas) {
		switch (tipo) {
			case 'bar':
				this.lineChart = this.getBarChart(canvas);
				break;
			case 'horizontalBar':
				this.lineChart = this.getBarHoriChart(canvas);
				break;

			case 'line':
				this.lineChart = this.getLineChart(canvas);
				break;
			case 'lineInterPol':
				this.lineChart = this.getLineInterPolChart(canvas);
				break;

			case 'lineArea':
				this.lineChart = this.getLineAreaChart(canvas);
				break;
			case 'pie':
				this.lineChart = this.getPieChart(canvas);
				break;
			case 'doughnut':
				this.lineChart = this.getDoughnutChart(canvas);
				break;
				case 'radar':
				this.lineChart = this.getRadarChart(canvas);
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
	getBarChart(canvas) {
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

		return this.getChart(canvas, this.type, data);
	}
	// permite  la contruccion de la grafica de barras horizontal
	getBarHoriChart(canvas) {
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

		return this.getChart(canvas, this.type, data);
	}

	// permite la construccion de la grafica de linea
	getLineChart(canvas) {
		this.type = 'line';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: this.campoY,
					data: this.datosEjeY, // eje y
					fill: false,
					lineTension: 0.1,
					backgroundColor: 'transparent',
					borderWidth: 1,
					borderColor: 'rgb(0,0,0)',
					borderCapStyle: 'square', //but , round, square -- termina la linea
					borderJoinStyle: 'miter', // "bevel" || "round" || "miter"; -- curvas
					pointRadius: 2,
					pointHitRadius: 20,
					scanGaps: true
				}
			]
		};

		return this.getChart(canvas, this.type, data);
	}
		// permite la construccion de la grafica de linea interpolada
		getLineInterPolChart(canvas) {
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
	
			return this.getChart(canvas, this.type, data);
		}

	// permite la construccion de la grafica de area
	getLineAreaChart(canvas) {
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

		return this.getChart(canvas, this.type, data);
	}
	// permite  la contruccion de la grafica de radar

	getRadarChart(canvas) {
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

		return this.getChart(canvas, this.type, data);
	}

	// grafica de torta
	getPieChart(canvas) {
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

		return this.getChart(canvas, this.type, data);
	}
	// tipo de grafica de rosquilla
	getDoughnutChart(canvas) {
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

		return this.getChart(canvas, this.type, data);
	}
	// permite cargar loa informacion  de la tabla seleccionada, con los parametros indicados
	getInfo() {
		if (this.selectGraphType != undefined) {
			console.log(this.operEjeY[0]);
			console.log(this.ejex[0]);
			if (this.operEjeY[0] != undefined && this.ejey[0] != undefined) {
				this.infoTable = []; // inicializo la variable que muestra la info en la tabla
				this.datosEjeX = []; // inicia el arreglo de los datos del eje x
				this.datosEjeY = []; // inicia el arreglo de los datos del eje Y

				switch (this.ejey.length) {
					case 1: // caso de una sola columna en y
						let tipoConsulta = 1;
						let operacion1 = '';
						let operacion2 = '';

						// X real y Y operacion
						if (this.operEjeX[0] == '') {
							tipoConsulta = 1;
							operacion1 = this.operEjeY[0];
							this.campoX = this.ejex[0];
							this.campoY = this.operEjeY[0] + '(' + this.ejey[0] + ')';
						}
						// Y real y X operacion
						if (this.operEjeY[0] == '') {
							tipoConsulta = 2;
							operacion1 = this.operEjeY[0];

							this.campoY = this.ejex[0];
							this.campoX = this.operEjeY[0] + '(' + this.ejey[0] + ')';
						}
						// X real y Y real
						if (this.operEjeX[0] == '' && this.operEjeY[0] == '') {
							tipoConsulta = 3;
							this.campoY = this.ejex[0];
							this.campoX = this.ejey[0];
						}
						// X operacion y Y operacion
						if (this.operEjeX[0] != '' && this.operEjeY[0] != '') {
							tipoConsulta = 3;
							operacion1 = this.operEjeX[0];
							operacion2 = this.operEjeY[0];
							this.campoX = this.operEjeX[0] + '(' + this.ejex[0] + ')';
							this.campoY = this.operEjeY[0] + '(' + this.ejey[0] + ')';
						}

						this.graficosService
							.getQueryGraph(
								this.selectTable,
								this.campoX,
								this.campoY,
								this.esquema.nombre,
								tipoConsulta
							)
							.subscribe((res) => {
								this.infoTable = res;
								this.infoTable.map((campo, key) => {
									this.datosEjeX[key] = campo.campoX;
									this.datosEjeY[key] = campo.campoY;
								});
								let index = this.asyncTabs.length - 1;
								this.asociarData(
									index,
									this.datosEjeX,
									this.datosEjeY,
									this.campoY,
									this.selectGraphType
								);

								setTimeout(() => {
									if (this.chartGenerate != undefined) {
										this.chartGenerate.destroy();
									}
									let mapEle: HTMLElement = document.getElementById(
										'lineCanvas_' + index
									);

									this.tiposGraficas(this.selectGraphType, mapEle);
								}, 150);
							});

						break;

					default:
						break;
				}
			} else {
				// se debe seleccionar operaciones en los ejes
				this.translate.get('ALERT_NAME_GRAPH_OPER').subscribe((msn) => {
					M.toast({ html: msn });
				});
			}
		} else {
			// se debe seleccionar un tipo de grafica
			this.translate.get('ALERT_NAME_GRAPH_TYPE').subscribe((msn) => {
				M.toast({ html: msn });
			});
		}
	}
	// asocia la informacion que se consulta o
	asociarData(index, datosX, datosY, label, tipo) {
		this.allDataEjeX[index] = datosX;
		this.allDataEjeY[index] = datosY;
		this.alllabels[index] = label;
		this.allTypes[index] = tipo;
	}

	// identifica que se ha cambiado de tab -> tabla, de esta manera carga la info correspondiente a ella
	cambioTab(index) {
		if (this.asyncTabs.length > 1) {
			this.datosEjeX = this.allDataEjeX[index];
			this.datosEjeY = this.allDataEjeY[index];
			this.campoY = this.alllabels[index];
			setTimeout(() => {
				let indexGrafica = this.asyncTabs[index].indexGraficaTab;

				if (indexGrafica) {
					let datasetGraph = JSON.parse(this.graficas[indexGrafica].dataset);
					this.selectOperacionX = datasetGraph.fieldX.operadorX[0];
					this.selectOperacionY = datasetGraph.fieldY.operadorY[0];
					this.ejex = datasetGraph.fieldX.nombreX;
					this.ejey = datasetGraph.fieldY.nombreY;
					this.selectGraphType = this.graficas[indexGrafica].type;
				} else {
					this.selectOperacionX = '';
					this.selectOperacionY = '';
					this.ejex = [];
					this.ejey = [];
				}

				console.log(this.asyncTabs.length - 1);
				let mapEle: HTMLElement = document.getElementById('lineCanvas_' + index);

				this.tiposGraficas(this.allTypes[index], mapEle);
			}, 150);
		}
	}
	// abrir grafica
	abrirGrafica(id, sidenav: MatSidenavContainer) {
		this.indexGraficaTab = id;
		sidenav.open(); //abre el panel interno
		this.cargarColumnas();
		let datasetGraph = JSON.parse(this.graficas[id].dataset);

		if (datasetGraph.fieldX) {
			this.selectOperacionX = datasetGraph.fieldX.operadorX[0];
			this.selectOperacionY = datasetGraph.fieldY.operadorY[0];
			this.ejex = datasetGraph.fieldX.nombreX;
			this.ejey = datasetGraph.fieldY.nombreY;
			this.selectGraphType = this.graficas[id].type;
		}

		let idx = this.graficas[id].id;
		if (!this.agregadosIdx.includes(idx)) {
			this.agregadosIdx[this.asyncTabs.length] = idx;
			this.cargarTabs(
				this.indexGraficaTab,
				this.graficas[id].id,
				this.graficas[id].nombre,
				'',
				false
			);
			this.obtenerDatosGrafica(id);
		} else {
			this.selected.setValue(id);
		}
	}

	obtenerDatosGrafica(id) {
		this.datosEjeX = [];
		this.datosEjeY = [];
		this.campoY = '';
		// se obtiene el tipo de grafica
		let tipo = this.graficas[id].type;
		// Se revierte a objeto la cadena del dataset de la grafica guardada
		let datasetGraph = JSON.parse(this.graficas[id].dataset);
		let idx = this.asyncTabs.length - 1;
		setTimeout(() => {
			let mapEle: HTMLElement = document.getElementById('lineCanvas_' + idx);

			this.datosEjeX = datasetGraph.labels;
			this.datosEjeY = datasetGraph.data;
			this.campoY = datasetGraph.label;

			this.tiposGraficas(tipo, mapEle);
		}, 100);
	}

	/**
	 * author `Yeison osorio`
	 * @desc edicion de grafico
	  */
	editarGrafica(index, sidenav: MatSidenavContainer) {
		if (
			this.datosEjeX != undefined &&
			this.datosEjeX.length != 0 &&
			(this.datosEjeY != undefined && this.datosEjeY.length != 0)
		) {
			let arrayEjeX = {
				nombreX: this.ejex,
				operadorX: this.operEjeX
			};
			let arrayEjeY = {
				nombreY: this.ejey,
				operadorY: this.operEjeY
			};

			let dataArray = {
				labels: this.datosEjeX,
				data: this.datosEjeY,
				label: this.campoY,
				fieldY: arrayEjeY,
				fieldX: arrayEjeX
			};
			let dataset = JSON.stringify(dataArray);
			this.cargarGraficos(); //cargar graficas
			sidenav.close(); //abre el panel interno

			let graphId = this.graficas[this.indexGraficaTab].id;

			this.graficosService
				.editarGrafico(this.nameGraph, graphId, dataset, this.esquema.nombre, this.type)
				.subscribe((res) => {
					console.log(res);
					// if (res.success) {
					//   this.cargarGraficos(); //cargar graficas
					//   sidenav.close(); //abre el panel interno
					//   this.nameGraph = '';
					//   this.asyncTabs[index].creando = false;
					//   this.agregadosIdx[index] = res.insert_id;
					// } else {
					//   this.translate.get('ALERT-PROBLEM').subscribe((msn) => {
					//     M.toast({ html: msn });
					//   });
					// }
				});
		} else {
			this.translate.get('ALERT_NAME_GRAPH_GENERATE').subscribe((msn) => {
				M.toast({ html: msn });
			});
		}
	}
	// identifica que cambia de cliente
	cambiaCliente() {
		this.globalService.setSelectClient(this.selectEmpresa);
		this.graficas = [];
		this.tablas = [];
		this.espacios = [];
		this.cargarEsquemas();
	}
}
