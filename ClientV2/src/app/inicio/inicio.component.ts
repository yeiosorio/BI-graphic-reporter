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
import { UsuarioService } from 'src/services/Login/login.service';
import { GlobalService } from 'src/services/global/global.service';
declare var M: any;

@Component({
	selector: 'app-inicio',
	templateUrl: './inicio.component.html',
	styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
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

	listGraph = [{ id: 1, nombre: 'img1' }, { id: 2, nombre: 'img2' }];

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
		console.log("cargarclientes")
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
				this.router.navigate(['/inicio']);
			}
		});
	}
	// carga los clientes del usuario
	cargarClientes() {
		this.proyectoService.getClientes(this.usuario.id).subscribe((res) => {
			this.clientes = res.empresas;
			this.selectEmpresa = this.globalService.getSelectClient();

				//Si es primer ingreso a la plataforma, toma el primer registro de cliente
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
			console.log("carga esquemas", this.esquema);
			this.carrgarTablas();
			this.cargarGraficos();
			this.cargarEspaciosTrabajo();
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

	// consulta las tablas que tenga el usuario
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
	// identifica que cambia de cliente
	cambiaCliente() {
		this.globalService.setSelectClient(this.selectEmpresa);
		this.graficas = [];
		this.tablas = [];
		this.espacios = [];
		this.cargarEsquemas();
	}

	// Abre la tabla seleccionada
	abrirTabla(id){
		this.globalService.setSelectTable(id);
		this.router.navigate(['/origenDatos']);
	}
}
