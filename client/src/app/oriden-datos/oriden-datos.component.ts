import { ProyectoService } from 'src/app/services/proyecto/proyecto.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../app.component';
import { RouterModule, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Papa } from 'ngx-papaparse';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { MatStepper, MatSidenavContainer } from '@angular/material';
import { UploadService } from '../services/upload/upload.service';
import { log } from 'util';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Chart } from 'chart.js';

import * as moment from 'moment';
import * as XLSX from 'xlsx';

import { GraficosService } from 'src/app/services/graficos/graficos.service';
import { Observable, Observer, Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { GlobalService } from 'src/app/services/global/global.service';
import { userSchemInfoInterface } from '../interfaces/inicio.interfaces';

export interface TabTable {
	id: number;
	nombre: string;
	content: string;
}

declare var M: any;

@Component({
	selector: 'app-oriden-datos',
	templateUrl: './oriden-datos.component.html',
	styleUrls: [ './oriden-datos.component.css' ]
})
export class OridenDatosComponent implements OnInit {
	dataDrop: any;
	graficas: {};
	type: string;
	// stepper
	isLinear = false; // comportamiento de los pasos del tutorial
	isEditable = true; // si es editable los pasos del tutorial
	isDisable = true; // ver el listado de origenes de datos, graficas y espacios

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


	//selectEmpresa: number; // empresa seleccionada
	userSchemInfo: userSchemInfoInterface;
	selectTable: string; // tabla seleccionada
	selectGraphType: string; // tipo de graafica seleccionado
	tablas: any; // tablas del usuario autenticado seleccionadas

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
	tamano: any;
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
	agregadosIdx: any = [];
	totalfilas: any;
	duplicateColunms: any = [];
	indexInfoFile: any = [];
	loadingCsv = false
	typeExtension = false

	private tableIn$: Observable<any>;

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
		this.tablas = new Array<any>();

		//tabs
		this.asyncTabs = [];

		// permite obtener la informacion del usuario autenticado
		this.usuario = JSON.parse(sessionStorage.getItem('usuario'));
		this.margiLeftDinamic = 'margin-left-dinamic1';
		this.expand2 = 'tam-row-lateral2';
		this.expand = 'tam-row-lateral';
		this.verEnMenu = true;

		this.header = [];

		
	}

	ngOnInit() {
		// Observable que apunta a la tabla del cliente seleccionada, cuando se cambia se deben cambiar las tablas en este componente para la creacion de la gráfica
		this.globalService.getSelectEmpresa().subscribe(res => {
			this.userSchemInfo = res;
		});
		// inicia los componentes de materialize
		setTimeout(() => {
			M.AutoInit();
		}, 100);
		// carga los clientes que el usuario tenga asociados
		this.globalService.getSelectTable().subscribe((res) => {
			if(res){
				this.abrirTabla(res);
			}
		});

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

	
	// identifica la columna de los datos que el usuario quiere guardar
	seleccion(pos) {
		if (this.headerSave.indexOf(this.header[pos]) >= 0) {
			this.headerSave[pos] = '';
		} else {
			this.headerSave[pos] = this.header[pos];
		}
	}
	
	// identifia cuando se selecciona un archivo csv
	fileUploads(event, index) {
		this.loadingCsv = true;
		this.files = event.target.files;
		let extension = this.files[0].name.split('.').pop();

		if (this.files != undefined && this.files != '') {
			if (extension != 'xlsx' && extension != 'xls' && extension != 'csv' ) {
				this.typeExtension = true
				this.tamano = "";
				this.loadingCsv = false;
				this.duplicateColunms = [];
				
			}else{
				this.typeExtension = false
				if (extension == 'xlsx' || extension == 'xls') {
					this.cargarDatosExcel(index, event.target);
					
				}else{
					this.cargarDatosCsv(index);
				}
			}
		}
	}
	/**
	 * @author Yeison osorio
	 * @desc Lee archivo tipo excel y lo carga a al [mtDataTable]
	  */
	cargarDatosExcel(index, event) {
		if (this.files && this.files.length > 0) {
			const reader: FileReader = new FileReader();
			reader.onload = (e: any) => {
				const result: string = e.target.result;
				const workbook: XLSX.WorkBook = XLSX.read(result, {type: 'binary'});

				/* primer hoja de excel */
				const wsname: string = workbook.SheetNames[0];
				const worksheet: XLSX.WorkSheet = workbook.Sheets[wsname];

				let dataExcel = (XLSX.utils.sheet_to_json(worksheet, {header: 1}));

				console.log(dataExcel);
				/* Push dataTable BI */
				this.duplicateColunms = dataExcel.filter((item, index, array) => {
					return array.indexOf(item) !== index;
				  })
				this.datos = dataExcel.slice();
				this.datos.splice(0, 1);
				this.loadingCsv = false;
				this.tamano = this.bytesToSize(this.files[0].size)
				this.totalfilas = this.datos.length;
				
				// Si no hay columnas duplicadas carga los datos a la tabla						
				if (this.duplicateColunms.length == 0) {
					this.duplicateColunms = [];
					this.header = dataExcel[0];
					this.displayedColumns = this.header;
					this.headerSave = Object.assign([], this.header);
					
					this.dataSource = new MatTableDataSource(this.datos);
					this.dataSource.paginator = this.paginator;
					this.dataSource.sort = this.sort;
					this.asociarData(index, this.datos, this.header);
				}
				
			  };
			  reader.readAsBinaryString(event.files[0]);


		} else {
			this.translate.get('ALERT-SELECT-FILE').subscribe((msn) => {
				M.toast({ html: msn });
			});
		}
	}

	// lee el archivo seleccionado y lo muestra en un datatable
	cargarDatosCsv(index) {
		// // console.log('datos csv');
		if (this.files && this.files.length > 0) {
			const file: File = this.files.item(0);
			const reader: FileReader = new FileReader();
			reader.readAsText(file);
			reader.onload = (e) => {

				this.papa.parse(file, {
					complete: (result) => {
						
						this.duplicateColunms = result.data[0].filter((item, index, array) => {
                            return array.indexOf(item) !== index;
                          })
						this.datos = result.data.slice();

						console.log('datos csv')
						console.log(this.datos)
						
						this.datos.splice(0, 1);
						this.loadingCsv = false;
						this.tamano = this.bytesToSize(this.files[0].size)
						this.totalfilas = this.datos.length;
						
						// Si no hay columnas duplicadas carga los datos a la tabla						
						if (this.duplicateColunms.length == 0) {
							this.duplicateColunms = [];
							this.header = result.data[0];
							this.displayedColumns = this.header;
							this.headerSave = Object.assign([], this.header);
							
							this.dataSource = new MatTableDataSource(this.datos);
							this.dataSource.paginator = this.paginator;
							this.dataSource.sort = this.sort;
							this.asociarData(index, this.datos, this.header);
						}
						
					}
				});
			};
		} else {
			this.translate.get('ALERT-SELECT-FILE').subscribe((msn) => {
				M.toast({ html: msn });
			});
		}
	}

	// Conversion de tamaño de bytes a Kb.
	bytesToSize(bytes) {

		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
		if (bytes === 0) return 'n/a'
		const i = Math.floor(Math.log(bytes) / Math.log(1024))
		if (i === 0) return `${bytes} ${sizes[i]})`
		return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`
	  }

	// asocia la informacion que se consulta o
	asociarData(index, datos, header) {
		this.headers[index] = header;
		this.dataSources[index] = datos;
	}
	// identifica que se ha cambiado de tab -> tabla, de esta manera carga la info correspondiente a ella
	cambioTab(index) {
		if (this.asyncTabs.length > 1) {
			this.duplicateColunms = [];
			this.tamano = 0;
			this.header = this.headers[index];
			this.displayedColumns = this.header;
			this.dataSource = new MatTableDataSource(this.dataSources[index]);
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


	// identifica si la seleccion de la tabla cmabia, para cargar las nuevas columnas
	changeSelectTable(e) {
		// reinicia los arreglos de los ejes
		this.ejex = [];
		this.ejey = [];
		this.operEjeX = [];
		this.operEjeY = [];
	}

	// drop de la lista de origen de los datos
	dropOrigen(event: CdkDragDrop<string[]>) {}


	// abre la tabla en una pestaña nueva cuando se da clic sobre la lista
	abrirTabla([key, tabla]) {

		this.tablas[key] = tabla;
		let idx = tabla.tabla_id;
		if (!this.agregadosIdx.includes(idx)) {
			this.duplicateColunms = [];
			this.tamano = 0;
			this.agregadosIdx[this.asyncTabs.length] = idx;
			this.cargarTabs(tabla.tabla_id, tabla.nombre, '', false);
			this.cargarInfoTabla(tabla.nombre, tabla.nomb_tabla);
		} else {
			this.selected.setValue(key);
		}
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
					.sendInfoTable(this.usuario.id, this.userSchemInfo.business.id, this.nameTable, info)
					.subscribe((res) => {
						if (res.success) {
							this.duplicateColunms = [];
							this.tamano = 0;
							this.nameTable = '';
							this.asyncTabs[index].creando = false;
							this.agregadosIdx[index] = res.insert_id;
							this.globalService.successAddDataOrigin();
						}
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
		this.duplicateColunms = [];
		this.tamano = 0;
		this.cargarTabs('', '', '', true);
	}

	// carga la informacion de la tabla que esta en la base de datos
	cargarInfoTabla(nombre, nombre_tabla) {
		this.header = [];
		this.columnas = [];
		// // console.log('indice');
		// // console.log(this.asyncTabs.length - 1);
		let idx = this.asyncTabs.length - 1;
		this.graficosService.getInfoTable(this.userSchemInfo.business.id, nombre, false).subscribe((res) => {
			
			if(res.success){
				this.header = res.headers;
				this.datos = res.columns;
				setTimeout(() => {
					this.displayedColumns = this.header;
					this.dataSource = new MatTableDataSource(this.datos);
					this.dataSource.paginator = this.paginator;
					this.dataSource.sort = this.sort;
					this.asociarData(idx, this.datos, this.header);
				}, 50);
			}
		});/*
		this.uploadService.getColumnasTabla(nombre_tabla, this.userSchemInfo.clientID).subscribe((res) => {
			if (res.success) {
				this.col = res.desc_tabla;
				this.graficosService.getInfoTable(this.userSchemInfo.clientID, nombre, false).subscribe((res) => {
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
		});*/
	}


}
