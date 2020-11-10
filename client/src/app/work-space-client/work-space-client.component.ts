import { Component, OnInit, ViewChild } from "@angular/core";
import {
  WorkSpaceInterface,
  gridConfigClass,
  WorkSpaceItemsInterface,
  configItemGridInterface
} from "../interfaces/WorkSpaces.Interfaces";
import { userSchemInfoInterface } from "../interfaces/inicio.interfaces";
import {
  MatPaginator,
  MatDialog,
  MatTabChangeEvent,
  MatTableDataSource,
  MatSelectChange,
  MatSnackBar
} from "@angular/material";
import { GlobalService } from "src/app/services/global/global.service";
import { GraficosService } from "src/app/services/graficos/graficos.service";
import {
  optionsGrafica,
  iDataSets,
  coloresGraficas,
  iDataCharts
} from "../interfaces/iDataCharts";
import * as _ from "lodash";
import { Chart } from "chart.js";
import { FormControl } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from "@angular/material/core";

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from "moment";
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from "moment";
import { iconsService } from "src/app/services/iconos/icons.service";
import { fieldCDK } from "../interfaces/listFieldCDK";
import { TranslateService } from "@ngx-translate/core";

const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: "YYYY-MM-DD"
  },
  display: {
    dateInput: "YYYY-MM-DD",
    monthYearLabel: "YYYY-MM-DD",
    dateA11yLabel: "L	",
    monthYearA11yLabel: "YYYY-MM-DD"
  }
};



@Component({
  selector: "app-work-space-client",
  templateUrl: "./work-space-client.component.html",
  styleUrls: ["./work-space-client.component.css"],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script. 
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class WorkSpaceClientComponent implements OnInit {

  
  //Congifuracion del modulo de grids
  gridConfig = new gridConfigClass().getGridConfig();

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

  openWorkSpaces: Array<WorkSpaceInterface>;
  backupWorkSpaceToEdit: {};
  tabSelect: number = 0;
  userSchemInfo: userSchemInfoInterface;
  statusCreate: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private globalService: GlobalService,
    private graphService: GraficosService,
    public dialog: MatDialog,
    private iService: iconsService
  ) {
    this.openWorkSpaces = new Array<WorkSpaceInterface>();
  }

  ngOnInit() {
    //Obtiene los datos de la empresa/cliente seleccionado
    this.globalService.getSelectEmpresa().subscribe(
      res => {
        this.userSchemInfo = res;
      },
      error => {}
    );

    this.openSelectWorkSpace();
  }

  // Añade un nuevo workspace a los abiertos y Abre una nueva pestaña en el tab group
  newWorkSpace(
    data = {
      date: {
        init: new FormControl(),
        end: new FormControl()
      },
      name: "-",
      items: new Array<WorkSpaceItemsInterface>(),
      description: "",
      idSchema: null,
      idWorkSpace: this.openWorkSpaces.length,
      creationPhase: 'New'
    }
  ) {
    data.idSchema = this.userSchemInfo.business.id;
    data.date = { init: new FormControl(), end: new FormControl() };
    this.openWorkSpaces = [...this.openWorkSpaces, data];
    this.tabSelect = this.openWorkSpaces.length - 1;
  }

  //Construye Chart grafico
  buildChart(item) {
    item.chart !== undefined ? item.chart.destroy() : null;
    if(item.id !== undefined){
      item.fieldCDK.id = item.id;
    }
    const data = _.cloneDeep(item.fieldCDK.dataChart); //Se clona el objeto para evitar error de "JSON Circle" al asignarlo en el data de la generacion del chart y al enviarlo como JSON por un servicio http
    const canvas = <HTMLCanvasElement>(
      document.getElementById('graph'+this.tabSelect + "" + item.fieldCDK.id)
    );
    const ctx = canvas.getContext("2d");
    item.chart = new Chart(ctx, {
      type: item.fieldCDK.tipoGrafica,
      data: data,
      options: new optionsGrafica().getOptions(item.fieldCDK.tipoGrafica, data)
    });
  }

  tabChanged(event: MatTabChangeEvent) {

    setTimeout(() => {
      this.openWorkSpaces[event.index].items.map(item => {
        if (item.type === "chart") {
          this.buildChart(item);
        }
      });
    }, 1000);
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
  getInfoIco(iconID:number, indexItem: number){
    this.iService.getIconsID(this.userSchemInfo.business.id, iconID).subscribe(res=>{
      if(res.success){
        const data = res.result[0];
        this.openWorkSpaces[this.tabSelect].items[indexItem].icon = data;
        setTimeout(() => {
          const img = new Image();
          img.src = data.image.url;
          img.onload = ()=>{
            const canvas = <HTMLCanvasElement>(document.getElementById( `img${this.tabSelect}${data.id}` )), context = canvas.getContext( '2d' );
            context.drawImage( img, 
              15,
              15,
               200, 100 * img.height / img.width);
            
          }
        }, 500);
      }
    });
  }
  // Abre el workspace seleccionado del menú
  openSelectWorkSpace() {
    //Por este servicio se recibe los datos del espacio de trabajo
    this.globalService.getSelectWorkSpaceClient().subscribe(res => {
      if (res) {
        let [key, workSpace, selectBussines] = res;

        //Valida que el espacio de trabajo no este abierto
        const idExist = this.openWorkSpaces
          .reduce((accum, current) => {
            return [...accum, current.idWorkSpace];
          }, [])
          .includes(workSpace.idWorkSpace);
          workSpace.creationPhase = "Created";
        if (!idExist) {

          //Añade los datos del espacio de trabajo a los que estan abiertos
          //El cloneDeep es para cuando se cierre el espacio de trabajo y volverlo a cargar desde el menú, cargue como estaba inicialmente, en caso de haber agregado filtro en la fecha
          this.newWorkSpace(_.cloneDeep(workSpace));
          //setTimeout(() => {
          workSpace.items.map((item, key) => {
            item.type === "chart"
              ? setTimeout(() => {
                  this.buildChart(item);
                }, 500)
              : item.type === "icon" ? this.getInfoIco(item.icon.id, key)
              : this.getInfoTable(
                  this.openWorkSpaces[this.tabSelect].items,
                  key,
                  item.table.name
                );
            //if (item.type === "chart") {
            //this.buildChart(item.fieldCDK);
            //}
          });
          //}, 500);
        }
      }
    });
  }

  changeTypeGraph(event: MatSelectChange, item) {
    console.log(event);
    this.buildChart(item);
  }

  dateChange(event, input) {
    console.log(input, event.value);
  }


  getInfo(item, date) {
    //destruye la grafica en caso de ya estar creada y se haga algún cambio
    if (item.chart !== undefined) {
      item.chart.destroy();
    }
    //consulta los datos con los ejes y operaciones seleccionadas
    this.graphService.postPaintGraph(item.fieldCDK, date).subscribe(res => {
      if (res.success) {
        this.construirDataSet(res.res, item);
      }
    });
  }

  construirDataSet(res: any, item) {
    const fieldCDK = item.fieldCDK
    fieldCDK.id = item.id;
    ; //Tiene los datos que se muestran en el menú creaión de grafica asi como otros parametros
    fieldCDK.dataChart = {} as iDataCharts;
    fieldCDK.dataChart.datasets = new Array<iDataSets>();
    const uArray = fieldCDK.x.concat(fieldCDK.y); //Union de los ejes en uno solo
    const colores = new coloresGraficas().coloresGra(); //Array de colores que estan en la interface iDataCharts
    const colors = index => {
      //segun el tipo de gràfica se trae un color para el dataset o varios
      if (fieldCDK.tipoGrafica === "pie") {
        return colores;
      }
      return colores[index];
    };
    if (uArray.length === 1 || uArray.length === 2) {
      //Si solo se agrego un campo o dos a los ejes, vienen 2 arrays que se descomponen y se organizan a continuación en el dataset del Chart
      const result = Object.entries(res); //Se convierte el objeto en array
      fieldCDK.dataChart.labels = res[result[0][0]]; //en la posición result[0][0] esta el nombre del indice del primer objeto que esta en res
      fieldCDK.dataChart.datasets[0] = {} as iDataSets; //Se inicializa para evitar error undefined
      fieldCDK.dataChart.datasets[0].data = res[result[1][0]]; //en la posición result[1][0] esta el nombre del indice  del segundo que esta en res
      fieldCDK.dataChart.datasets[0].label = result[1][0]; //Se asigna el nombre correspondiente para el label del dataset
      fieldCDK.dataChart.datasets[0].backgroundColor = colors(5);
    } else {
      fieldCDK.dataChart.labels =
        res[`${fieldCDK.x[0].nombre} ${fieldCDK.x[0].operacion}`.trim()];

      fieldCDK.y.forEach((elem, index) => {
        if (fieldCDK.dataChart.datasets[index] === undefined) {
          fieldCDK.dataChart.datasets[index] = {} as iDataSets;
        }
        fieldCDK.dataChart.datasets[index].label = `${elem.nombre} ${
          elem.operacion
        }`;
        fieldCDK.dataChart.datasets[index].data =
          res[`${elem.nombre} ${elem.operacion}`.trim()];
        fieldCDK.dataChart.datasets[index].backgroundColor = colors(index); //Trae un color diferente
      });
    }
    setTimeout(() => {    
      this.buildChart(item);
    }, 1000);
  }

  filterForDate() {
    this.openWorkSpaces[this.tabSelect].items.forEach(item => {
      const date = {init: '', end: ''};
      date.init =  moment(this.openWorkSpaces[this.tabSelect].date.init.value).format("YYYY-MM-DD");
      date.end =  moment(this.openWorkSpaces[this.tabSelect].date.end.value).format("YYYY-MM-DD");
      if(item.type === 'chart'){
        this.getInfo(item,date);

      }
    });
  }
}
