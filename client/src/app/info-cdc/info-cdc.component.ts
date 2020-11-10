import { Component, OnInit } from "@angular/core";
import { Chart } from "chart.js";
import * as _ from "lodash";
import { InforCdcService } from "../services/info-cdc/info-cdc.service";
import { infoCDCInterface } from "../interfaces/info-cdc.Interfaces";

@Component({
  selector: "app-info-cdc",
  templateUrl: "./info-cdc.component.html",
  styleUrls: ["./info-cdc.component.css"]
})
export class InfoCdcComponent implements OnInit {
  infoCDC: Array<infoCDCInterface>; //Almacena la información cosnultada para las graficas
  charts = {}; //Almacena los charts creados
  columns: {}; //Almacena la información de las graficas por la columna a la que pertenece
  clients: Array<any>;
  filterDate: {};
  constructor(private infoCDCService: InforCdcService) {
    this.infoCDC = new Array<infoCDCInterface>();
    this.columns = {};
    this.clients = new Array<any>();
    this.filterDate = {};
  }

  ngOnInit() {
    this.infoCDCService.getInfo().subscribe(result => {
      if (result.success) {
        this.infoCDC = result.result;
        setTimeout(() => {
          const dataToCharts = this.infoCDC.filter(
            item => item.chart /*esto es un boolean */
          );
          this.columns = this.infoCDC.reduce(
            (accum, currentValue: infoCDCInterface) => {
              //if(currentValue.chart) {
              if (!accum[currentValue.column]) accum[currentValue.column] = [];
              accum[currentValue.column] = [
                ...accum[currentValue.column],
                currentValue
              ];
              //};
              return accum;
            },
            {}
          );
          setTimeout(() => {
            this.buildChart(dataToCharts);
          }, 750);
        }, 500);
      }
    });

    this.infoCDCService.getClients().subscribe(result => {
      if(result.success){
        this.clients = result.result;
      }
    });
  }

  //Construye Chart grafico
  buildChart(dataCharts) {
    dataCharts.forEach(value => {
      //const value = curentValue;
      const canvas = <HTMLCanvasElement>document.getElementById(value.name);
      const ctx = canvas.getContext("2d");
      this.charts[value.name] = new Chart(ctx, {
        type: value.typeChart,
        data: {
          labels: value.labels,
          datasets: [
            {
              label: value.typeChart === 'pie' ? value.name : '',
              data: value.total,
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(255, 159, 64, 0.2)"
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)"
              ],
              borderWidth: 1
            }
          ]
        },
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true
                }
              }
            ]
          }
        }
      });
    });
  }
}
