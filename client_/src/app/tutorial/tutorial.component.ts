import { Usuario } from './../models/usuario';
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
declare var M: any;

@Component({
	selector: 'app-tutorial',
	templateUrl: './tutorial.component.html',
	styleUrls: [ './tutorial.component.css' ],
	providers: [ ProyectoService ]
})
export class TutorialComponent implements OnInit {
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
	graphData = [];
	canvasDinami: string;
	idcanvas: string;
	constructor(
		private appComponent: AppComponent,
		private router: Router,
		private _formBuilder: FormBuilder,
		private papa: Papa,
		private proyectoService: ProyectoService,
		private graficosService: GraficosService,
		private uploadService: UploadService,
		private translate: TranslateService,
		private appComponen: AppComponent
	) {
		// definen que tipo de menu debe aparecer
		this.appComponent.menu2 = 'block';
		this.appComponent.menu1 = 'none';
		// permite obtener la informacion del usuario autenticado
		this.usuario = JSON.parse(localStorage.getItem('usuario'));
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
				this.usuario.tutorial = '1';
				localStorage.setItem('usuario', JSON.stringify(this.usuario));
				this.router.navigate([ '/inicio' ]);
			}
		});
	}
	// carga los clientes del usuario
	cargarClientes() {
		this.proyectoService.getClientes(this.usuario.id).subscribe((res) => {
			this.clientes = res.empresas;
			console.log(this.clientes);
			// se espera un momento para inicializar los campos select
			setTimeout(() => {
				M.AutoInit();
				this.selectEmpresa = this.clientes[0].empresa_id;
				// carga los proyectos que el usuario tenga asociados
				this.cargarEsquemas();
			}, 50);
		});
	}
	// carga los esquemas del usuario
	cargarEsquemas() {
		this.proyectoService.getProyectos(this.usuario.id, this.selectEmpresa).subscribe((res) => {
			this.esquema = res.esquemas[0];
			// this.cargarGraficos();
		});
	}
	// identifica la columna de los datos que el usuario quiere guardar
	seleccion(pos) {
		if (this.headerSave.indexOf(this.header[pos]) >= 0) {
			this.headerSave[pos] = '';
		} else {
			this.headerSave[pos] = this.header[pos];
		}
	}
	//guarda los datos del archivo en una tabla como indica el usuario
	guardarTabla(stepper: MatStepper, sidenav: MatSidenavContainer) {
		if (this.nameTable != undefined && this.nameTable != '') {
			if (this.prepararDatos()) {
				var info = new Array();
				info.push(this.header);
				for (var i = 0; i < this.datos.length; i++) {
					info.push(this.datos[i]);
				}
				stepper.next(); //siguente paso
				sidenav.open(); //abre el panel interno
				this.carrgarTablas(); // cargar tablas
				this.uploadService
					.sendInfoTable(this.usuario.id, this.selectEmpresa, this.nameTable, info)
					.subscribe((res) => {});
			}
		} else {
			this.translate.get('ALERT_NAME_TABLE').subscribe((msn) => {
				M.toast({ html: msn });
			});
		}
	}
	//organiza los datos de acuerdo a la seleccion de columnas por parte del usuario
	prepararDatos() {
		for (let j = 0; j < this.headerSave.length; j++) {
			if (this.headerSave[j] == '') {
				this.headerSave.splice(j, 1);
				this.header.splice(j, 1);
				for (var i = 0; i < this.datos.length; i++) {
					this.datos[i].splice(j, 1);
				}
			}
		}
		return true;
	}
	// consulta las tablas que tenga el usuario
	carrgarTablas() {
		this.uploadService.getTables(this.selectEmpresa, 1, 10).subscribe((res) => {
			this.tablas = res;
			// se espera un momento para inicializar los campos select
			setTimeout(() => {
				M.AutoInit();
				this.selectTable = this.tablas[0].nomb_tabla;
				this.isDisableOrigen = '';
				this.IcondesableOri = 'iconos-origen';
				this.cargarColumnas();
			}, 50);
		});
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
				}
			});
	}
	// evento del drag and drop entre ejes y columnas
	drop(event: CdkDragDrop<string[]>, lista: string) {
		// debugger; // permite poner un alto dentro de las funciones

		if (event.previousContainer === event.container) {
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
			setTimeout(() => {
				this.columnas = this.columnasTemp;
			}, 100);
		} else {
			copyArrayItem(
				event.previousContainer.data,
				event.container.data,
				event.previousIndex,
				event.currentIndex
			);
		}
	}
	// identifica el cambio de operacion dentro del eje x
	changeSelectOperationEjex(e, index) {
		this.operEjeX[index] = e.value;
	}
	// identifica el cambio de operacion dentro del eje y
	changeSelectOperationEjey(e, index) {
		this.operEjeY[index] = e.value;
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
					backgroundColor: 'rgb(232, 79, 110)',
					borderColor: 'rgb(232, 79, 110)',
					borderCapStyle: 'round',
					borderWidth: 3,
					hoverBackgroundColor: 'yellow',
					hoverBorderColor: 'yellow',
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
					backgroundColor: this.appComponen.colores,
					borderColor: this.appComponen.colores,
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
					backgroundColor: this.appComponen.colores,
					borderColor: this.appComponen.colores,
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
	getChart(context, chartType, data, options?) {
		this.chartGenerate = new Chart(context, {
			data,

			options: {
				legend: {
					display: true
				},
				scales: {
					xAxes: [
						{
							stacked: true
						}
					],
					yAxes: [
						{
							stacked: true
						}
					]
				},
				events: [ 'mousemove', 'mouseout', 'click', 'touchstart', 'touchmove', 'touchend' ],
				tooltips: {
					mode: 'point'
				}
			},
			type: chartType
		});
		return this.chartGenerate;
	}

	// permite cargar loa informacion  de la tabla seleccionada, con los parametros indicados
	getInfo() {
		if (this.selectGraphType != undefined) {
			if (this.operEjeY[0] != undefined && this.ejey[0] != undefined) {
				this.campoY = this.operEjeY[0] + '(' + this.ejey[0] + ')';
				this.campoX = this.ejex[0];
				this.infoTable = []; // inicializo la variable que muestra la info en la tabla
				this.datosEjeX = []; // inicia el arreglo de los datos del eje x
				this.datosEjeY = []; // inicia el arreglo de los datos del eje Y

				switch (this.ejey.length) {
					case 1: // caso de una sola columna en y
						this.graficosService
							.getQueryGraph(
								this.selectTable,
								this.campoX,
								this.campoY,
								this.esquema.nombre
							)
							.subscribe((res) => {
								this.infoTable = res;
								this.infoTable.map((campo, key) => {
									this.datosEjeX[key] = campo.campoX;
									this.datosEjeY[key] = campo.campoY;
								});
								setTimeout(() => {
									this.tiposGraficas(
										this.selectGraphType,
										this.lineCanvas.nativeElement
									);
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
	// identifica y decide que funcionar usar de acuerdo al tipo de grafica seleccionado
	tiposGraficas(tipo, canvas) {
		switch (tipo) {
			case 'bar':
				this.lineChart = this.getBarChart(canvas);
				break;
			case 'line':
				this.lineChart = this.getLineChart(canvas);
				break;
			case 'pie':
				this.lineChart = this.getPieChart(canvas);
				break;
			case 'doughnut':
				this.lineChart = this.getDoughnutChart(canvas);
				break;

			default:
				break;
		}
	}
	// guarda la grafica que el usuario genera
	guardarGrafica(stepper: MatStepper, sidenav: MatSidenavContainer) {
		if (this.nameGraph != undefined && this.nameGraph != '') {
			if (
				this.datosEjeX != undefined &&
				this.datosEjeX.length != 0 &&
				(this.datosEjeY != undefined && this.datosEjeY.length != 0)
			) {
				let dataArray = {
					labels: this.datosEjeX,
					data: this.datosEjeY,
					label: this.campoY
				};
				let dataset = JSON.stringify(dataArray);
				this.cargarGraficos(); //cargar graficas
				stepper.next(); //siguente paso
				sidenav.close(); //abre el panel interno

				this.graficosService
					.guardarGrafica(this.nameGraph, dataset, this.esquema.nombre, this.type)
					.subscribe((res) => {
						if (res.success) {
							this.cargarGraficos(); //cargar graficas
							stepper.next(); //siguente paso
							sidenav.close(); //abre el panel interno
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
	// consulta las graficas que el usuario tiene para el cliente seleccionado
	cargarGraficos() {
		this.graficosService
			.getGraficos(this.esquema.nombre, this.selectEmpresa)
			.subscribe((res) => {
				if (res.success) {
					this.isDisableGraph = '';
					this.IcondesableGra = 'iconos-graficos';
					this.graficas = res.graficos;
				}
			});
	}

	// identifica el cambio de tipo de grafica
	cambiaTipo(e) {
		setTimeout(() => {
			if (this.chartGenerate != undefined) {
				this.chartGenerate.destroy();
			}
			this.tiposGraficas(this.selectGraphType, this.lineCanvas.nativeElement);
		}, 150);
	}
	// guardr el esapacio de trabajo
	guardarEspacio() {
		if (this.nameWorkSpace != undefined && this.nameWorkSpace != '') {
			let copyArray = this.graphData.slice();
			// Se parsea la cadena del dataset
			copyArray.map((obj, key) => {
				copyArray[key].dataset = JSON.parse(obj.dataset);
			});
			let data_graph = JSON.stringify(copyArray);

			this.graficosService
				.guardarEspacioTrabajo(data_graph, this.nameWorkSpace, this.esquema.id)
				.subscribe((res) => {
					this.omitirTutorial();
				});
		} else {
			this.translate.get('ALERT_NAME_WORK_SPACE').subscribe((msn) => {
				M.toast({ html: msn });
			});
		}
	}

	// drop de la lista de origen de los datos
	dropOrigen(event: CdkDragDrop<string[]>) {}
	// drop de la lista de graficos
	dropGraficos(event: CdkDragDrop<string[]>) {
		if (event.previousContainer === event.container) {
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
			setTimeout(() => {
				this.columnas = this.columnasTemp;
			}, 100);
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
		this.dataDrop = event.container.data;
		// se obtiene el tipo de grafica
		let tipo = this.dataDrop[event.currentIndex].type;
		// Se revierte a objeto la cadena del dataset de la grafica guardada
		let datasetGraph = JSON.parse(this.dataDrop[event.currentIndex].dataset);

		this.graphData[event.currentIndex].cols = '2';
		this.graphData[event.currentIndex].rows = '2';

		setTimeout(() => {
			let mapEle: HTMLElement = document.getElementById('lineCanvas_' + event.currentIndex);

			this.datosEjeX = datasetGraph.labels;
			this.datosEjeY = datasetGraph.data;
			this.campoY = datasetGraph.label;
			this.tiposGraficas(tipo, mapEle);
		}, 100);
	}
}
