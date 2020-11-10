import { iDataCharts } from "./iDataCharts";

export interface ejeValue {
  nombre: string;
  tipo: string;
  operacion: string;
}
export class fieldCDK {
  x: Array<ejeValue>;
  y: Array<ejeValue>;
  tipoGrafica: string;
  selectTable: any;
  esquema: any;
  id: any;
  dataChart: any;
  nombreGrafica: string = '';
  descGrafico: string = '';
  constructor() {}

}
export interface opensFieldsCDK {
  chart: any;
  estadoCreacion: string;
  columnas:Array<ejeValue>;
  fieldCDK: fieldCDK;
}