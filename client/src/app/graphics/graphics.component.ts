import { Component, OnInit } from "@angular/core";
import {
  CdkDragDrop,
  moveItemInArray,
  copyArrayItem
} from "@angular/cdk/drag-drop";

import { Chart } from "chart.js";
import { GlobalService } from "src/app/services/global/global.service";
import { MatSnackBar } from "@angular/material";
import {
  coloresGraficas,
  iDataCharts,
  iDataSets,
  optionsGrafica
} from "../interfaces/iDataCharts";
import { UploadService } from "src/app/services/upload/upload.service";
import { listOperaciones } from "../interfaces/listOperaciones";
import { GraficosService } from "src/app/services/graficos/graficos.service";
import { ejeValue, fieldCDK, opensFieldsCDK } from "../interfaces/listFieldCDK";
import * as _ from "lodash";
import { userSchemInfoInterface } from "../interfaces/inicio.interfaces";

/**
 * - Cuando se cree una gráfica recargar el menú donde lista las gráficas
 * - cada tab debe tener una x la cual quitara esta grafica de los tabs
- Si son dos campos, habilitar la gráfica de barras y de pastel solo si la 
   operación del eje Y es de tipo numerica
- Si hay mas de 2 campos en el eje Y, la grafica de pastel se 
    deshabilita, y la de barras solo se habilitara si en ambos campos se 
   realizan operaciones aritmetica y se deben dibujas barras axis a los lados 
   segun la cantidad de campos y el tipo de operación realizado
   cantidad de campos
 * 
 */

@Component({
  selector: "app-graphics",
  templateUrl: "./graphics.component.html",
  styleUrls: ["./graphics.component.css"]
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphicsComponent implements OnInit {
  // Datos generales
  userAndBusinessInfo: userSchemInfoInterface; //Observa la empresa seleccionada en el menú del componente inicio
  tablas: Array<any>; //Guarda las tablas cargadas para el menu crear grafica
  listOperaciones: listOperaciones; //Contiene las operaciones para cada tipo de dato en la columna
  disabledItems = {
    //Deshabilita las opciones de las graficas en el menu creacion graficas
    barras: true,
    lineas: true,
    sectores: true,
    botonCrear: true,
    botonGuardar: true,
    botonGuardarCambios: true
  };

  //Modelos para las graficas
  //private esquema: {id:number, nombre:string};
  private userSchemInfo: userSchemInfoInterface;
  graficasAbiertas: Array<opensFieldsCDK>;
  backupDataGraphEdit: {};
  tabSelect: number = 0;

  constructor(
    private globalService: GlobalService,
    private uploadService: UploadService,
    private graficoService: GraficosService,
    private snackBar: MatSnackBar
  ) {
    this.graficasAbiertas = new Array<opensFieldsCDK>();
    this.listOperaciones = new listOperaciones();
  }

  ngOnInit() {
    // Observable que obtiene la empresa seleccionada en el menu principal
    this.globalService.getSelectEmpresa().subscribe(
      res => {
        if(res){
          this.userSchemInfo = res;
        }
      },
      error => {}
    );

    // Observable que obtiene las tablas cargadas en el menu
    this.globalService.getListTablas().subscribe(
      res => {
        if(res){
          this.tablas = res;
        }
      },
      error => {}
    );

    //Observable que se ejecuta al dar click en una grafica del menu principal
    this.globalService.getSelectGrafica().subscribe(res => {
      if (typeof res === "object" && res !== null && res !== undefined) {
        const [key, grafica] = res;

        //verifica que la grafica no este abierta
        const idExist = this.graficasAbiertas
          .reduce((accum, current) => {
            return [...accum, current.fieldCDK.id];
          }, [])
          .includes(grafica.id);

        //valida que la grafica tenga datos y no este abierta
        if (grafica && !idExist) {
          const fieldCDK: fieldCDK = grafica.dataset as fieldCDK;
          this.graficasAbiertas = [
            ...this.graficasAbiertas,
            {
              chart: undefined,
              estadoCreacion: "Creado",
              columnas: new Array<ejeValue>(),
              fieldCDK: fieldCDK
            }
          ];
          fieldCDK.id = grafica.id;
          this.tabSelect = this.graficasAbiertas.length - 1;
          this.cargarColumnas(this.tabSelect, false);
          setTimeout(() => {
            this.buildChart(this.tabSelect, fieldCDK);
          }, 500);
        }
      }
    });
  } //Fin ngOnInit

  //Carga las columnas de la tabla seleccionada en el menu de seleccion de ejes
  cargarColumnas(index, esCambioTabla = true) {
    //Quita las columnas cuando se cambia de tabla en el select list
    if (esCambioTabla) {
      this.limpiarEjes(this.graficasAbiertas[index].fieldCDK);
    }

    this.graficasAbiertas[index].columnas = new Array<ejeValue>();
    this.uploadService
      .getColumnasTabla(
        this.graficasAbiertas[index].fieldCDK.selectTable, //Se puede cambiar a otro tipo de dato
        this.userSchemInfo.business.id
      )
      .subscribe(res => {
        if (res.success) {
          const cols = res.desc_tabla;
          cols.map(elem => {
            let { Field, Type } = elem;
            const eje = {} as ejeValue; // Agregar los valores
            eje.nombre = Field;
            //Elimina cualquier caracter que no sea del abecedario, ejemplo "varchar(200)" queda como "varchar"
            eje.tipo = this.definirTipo(Type.toLowerCase());
            this.graficasAbiertas[index].columnas = [
              ...this.graficasAbiertas[index].columnas,
              eje
            ];
          });
        }
      });
  } // Fin cargarColumnas

  //Elimina cualquier caracter que no sea del abecedario, ejemplo "varchar(200)" queda como "varchar"
  definirTipo = tipo => {
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

  //Pasar columnas del CDK Drag and Drop principal al Drag and Drop 'x' o 'y' o viceversa
  drop(event: CdkDragDrop<ejeValue[]>, eje) {
    // debugger; // permite poner un alto dentro de las funciones

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      //Se clona el objeto para permitir varias columnas repetidas en los ejes 'x' o 'y' con diferentes operaciones
      const arrayToCopy = _.cloneDeep(event.previousContainer.data);
      /*JSON.parse(
        JSON.stringify(event.previousContainer.data)
      ); */
      copyArrayItem(
        arrayToCopy,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      //Esta validación es para mantener 1 solo item en el eje x
      if (this.graficasAbiertas[this.tabSelect].fieldCDK.x.length > 1) {
        this.graficasAbiertas[
          this.tabSelect
        ].fieldCDK.x = this.graficasAbiertas[this.tabSelect].fieldCDK.x.slice(
          0,
          1
        );
      }
    }

    this.bloquearOpcionesGraficas();
  }

  //Quita el elemento del arreglo de algun eje al dar click en el icono x
  quitarColumna(arr: Array<ejeValue>, i: number) {
    arr.splice(i, 1);
    this.bloquearOpcionesGraficas();
  }

  //Deshabilita las gràficas segun la cantidad de ejes y tipo operaciones seleccionadas
  bloquearOpcionesGraficas() {
    const fieldCDK = this.graficasAbiertas[this.tabSelect].fieldCDK;
    const colsSelected = fieldCDK.x.length + fieldCDK.y.length;

    if (colsSelected > 2) {
      fieldCDK.y.forEach(elem => {
        if (elem.operacion !== "int" && elem.operacion !== "double") {
          this.disabledItems.sectores = true;
        }
      });
    } else {
      this.disabledItems.botonCrear = false;
    }
  }

  //Cierra la pestaña de la grafica
  closeGraph(i: number) {
    if (
      this.graficasAbiertas.length - 1 === this.tabSelect &&
      this.tabSelect > 0
    ) {
      this.tabSelect--;
    }
    this.graficasAbiertas.splice(i, 1);
  }

  //Validaciones para poder generar la grafica con la info
  private comprobarRequisitos = () => {
    const ejex = this.graficasAbiertas[this.tabSelect].fieldCDK.x.length > 0;
    if (!ejex) {
      this.snackBar.open("Eje x debe tener al menos una columna", "!", {
        duration: 5000
      });
      return false;
    }
    return true;
  };

  //Inicia el algoritmo apra generar la grafica
  getInfo() {
    if (this.comprobarRequisitos()) {
      //destruye la grafica en caso de ya estar creada y se haga algún cambio
      if (this.graficasAbiertas[this.tabSelect].chart !== undefined) {
        this.graficasAbiertas[this.tabSelect].chart.destroy();
      }
      //consulta los datos con los ejes y operaciones seleccionadas
      this.graficoService
        .postPaintGraph(this.graficasAbiertas[this.tabSelect].fieldCDK, null)
        .subscribe(res => {
          if (res.success) {
            this.disabledItems.botonGuardarCambios = false;

            this.construirDataSet(res.res);
          }
        });
    }
  }

  //Genera la estructura del objeto para el Chart
  construirDataSet(res: any) {
    const fieldCDK = this.graficasAbiertas[this.tabSelect].fieldCDK; //Tiene los datos que se muestran en el menú creaión de grafica asi como otros parametros
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
    this.buildChart(this.tabSelect, fieldCDK);
  }

  //Genera la grafica con el objeto esttucturado
  buildChart(index, fieldCDK) {
    const data = _.cloneDeep(fieldCDK.dataChart); //Se clona el objeto para evitar error de "JSON Circle" al asignarlo en el data de la generacion del chart y al enviarlo como JSON por un servicio http
    const canvas = <HTMLCanvasElement>document.getElementById(fieldCDK.id);
    const ctx = canvas.getContext("2d");
    this.graficasAbiertas[index].chart = new Chart(ctx, {
      type: fieldCDK.tipoGrafica,
      data: data,
      options: new optionsGrafica().getOptions(fieldCDK.tipoGrafica, data)
    });
    this.disabledItems.botonGuardar = false;
  }

  //Crea una nueva pestaña limpia
  createGraph() {
    try {
      //Esta validación es para resolver un bug que se generaba al cerrar todas las graficas abiertas y luego se trataba de crear una
      // El error es porque cuando se cerraban todas las graficas, el valor de tabSelect se vuelve -1 y a nivel de DOM se hace un llamado al array con esta variable
      if (this.graficasAbiertas.length === 0) {
        this.tabSelect = 0;
      }
      this.graficasAbiertas = [
        ...this.graficasAbiertas,
        {
          chart: undefined,
          estadoCreacion: "Creando",
          columnas: new Array<ejeValue>(),
          fieldCDK: new fieldCDK()
        }
      ]; //Crea un nuevo esapcio en el array para guardar los datos de la nueva grafica
      const lengthGraph = this.graficasAbiertas.length - 1;
      this.graficasAbiertas[
        lengthGraph
      ].fieldCDK.id = `nuevaGrafica${lengthGraph}`; //Nombre por defecto de la nueva grafica, tambien sera el ir del canvas correspondiente

      this.graficasAbiertas[lengthGraph].fieldCDK.esquema = {
        id: this.userSchemInfo.business.id,
        name: this.userSchemInfo.business.schemaName
      };
      this.graficasAbiertas[lengthGraph].fieldCDK.descGrafico = "";
    } catch (error) {
      this.snackBar.open("Ocurrió un error al crear la gráfica", "x", {
        duration: 5000
      });
    }
  }

  changeTab(index) {
    if (this.graficasAbiertas.length > 0) {
      this.tabSelect = index;
    } else {
      this.tabSelect = 0;
    }
  }

  saveGraph() {
    this.graficoService
      .guardarGrafica(
        this.graficasAbiertas[this.tabSelect].fieldCDK.nombreGrafica,
        JSON.stringify(this.graficasAbiertas[this.tabSelect].fieldCDK),
        this.userSchemInfo.business.id,
        this.graficasAbiertas[this.tabSelect].fieldCDK.tipoGrafica,
        this.graficasAbiertas[this.tabSelect].fieldCDK.descGrafico
      )
      .subscribe(res => {
        if (res.success) {
          //this.cargarGraficos(); //cargar graficas
          this.graficasAbiertas[this.tabSelect].fieldCDK.id = res.insert_id;
          this.graficasAbiertas[this.tabSelect].estadoCreacion = "Creado";

          //Emite el evento por el observable para que cargue los graficos con datos frescos en el menu principal
          this.globalService.successAddGraph();
        } else {
          console.error(res);
        }
      });
  }

  saveChangesGraph() {
    this.graficoService
      .editarGrafico(
        this.graficasAbiertas[this.tabSelect].fieldCDK.nombreGrafica,
        this.graficasAbiertas[this.tabSelect].fieldCDK.id,
        JSON.stringify(this.graficasAbiertas[this.tabSelect].fieldCDK),
        this.graficasAbiertas[this.tabSelect].fieldCDK.tipoGrafica
      )
      .subscribe(res => {
        if (res.success) {
          this.graficasAbiertas[this.tabSelect].estadoCreacion = "Creado";
          //Emite el evento por el observable para que cargue los graficos con datos frescos en el menu principal
          this.globalService.successAddGraph();
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

  //Se reciben la descripción y el nombre por parametro, y valida si se puede proceder a habilitar el boton crear, para evitar errores cuando se cree una nueva
  enableButtonCreate(description, nameGraph) {
    const data = this.graficasAbiertas[this.tabSelect];
    if (
      !this.disabledItems.botonGuardar &&
      description.trim() !== "" &&
      nameGraph.trim() !== ""
    ) {
      return false;
    }
    return true;
  }
  /*
  cambiarEstado(estado) {
    this.graficasAbiertas[this.tabSelect].estadoCreacion = estado;
  }*/

  //Cambia el estado a Editando y se crea un backup de los datos actuales
  editGraph(i: number, data: fieldCDK) {
    this.graficasAbiertas[this.tabSelect].estadoCreacion = "Editando";
    this.backupDataGraphEdit = {
      ...this.backupDataGraphEdit,
      [i]: _.cloneDeep(data)
    }; //JSON.parse(JSON.stringify(data))};
  }

  // Cancela la edición y regresa  a los valores originales
  cancelEditGraph(i: number) {
    this.graficasAbiertas[this.tabSelect].estadoCreacion = "Creado";
    this.graficasAbiertas[this.tabSelect].chart.destroy();
    this.graficasAbiertas[i].fieldCDK = _.cloneDeep(
      this.backupDataGraphEdit[i]
    );
    this.buildChart(i, this.backupDataGraphEdit[i]);
    delete this.backupDataGraphEdit[i]; //Elimina el backup de la grafca que se estaba editando
  }

  limpiarEjes(fieldCDK) {
    fieldCDK.x = new Array<ejeValue>();
    fieldCDK.y = new Array<ejeValue>();
  }
}
