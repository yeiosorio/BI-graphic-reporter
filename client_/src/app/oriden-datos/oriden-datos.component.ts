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
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Chart } from 'chart.js';

import * as moment from 'moment';
import { GraficosService } from 'src/services/graficos/graficos.service';
import { Observable, Observer } from 'rxjs';
import { FormControl } from '@angular/forms';

export interface TabTable {
	id: number;
	nombre: string;
	content: string;
}
declare var M: any;

@Component({
	selector: 'app-oriden-datos',
	templateUrl: './oriden-datos.component.html',
	styleUrls: ['./oriden-datos.component.css']
})
export class OridenDatosComponent implements OnInit {
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
	//dataSource: MatTableDataSource<any>  ;
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

	// tabs
	asyncTabs: any[];

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
	espacios: {};
	/// origen de los datos ind
	selected = new FormControl(0);
	creando: boolean = false; // permite identificar si se esta creando una nueva tabla
	dataSources: any[] = [];
	headers: any[] = [];
	dataSource: any = [];
	constructor(
		private appComponent: AppComponent,
		private router: Router,
		private _formBuilder: FormBuilder,
		private papa: Papa,
		private proyectoService: ProyectoService,
		private graficosService: GraficosService,
		private uploadService: UploadService,
		private translate: TranslateService
	) {
		//tabs
		this.asyncTabs = [];
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
		this.header = [];
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
	cargarTabs(id, nombre, content, creando) {
		const nuevaTab = { id: id, nombre: nombre, content: content, creando: creando };

		this.asyncTabs.push(nuevaTab);
		this.selected.setValue(this.asyncTabs.length - 1);
	}
	// identifica el cambio del nombre de la tabla
	changeNomTable(index) {
		this.asyncTabs[index].nombre = this.nameTable;
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
	fileUploads(event, index) {
		this.files = event.target.files;
		if (this.files != undefined && this.files != '') {
			this.cargarDatos(index);
		}
	}
	// identifica la columna de los datos que el usuario quiere guardar
	seleccion(pos) {
		if (this.headerSave.indexOf(this.header[pos]) >= 0) {
			this.headerSave[pos] = '';
		} else {
			this.headerSave[pos] = this.header[pos];
		}
	}
	// lee el archivo seleccionado y lo muestra en un datatable
	cargarDatos(index) {
		console.log('datos csv');
		if (this.files && this.files.length > 0) {
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
						this.asociarData(index, this.datos, this.header);
					}
				});
			};
		} else {
			this.translate.get('ALERT-SELECT-FILE').subscribe((msn) => {
				M.toast({ html: msn });
			});
		}
	}

	asociarData(index, datos, header) {
		this.headers[index] = header;
		this.dataSources[index] = new MatTableDataSource(datos);
	}
	cambioTab(index) {
		console.log('ccambio tab ' + index);
		if (this.asyncTabs.length > 1) {
			this.header = this.headers[index];
			this.displayedColumns = this.header;
			this.dataSource = new MatTableDataSource(this.dataSources[index]);
		}
	}

	// si le da click en omitir tutorial
	omitirTutorial() {
		this.proyectoService.omitirTutorial(this.usuario.id, 1).subscribe((res) => {
			if (res.success) {
				this.router.navigate(['/inicio']);
			}
		});
	}
	// carga los clientes del usuario
	cargarClientes() {
		this.proyectoService.getClientes(this.usuario.id).subscribe((res) => {
			this.clientes = res.empresas;
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
			this.carrgarTablas();
			this.cargarGraficos();
			this.cargarEspaciosTrabajo();
		});
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
			}, 50);
		});
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

	cargarEspaciosTrabajo() {
		this.graficosService
			.getEspaciosTrabajo(this.usuario.id, this.selectEmpresa)
			.subscribe((res) => {
				if (res.success) {
					this.isDisableSpace = '';
					this.IcondesableEsp = 'iconos-espacios';
					this.espacios = res.espacios_trabajo;
				}
			});
	}

	// drop de la lista de origen de los datos
	dropOrigen(event: CdkDragDrop<string[]>) { }
	// drop de la lista de espacios de trabajo
	dropEspacios(event: CdkDragDrop<string[]>) { }
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
	// abre la tabla en una pestaña nueva cuando se da clic sobre la lista
	abrirTabla(id) {
		this.cargarTabs(id, this.tablas[id].nombre, '', false);
		this.cargarInfoTabla(this.tablas[id].nombre, this.tablas[id].nomb_tabla);
	}
	// guardar tabla
	guardarTabla(index) {
		// cambia el estado creando dentro del tab
		if (this.nameTable != undefined && this.nameTable != '') {
			if (this.prepararDatos()) {
				var info = new Array();
				info.push(this.header);
				for (var i = 0; i < this.datos.length; i++) {
					info.push(this.datos[i]);
				}

				this.uploadService
					.sendInfoTable(this.usuario.id, this.selectEmpresa, this.nameTable, info)
					.subscribe((res) => {
						this.carrgarTablas(); // cargar tablas
						this.asyncTabs[index].creando = false;
					});
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
	// agrega un nuevo tab
	nuevaTabla() {
		this.cargarTabs('', '', '', true);
	}

	cargarInfoTabla(nombre, nombre_tabla) {
		this.header = [];
		this.columnas = [];
		console.log('indice');
		console.log(this.asyncTabs.length - 1);
		let idx = this.asyncTabs.length - 1;

		this.uploadService.getColumnasTabla(nombre_tabla, this.selectEmpresa).subscribe((res) => {
			if (res.success) {
				this.col = res.desc_tabla;
				this.graficosService.getInfoTable(this.selectEmpresa, nombre).subscribe((res) => {
					this.col.map((columna, key) => {
						this.header[key] = columna.Field;
					});
					this.datos = res;
					this.datos.map((item, key) => {
						this.datos[key] = Object.values(this.datos[key]);
					});

					setTimeout(() => {
						this.displayedColumns = this.header;
						this.dataSource = new MatTableDataSource(this.datos);
						this.dataSource.paginator = this.paginator;
						this.dataSource.sort = this.sort;
						this.asociarData(idx, this.datos, this.header);
					}, 50);
				});
			}
		});
	}
}
