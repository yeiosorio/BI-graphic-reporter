import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { UploadService } from '../../services/upload/upload.service';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { AppComponent } from '../app.component';
import { NgGridConfig, NgGridItemConfig, NgGridItemEvent, NgGrid } from 'angular2-grid';

interface Box {
	id: number;
	config: NgGridItemConfig;
	nombre: string;
}

declare var M: any;

@Component({
	selector: 'app-upload',
	templateUrl: './upload.component.html',
	styleUrls: [ './upload.component.css' ],

	providers: [ UploadService ]
})
export class UploadComponent implements OnInit {
	header: any;
	datos: any;
	files: any;
	headerSave: any;
	infHead: any;
	graphData = [];

	// datatable
	//displayedColumns: string[] = [ 'name', 'po' ];
	displayedColumns: string[];
	nameTable: string;
	///////

	@ViewChild(NgGrid) private grid: NgGrid;
	public curNum = 10;
	public boxes: Array<Box> = [];
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
		min_height: 70,
		fix_to_grid: true,
		auto_style: true,
		auto_resize: false,
		maintain_ratio: false,
		prefer_new: false,
		zoom_on_drag: false,
		limit_to_screen: true,
		element_based_row_height: false,
		center_to_screen: true,
		fix_item_position_direction: 'horizontal',
		fix_collision_position_direction: 'horizontal'
	};
	private curItemCheck = 0;

	constructor(
		private papa: Papa,
		private uploadService: UploadService,
		private appComponent: AppComponent
	) {
		this.appComponent.menu1 = 'block';
		this.appComponent.menu2 = 'none';
		// for (let i = 1; i < this.curNum; i++) {
		// 	const conf = this._generateDefaultItemConfig();
		// 	conf.payload = i;
		// 	this.boxes[i - 1] = { id: i, config: conf };
		// }
		const conf = this._generateDefaultItemConfig();
		conf.payload = 1;

		this.boxes[0] = { id: 1, config: conf, nombre: 'grafica 1' };
		const conf2 = this._generateDefaultItemConfig();
		conf2.payload = 2;

		this.boxes[1] = { id: 2, config: conf2, nombre: 'grafica 2' };
	}
	dataSource: MatTableDataSource<any>;
	//datatable
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	///////
	ngOnInit() {
		setTimeout(() => {
			M.AutoInit();
		}, 100);
		//datatable
		// this.dataSource.paginator = this.paginator;
		// this.dataSource.sort = this.sort;
		////
	}
	private _generateDefaultItemConfig(): NgGridItemConfig {
		return { dragHandle: '.handle', col: 1, row: 1, sizex: 1, sizey: 1 };
	}

	applyFilter(filterValue: string) {
		this.dataSource.filter = filterValue.trim().toLowerCase();
	}

	fileUploads(event) {
		this.files = event.target.files;
	}

	cargarDatos() {
		if (this.files && this.files.length > 0) {
			const file: File = this.files.item(0);
			console.log(file.name);
			console.log(file.size);
			console.log(file.type);
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
		}
	}

	seleccion(pos) {
		if (this.headerSave.indexOf(this.header[pos]) >= 0) {
			this.headerSave[pos] = '';
		} else {
			this.headerSave[pos] = this.header[pos];
		}
	}

	guardarTabla() {
		if (this.prepararDatos()) {
			var info = new Array();
			info.push(this.header);
			for (var i = 0; i < this.datos.length; i++) {
				info.push(this.datos[i]);
			}
			console.log(this.nameTable);
			//	this.uploadService.sendInfoTable(info).subscribe((res) => {});
		}
	}

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

	get ratioDisabled(): boolean {
		return (
			(this.gridConfig.max_rows > 0 && this.gridConfig.visible_cols > 0) ||
			(this.gridConfig.max_cols > 0 && this.gridConfig.visible_rows > 0) ||
			(this.gridConfig.visible_cols > 0 && this.gridConfig.visible_rows > 0)
		);
	}

	get itemCheck(): number {
		console.log('get itemCheck');
		console.log(this.curItemCheck);
		return this.curItemCheck;
	}

	set itemCheck(v: number) {
		console.log('set itemCheck');
		console.log(this.curItemCheck);
		console.log(v);

		this.curItemCheck = v;
	}

	get curItem(): NgGridItemConfig {
		console.log('curItem');
		return this.boxes[this.curItemCheck] ? this.boxes[this.curItemCheck].config : {};
	}

	ngAfterViewInit(): void {
		console.log('ngAfterViewInit');
		//  Do something with NgGrid instance here
	}

	setMargin(marginSize: string): void {
		console.log('setmargin');
		console.log(marginSize);

		this.gridConfig.margins = [ parseInt(marginSize, 10) ];
	}

	updateItem(index: number, event: NgGridItemEvent): void {
		// Do something here
		console.log('updateItem');
		console.log(index);
		console.log(event);
	}

	onDrag(index: number, event: NgGridItemEvent): void {
		// Do something here
		console.log('onDrag');
		console.log(index);
		console.log(event);
	}

	onResize(index: number, event: NgGridItemEvent): void {
		// Do something here
		console.log('onResize');
		console.log(index);
		console.log(event);
	}
}
