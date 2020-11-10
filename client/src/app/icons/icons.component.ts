import { Component, OnInit } from "@angular/core";

import { GlobalService } from "src/app/services/global/global.service";
import { MatSnackBar, MatRadioChange } from "@angular/material";
import { UploadService } from "src/app/services/upload/upload.service";
import { listOperaciones } from "../interfaces/listOperaciones";
import { GraficosService } from "src/app/services/graficos/graficos.service";
import { ejeValue, fieldCDK, opensFieldsCDK } from "../interfaces/listFieldCDK";
import * as _ from "lodash";
import { userSchemInfoInterface } from "../interfaces/inicio.interfaces";
import { iconsService } from "src/app/services/iconos/icons.service";
import { iconInterface, imagesInterface } from "../interfaces/icons.interfaces";

@Component({
  selector: "app-icons",
  templateUrl: "./icons.component.html",
  styleUrls: ["./icons.component.css"]
})
export class IconsComponent implements OnInit {
  // Datos generales
  tables: Array<any>; //Guarda las tablas cargadas para el menu crear grafica
  fieldsTable: Array<Array<ejeValue>>;
  operationList: []; //Contiene las operaciones para cada tipo de dato en la columna
  imageList: Array<imagesInterface>;
  disabledItems = {
    createButton: true,
    saveButton: true,
    saveChangesButton: true
  };

  //Modelos para los iconos
  //private esquema: {id:number, nombre:string};
  private userSchemInfo: userSchemInfoInterface; //Observa la empresa seleccionada en el menú del componente inicio
  openIcons: Array<iconInterface>;
  backupDataIconEdit: {};
  tabSelect: number = 0;

  constructor(
    private globalService: GlobalService,
    private uploadService: UploadService,
    private iconService: iconsService,
    private snackBar: MatSnackBar
  ) {
    this.openIcons = new Array<iconInterface>();
    this.tables = new Array<any>();
    this.operationList = [];

    this.fieldsTable = new Array<Array<ejeValue>>();

    this.imageList = new Array<imagesInterface>();
  }

  ngOnInit() {
    // Observable que obtiene la empresa seleccionada en el menu principal
    this.globalService.getSelectEmpresa().subscribe(
      res => {
        this.userSchemInfo = res;
      },
      error => {}
    );

    this.globalService.getSelectIcon().subscribe(icon => {
      if (icon) {
        
        icon.stateCreation = 'Created'
        this.openIcons = [...this.openIcons, icon];
        this.tabSelect = this.openIcons.length - 1;
        this.loadColumns();
        this.loadOperation(icon.field.ejeValue.tipo);
      }
    });

    // Observable que obtiene las tablas cargadas en el menu
    this.globalService.getListTablas().subscribe(
      res => {
        try {
          if (res) {
            this.tables = res;
          }
        } catch (error) {}
      },
      error => {}
    );

    this.loadImages();
  } //Fin ngOnInit

  loadImages() {
    this.iconService.getImages().subscribe(res => {
      if (res.success) {
        this.imageList = res.result;
      }
    });
  }

  createIcon() {
    const icon = {} as iconInterface;
    icon.field = { ejeValue: {} as ejeValue, table: ''};
    icon.field.ejeValue = {} as ejeValue;
    icon.image = {} as imagesInterface;
    icon.onlyText = false;
    icon.textValue = '';
    icon.stateCreation = 'New'
    this.openIcons = [...this.openIcons, icon];
    this.tabSelect = this.openIcons.length - 1;
  }

  //Carga las columnas de la tabla seleccionada en el menu de seleccion de ejes
  loadColumns() {
    //Quita las columnas cuando se cambia de tabla en el select list
    this.fieldsTable[this.tabSelect] = new Array<ejeValue>();
    const tableSelect = this.openIcons[this.tabSelect].field.table;
    if (tableSelect) {
      this.uploadService
        .getColumnasTabla(tableSelect, this.userSchemInfo.business.id)
        .subscribe(res => {
          if (res.success) {
            const cols = res.desc_tabla;
            cols.map(elem => {
              let { Field, Type } = elem;
              const eje = {} as ejeValue; // Agregar los valores
              eje.nombre = Field;
              //Elimina cualquier caracter que no sea del abecedario, ejemplo "varchar(200)" queda como "varchar"
              eje.tipo = this.defineType(Type.toLowerCase());
              this.fieldsTable[this.tabSelect] = [
                ...this.fieldsTable[this.tabSelect],
                eje
              ];
            });
          }
        });
    }
  } // Fin cargarColumnas

  //Elimina cualquier caracter que no sea del abecedario, ejemplo "varchar(200)" queda como "varchar"
  defineType = tipo => {
    if (tipo.search("int") !== -1 || tipo.search("double") !== -1) {
      return "number";
    } else if (tipo.search("datetime") !== -1) {
      return "datetime";
    } else if (tipo.search("varchar") !== -1) {
      return "varchar";
    } else {
      return "default";
    }
  };

  //Carga la lista de las operaciones disponible segun el tipo de dato de la columna seleccionada
  loadOperation(tipo: string) {
    tipo = tipo !== "number" ? "defaultIcon" : "numberIcon";
    this.operationList = new listOperaciones()[tipo];
  }

  //Cierra la pestaña de l icono
  closeGraph(i: number) {
    if (this.openIcons.length - 1 === this.tabSelect && this.tabSelect > 0) {
      this.tabSelect--;
    }
    this.openIcons.splice(i, 1);
  }

  //Consume un servicio para calcular los datos del eje y operacion seleccionada
  getInfo() {
    //consulta el resultado de la operacion del campo
    this.iconService
      .doCalculate(
        this.openIcons[this.tabSelect].field.ejeValue,
        this.userSchemInfo.business,
        this.openIcons[this.tabSelect].field.table
      )
      .subscribe(res => {
        if (res.success) {
          this.disabledItems.saveChangesButton = false;
          this.openIcons[this.tabSelect].textValue += res.result[0];
        }
      });
  }

  changeTab(index) {
    if (this.openIcons.length > 0) {
      this.tabSelect = index;
    } else {
      this.tabSelect = 0;
    }
  }

  saveIcon(icon: iconInterface) {
    icon.businessID = this.userSchemInfo.business.id;
    this.iconService.saveIcon(icon).subscribe(res => {
      if (res.success) {

        icon.stateCreation = 'Created'
        //Emite el evento por el observable para que cargue los graficos con datos frescos en el menu principal
        this.globalService.successAddIcon();

        this.snackBar.open("Se guardo el icono");
      } else {
        this.snackBar.open("Ocurrio un error");
      }
    });
  }

  /*
  cambiarEstado(estado) {
    this.graficasAbiertas[this.tabSelect].estadoCreacion = estado;
  }*/
  limpiarEjes(fieldValue) {
    fieldValue.x = new Array<ejeValue>();
    fieldValue.y = new Array<ejeValue>();
  }
}
