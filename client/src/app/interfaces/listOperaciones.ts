interface operacion {
    nombre: string;
    id: string;
  }
  
export class listOperaciones {
    number: Array<operacion>;
    datetime: Array<operacion>;
    varchar: Array<operacion>;
    default: Array<operacion>;
    defaultIcon: Array<operacion>;
    numberIcon: Array<operacion>;
    constructor(){
      this.number = [
        { nombre: "Real", id: "" },
        { nombre: "Conteo", id: "COUNT" },
        { nombre: "Suma", id: "SUM" },
        { nombre: "Promedio", id: "AVG" }
      ];
      this.datetime = [
        { nombre: "Real", id: "" },
        { nombre: "Año", id: "year" },
        { nombre: "Año - Mes", id: "yearM" },
        { nombre: "mes", id: "mounth" },
        { nombre: "día - mes", id: "dayM" },
        { nombre: "día", id: "day" }
      ];
      this.varchar = [{ nombre: "Real", id: "" }, { nombre: "Conteo", id: "COUNT" }];
      this.default = [{ nombre: "Real", id: "" }, { nombre: "Conteo", id: "COUNT" }];
      this.defaultIcon = [{ nombre: "Conteo", id: "COUNT" }];
      this.numberIcon = [
        { nombre: "Conteo", id: "COUNT" },
        { nombre: "Suma", id: "SUM" },
        { nombre: "Promedio", id: "AVG" }
      ]; 
    };
  }