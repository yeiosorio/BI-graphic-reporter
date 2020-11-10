import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import { NgGridItemEvent } from "angular2-grid";
import {
  WorkSpaceInterface,
  WorkSpaceItemsInterface,
  configItemGridInterface,
  gridConfigClass,
  workspaceClient
} from "../interfaces/WorkSpaces.Interfaces";

import {
  MatTabChangeEvent,
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatTableDataSource,
  MatPaginator,
  MatSort,
  MatSelectChange,
  MatSnackBar
} from "@angular/material";
import { GlobalService } from "src/app/services/global/global.service";
import * as _ from "lodash";
import { Chart } from "chart.js";
import { optionsGrafica } from "../interfaces/iDataCharts";
import { GraficosService } from "src/app/services/graficos/graficos.service";
import { userSchemInfoInterface } from "../interfaces/inicio.interfaces";
import { iconsService } from "src/app/services/iconos/icons.service";
import { TranslateService } from "@ngx-translate/core";
export interface Food {
  value: string;
  viewValue: string;
}

import html2canvas from "html2canvas";
import * as jsPDF from "jspdf";
import { fieldCDK } from "../interfaces/listFieldCDK";

declare var M: any;

@Component({
  selector: "workspace-client-dialog",
  templateUrl: "workspace-client-dialog.html",
  styleUrls: ["./work-space.component.css"]
})
export class WorkspaceClientDialog implements OnInit {
  workSpaceUsers: Array<workspaceClient>;
  constructor(
    public dialogRef: MatDialogRef<WorkspaceClientDialog>,
    @Inject(MAT_DIALOG_DATA) public idWorkSpace: number,
    private globalService: GlobalService
  ) {
    this.workSpaceUsers = new Array<workspaceClient>();
  }

  assignUsersToWorkSpaces() {
    const users = {
      idWorkSpace: this.idWorkSpace,
      users: this.workSpaceUsers.filter(item => item.checked)
    };
    this.globalService.assignUsersToWorkSpace(users).subscribe(res => {
      if (res.success) {
        console.log("Se guardaron exitosamente");
      }
    });
  }
  ngOnInit(): void {
    this.globalService.getWorkspaceUsers(this.idWorkSpace).subscribe(res => {
      if (res.success) {
        this.workSpaceUsers = res.res;
      }
    });
  }

  //this.graficosService.getInfoTable(this.userSchemInfo.clientID, nombre, false).subscribe((res) => {})
}

// ---------------------------- Componente WorkSpace ---------------------------- //

@Component({
  selector: "app-work-space",
  templateUrl: "./work-space.component.html",
  styleUrls: ["./work-space.component.css"]
})
export class WorkSpaceComponent implements OnInit {
  gridConfig = new gridConfigClass().getGridConfig();

  openWorkSpaces: Array<WorkSpaceInterface>;
  backupWorkSpaceToEdit: {};
  tabSelect: number = 0;
  userSchemInfo: userSchemInfoInterface;
  statusCreate: string;
  optionsGraphTypeGroup = [
    {
      name: "Barras",
      options: [{ value: "bar", viewValue: "Barra" }]
    },
    {
      name: "Lineas",
      options: [{ value: "line", viewValue: "Linea" }]
    },
    {
      name: "Sectores",
      options: [
        { value: "pie", viewValue: "Torta" },
        { value: "doughnut", viewValue: "Rosquilla" },
        { value: "radar", viewValue: "Radar" }
      ]
    }
  ];
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private globalService: GlobalService,
    private graphService: GraficosService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private iService: iconsService,
    private translate: TranslateService
  ) {
    this.openWorkSpaces = new Array<WorkSpaceInterface>();
  }

  ngOnInit() {
    setTimeout(() => {
      M.AutoInit();
    }, 100);

    this.addWorkSpaceGraph();
    //Obtiene los datos de la empresa/cliente seleccionado
    this.globalService.getSelectEmpresa().subscribe(
      res => {
        this.userSchemInfo = res;
      },
      error => {}
    );

    this.addWorkSpaceGraph();
    this.openSelectWorkSpace();

    this.globalService.getWorkSpaceIcon().subscribe(res => {
      if (
        res &&
        this.openWorkSpaces[this.tabSelect].creationPhase !== "Created"
      ) {
        const { data, type } = res;
        const idExist = this.openWorkSpaces[this.tabSelect].items
          .reduce((accum, current) => {
            //Filtra los id segun el tipo de grafica a agregar
            return current.type === type
              ? [...accum, current.icon.id]
              : [...accum, null];
          }, [])
          .includes(data.id);
        if (!idExist) {
          //Se añade el nuevo item
          this.openWorkSpaces[this.tabSelect].items = [
            ...this.openWorkSpaces[this.tabSelect].items,
            {
              fieldCDK: null,
              config: {} as configItemGridInterface,
              type: type,
              table: null,
              icon: data,
              chart: undefined,
              id: undefined
            }
          ];
          //Se calcula el indice que queda el nuevo item
          const indexItem =
            this.openWorkSpaces[this.tabSelect].items.length - 1;
          if (!data.onlyText) {
            setTimeout(() => {
              const img = new Image();
              img.src = data.image.url;
              img.onload = () => {
                const canvas = <HTMLCanvasElement>(
                    document.getElementById(`img${this.tabSelect}${data.id}`)
                  ),
                  context = canvas.getContext("2d");
                context.drawImage(
                  img,
                  15,
                  15,
                  200,
                  (100 * img.height) / img.width
                );
              };
            }, 500);
          }
        }
      }
    });
  }

  // Añade un nuevo workspace a los abiertos y Abre una nueva pestaña en el tab group
  newWorkSpace(
    data = {
      date: {
        init: null,
        end: null
      },
      name: "-",
      items: new Array<WorkSpaceItemsInterface>(),
      description: "",
      idSchema: null,
      idWorkSpace: this.openWorkSpaces.length,
      creationPhase: "New"
    }
  ) {
    data.idSchema = this.userSchemInfo.business.id;
    this.openWorkSpaces = [...this.openWorkSpaces, data];
    this.tabSelect = this.openWorkSpaces.length - 1;
  }

  saveWorkSpace() {
    const workSpace = _.cloneDeep(this.openWorkSpaces[this.tabSelect]); //Se clona el objeto para no modificar los datos en el proceso del reduce
    workSpace.items = workSpace.items.reduce((accum, current) => {
      // Saca solo los ids de las graficas o tabla eliminando cualuier otro dato
      current.fieldCDK =
        current.type === "chart"
          ? current.fieldCDK.id
          : current.type === "icon"
          ? current.icon.id
          : current.table.tableID;
      delete current.table;
      return [...accum, current];
    }, []);
    if (workSpace.description !== undefined && workSpace.name !== "") {
      this.graphService.saveWorkSpace(workSpace).subscribe(res => {
        if (res.success) {
          this.openWorkSpaces[this.tabSelect].idWorkSpace = res.idWorkSpace;
          this.openWorkSpaces[this.tabSelect].creationPhase = "Created";
          this.globalService.successAddWorkSpace();
        }
      });
    } else {
      //Agregar alerta info
    }
  }

  saveChangesWorkSpace() {
    const workSpace = _.cloneDeep(this.openWorkSpaces[this.tabSelect]); //Se clona el objeto para no modificar los datos en el proceso del reduce
    workSpace.items = workSpace.items.reduce((accum, current) => {
      // Saca solo los ids de las graficas o tabla eliminando cualuier otro dato
      if (current.chart !== undefined) {
        current.chart = "";
      }
      current.fieldCDK =
        current.type === "chart"
          ? current.fieldCDK.id
          : current.type === "icon"
          ? current.icon.id
          : current.table.tableID;
      delete current.table;
      return [...accum, current];
    }, []);
    if (workSpace.description !== undefined && workSpace.name !== "") {
      this.graphService.saveChangesWorkSpace(workSpace).subscribe(res => {
        if (res.success) {
          this.openWorkSpaces[this.tabSelect].idWorkSpace = res.idWorkSpace;
          this.openWorkSpaces[this.tabSelect].creationPhase = "Created";
          this.globalService.successAddWorkSpace();
        }
      });
    } else {
      console.warn("Ocurrio un problema");
    }
  }

  //Construye Chart grafico
  buildChart(item) {
    if (item.chart) {
      item.chart.destroy();
    }
    const fieldCDK = item.fieldCDK;
    if(item.id !== undefined){
      fieldCDK.id = item.id;
    }
    const data = _.cloneDeep(fieldCDK.dataChart); //Se clona el objeto para evitar error de "JSON Circle" al asignarlo en el data de la generacion del chart y al enviarlo como JSON por un servicio http
    const canvas = <HTMLCanvasElement>(
      document.getElementById("graph" + this.tabSelect + fieldCDK.id)
    );
    const ctx = canvas.getContext("2d");
    item.chart = new Chart(ctx, {
      type: fieldCDK.tipoGrafica,
      data: data,
      options: new optionsGrafica().getOptions(fieldCDK.tipoGrafica, data)
    });
  }

  
  saveChangesGraph(fieldCDK: fieldCDK) {
    const fieldCDKClone = _.cloneDeep(fieldCDK);
    this.graphService
      .editarGrafico(
        fieldCDKClone.nombreGrafica,
        fieldCDKClone.id,
        JSON.stringify(fieldCDKClone),
        fieldCDKClone.tipoGrafica
      )
      .subscribe(res => {
        if (res.success) {
          //Emite el evento por el observable para que cargue los graficos con datos frescos en el menu principal
          this.globalService.successAddGraph();
          //Emite el evento por el observable para que cargue los graficos con datos frescos en el menu principal
          this.snackBar.open("Se guardaron los cambios exitosamente", "!", {
            duration: 5000
          });
        } else {
          this.snackBar.open("Ocurrió un error al guardar los cambios", "x", {
            duration: 5000
          });
        }
      });
  }

  tabChanged(event: MatTabChangeEvent) {
    console.log("tabChanged", event.index);

    setTimeout(() => {
      this.openWorkSpaces[event.index].items.forEach((item, index) => {
        if (item.type === "chart") {
          this.buildChart(item);
        }
        if (item.type === "icon") {
          this.drawImageIcon(item.icon, index);
        }
      });
    }, 750);
  }

  changeTypeGraph(event: MatSelectChange, item) {
    this.buildChart(item);
  }

  //Cierra la pestaña del espacio de trabajo abierto
  closeGraph(i: number) {
    //Cambia la pestaña activa restando 1 a la seleccionada mientras no este en la pestaña inicial
    if (
      this.openWorkSpaces.length - 1 === this.tabSelect &&
      this.tabSelect > 0
    ) {
      this.tabSelect--;
    }
    this.openWorkSpaces.splice(i, 1);
  }

  /*
  // Se elimina la grafica del espacio de trabajo en la BD.
  removeItem(items, index, WorkSpaceId) {
    const graphId = items[index].fieldCDK.id;

    this.graphService
      .removeWorkSpaceItem(graphId, WorkSpaceId)
      .subscribe(res => {
        if (res.success) {
          items.splice(index, 1);
          this.translate.get("ALERT-WELCOME").subscribe(msn => {
            M.toast({ html: "La grafica ha sido eliminada con exito!." });
          });
        }
      });
  } */

  //Quita el item del espacio de trabajo
  quitItem(arr: any, i: any): void {
    arr.splice(i, 1);
  }

  //Abre el modal con los usuarios asignados
  openDialog(idWorkSpace): void {
    const dialogRef = this.dialog.open(WorkspaceClientDialog, {
      width: "250px",
      data: idWorkSpace
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed");
    });
  }

  editWorkSpace(workspace: WorkSpaceInterface): void {
    this.backupWorkSpaceToEdit = {
      ...this.backupWorkSpaceToEdit,
      [workspace.idWorkSpace]: _.cloneDeep(workspace)
    };
    workspace.creationPhase = "Editing";
  }

  // Cancela la edición y regresa  a los valores originales
  cancelEditWorkSpace(idWorkSpace: number) {
    this.openWorkSpaces[this.tabSelect] = _.cloneDeep(
      this.backupWorkSpaceToEdit[idWorkSpace]
    );
    this.openWorkSpaces[this.tabSelect].creationPhase = "Created";
    this.globalService.successAddWorkSpace();
    setTimeout(() => {
      this.openWorkSpaces[this.tabSelect].items.map(item => {
        if (item.type === "chart") {
          this.buildChart(item);
        }
      });
    }, 500);
    delete this.backupWorkSpaceToEdit[idWorkSpace]; //Elimina el backup de la grafca que se estaba editando
  }

  // Recbe el item arrastrado y la agrega
  addWorkSpaceGraph() {
    this.globalService.getWorkSpaceGraph().subscribe(res => {
      if (
        res &&
        this.openWorkSpaces[this.tabSelect].creationPhase !== "Created"
      ) {
        //data -> los datos de la grafica o en caso de la tabla el nombre, el id y entre otros datos, type->indica si es chart o tabla
        const { data, type } = res;
        // Valida si la grafica o la tabla ya esta abierta por medio del id
        const idExist = this.openWorkSpaces[this.tabSelect].items
          .reduce((accum, current) => {
            //Filtra los id segun el tipo de grafica a agregar
            return current.type === type
              ? [...accum, current.fieldCDK.id]
              : [...accum, null];
          }, [])
          .includes(
            type === "chart"
              ? data.dataset.id
              : type === "icon"
              ? data.tabla_id
              : data
          );
        if (!idExist) {
          // valida que ya esta inicializado el objeto
          if (this.openWorkSpaces[this.tabSelect].items === undefined) {
            this.openWorkSpaces[this.tabSelect].items = new Array<
              WorkSpaceItemsInterface
            >();
          }
          //Se añade el nuevo item
          this.openWorkSpaces[this.tabSelect].items = [
            ...this.openWorkSpaces[this.tabSelect].items,
            {
              fieldCDK: type === "chart" ? data.dataset : null,
              config: {} as configItemGridInterface,
              type: type,
              table: type === "table" ? data : null,
              icon: null,
              chart: undefined,
              id:undefined
            }
          ];
          //Se calcula el indice que queda el nuevo item
          const indexItem =
            this.openWorkSpaces[this.tabSelect].items.length - 1;

          //Se carga la grafica o la tabla segun el tipo
          type === "chart"
            ? setTimeout(() => {
                // Se utiliza el timeout para esperar que el componente canvas cargue y no presente error -- se debe buscar una mejor forma de implementar esta función
                this.buildChart({ fieldCDK: data.dataset });
              }, 500)
            : this.getInfoTable(
                this.openWorkSpaces[this.tabSelect].items,
                indexItem,
                data.nombre
              );
        }
      }
    });
  }
  //Consulta los datos de la tabla arrastrada
  /**
   *
   * @param itemsWS Referencia a los items del espacio de trabajo
   * @param indexItem Posición del item en el array perteneciente al espacio del trabajo
   * @param tableName nombre de la tabla
   */
  getInfoTable(itemsWS, indexItem, tableName) {
    try {
      this.graphService
        .getInfoTable(this.userSchemInfo.business.id, tableName, false)
        .subscribe(res => {
          if (res.success) {
            //Se guardan los datos de la cabecera
            itemsWS[indexItem].table.header = res.headers;
            //Se guarda los datos de cada fila
            itemsWS[indexItem].table.datos = res.columns;
            //setTimeout(() => {
            //Atributo necesario para el mat table row
            itemsWS[indexItem].table.displayedColumns = res.headers;
            //Se crea el datasource para el mat table
            itemsWS[indexItem].table.dataSource = new MatTableDataSource(
              res.columns
            );
            //Se añade el paginador al datasource
            itemsWS[indexItem].table.dataSource.paginator = this.paginator;
            //}, 50);
          }
        });
    } catch (error) {
      console.error("Ocurrio un error...");
    }
  }
  getInfoIco(iconID: number, indexItem: number) {
    this.iService
      .getIconsID(this.userSchemInfo.business.id, iconID)
      .subscribe(res => {
        if (res.success) {
          this.openWorkSpaces[this.tabSelect].items[indexItem].icon = res.result[0];
          this.drawImageIcon(res.result[0], indexItem);
        }
      });
  }

  drawImageIcon(data, indexItem){
          setTimeout(() => {
            const img = new Image();
            img.src = data.image.url;
            img.onload = () => {
              const canvas = <HTMLCanvasElement>(
                  document.getElementById(`img${this.tabSelect}${data.id}`)
                ),
                context = canvas.getContext("2d");
              context.drawImage(
                img,
                15,
                15,
                200,
                (100 * img.height) / img.width
              );
            };
          }, 500);
  }
  // Abre el workspace seleccionado del menú
  openSelectWorkSpace() {
    //Por este servicio se recibe los datos del espacio de trabajo
    this.globalService.getSelectWorkSpace().subscribe(res => {
      if (res) {
        let [key, workSpace, selectBussines] = res;

        //Valida que el espacio de trabajo no este abierto
        const idExist = this.openWorkSpaces
          .reduce((accum, current) => {
            return [...accum, current.idWorkSpace];
          }, [])
          .includes(workSpace.idWorkSpace);

        if (!idExist) {
          workSpace.creationPhase = "Created";

          //Añade los datos del espacio de trabajo a los que estan abiertos
          this.newWorkSpace(workSpace);
          //setTimeout(() => {
          workSpace.items.map((item, key) => {
            item.type === "chart"
              ? setTimeout(() => {
                  this.buildChart(item);
                }, 500)
              : item.type === "icon"
              ? this.getInfoIco(item.icon.id, key)
              : this.getInfoTable(
                  this.openWorkSpaces[this.tabSelect].items,
                  key,
                  item.table.name
                );
          });
        }
      }
    });
  }

  download() {
		var data = document.getElementById(`ws${this.tabSelect}`);
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
			pdf.text(80, 10, 'Espacio de Trabajo: ' + this.openWorkSpaces[this.tabSelect].name);
			pdf.setFontSize(15); // taamaño
			pdf.text(20, 20, this.openWorkSpaces[this.tabSelect].description);

			pdf.addImage(contentDataURL, 'PNG', 30, position, imgWidth, imgHeight);
			pdf.save('MYPdf.pdf'); // Generated PDF
		});
  }
}
