import { Chart } from "chart.js";
//estructura de los datos que se van a graficar
export interface iDataSets {
  label: any;
  backgroundColor: any;
  borderColor: "white"; // The main line color
  data: [];
}

//Estructura para una grafica
export interface iDataCharts {
  //labels: [`Masculino ${(this.m/this.t*100).toFixed(2)}%`, `Femenino ${(this.f/this.t*100).toFixed(2)}%`
  type: string;
  labels: [];
  datasets: Array<iDataSets>;
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true;
        };
      }
    ];
  };
  title: {
    fontSize: 18;
    display: true;
    text: "ChartJS";
    position: "bottom";
  };
}

export class optionsGrafica {
  private options = {
    bar: data => {
      return {
        hover: { animationDuration: 0 },
        tooltips: { enabled: false },
        animation: {
          duration: 1,
          onComplete: function() {
            let chartInstance = this.chart,
              ctx = chartInstance.ctx;
            ctx.font = Chart.helpers.fontString(
              Chart.defaults.global.defaultFontSize,
              Chart.defaults.global.defaultFontStyle,
              Chart.defaults.global.defaultFontFamily
            );
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            data.datasets.forEach(function(dataset, i) {
              var meta = chartInstance.controller.getDatasetMeta(i);
              meta.data.forEach(function(bar, index) {
                var data = dataset.data[index];
                ctx.fillText(data, bar._model.x, bar._model.y - 5);
              });
            });
          }
        },
        responsive: true,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      };
    },
    pie: data => {
      return {
        tooltips: { enabled: false },
        animation: {
          onComplete: function() {
            let chartInstance = this.chart,
              ctx = chartInstance.ctx;
            ctx.font = Chart.helpers.fontString(
              Chart.defaults.global.defaultFontSize,
              Chart.defaults.global.defaultFontStyle,
              Chart.defaults.global.defaultFontFamily
            );
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            data.datasets.forEach(function(dataset) {
              for (var i = 0; i < dataset.data.length; i++) {
                var m =
                    dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                  t = dataset._meta[Object.keys(dataset._meta)[0]].total,
                  mR = m.innerRadius + (m.outerRadius - m.innerRadius) / 2,
                  sA = m.startAngle,
                  eA = m.endAngle,
                  mA = sA + (eA - sA) / 2;
                var x = mR * Math.cos(mA);
                var y = mR * Math.sin(mA);
                ctx.fillStyle = "#fff";

                var p = String(Math.round((dataset.data[i] / t) * 100)) + "%";
                if (dataset.data[i] > 0) {
                  ctx.fillText(dataset.data[i], m.x + x, m.y + y - 10);
                  ctx.fillText(p, m.x + x, m.y + y + 5);
                }
              }
            });
          }
        },
        responsive: true,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      };
    },
    default: data => {
      return {
        tooltips: { enabled: false },
        animation: {
          onComplete: function() {
            let chartInstance = this.chart,
              ctx = chartInstance.ctx;
            ctx.font = Chart.helpers.fontString(
              Chart.defaults.global.defaultFontSize,
              Chart.defaults.global.defaultFontStyle,
              Chart.defaults.global.defaultFontFamily
            );
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            data.datasets.forEach(function(dataset, i) {
              var meta = chartInstance.controller.getDatasetMeta(i);
              meta.data.forEach(function(bar, index) {
                var data = dataset.data[index];
                ctx.fillText(data, bar._model.x, bar._model.y - 5);
              });
            });
          }
        },
        responsive: true,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      };
    },
    line: data => {
      return {
        tooltips: { enabled: false },
        animation: {
          onComplete: function() {
            let chartInstance = this.chart,
              ctx = chartInstance.ctx;
            ctx.font = Chart.helpers.fontString(
              Chart.defaults.global.defaultFontSize,
              Chart.defaults.global.defaultFontStyle,
              Chart.defaults.global.defaultFontFamily
            );
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            data.datasets.forEach(function(dataset, i) {
              var meta = chartInstance.controller.getDatasetMeta(i);
              meta.data.forEach(function(bar, index) {
                var data = dataset.data[index];
                ctx.fillText(data, bar._model.x, bar._model.y - 5);
              });
            });
          }
        },
        responsive: true,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      };
    }
  };
  constructor() {}
  getOptions(tipo, data) {
    if (this.options[tipo] === undefined) {
      tipo = "default";
    }
    return this.options[tipo](data);
  }
}

export class coloresGraficas {
  colores = [
    "#a771d1",
    "#d56f77",
    "#7184d3",
    "#72cec9",
    "#71d39f",
    "#cad371",
    "#d1a171",
    "#e29996",
    "#9c71d3",
    "#71b0d3",
    "#71d1bf",
    "#78d371",
    "#d1b671",
    "#d38e71",
    "#c6cacc",
    "#a1afaf",
    "#919a9b",
    "#4e5e6b",
    "#e6b0aa",
    "#d7bde2",
    "#a9cce3",
    "#a3e4d7",
    "#a9dfbf",
    "#576877",
    "#f9e79f",
    "#f5cba7",
    "#f7f9f9",
    "#d5dbdb",
    "#aeb6bf",
    "#f5b7b1",
    "#d2b4de",
    "#aed6f1",
    "#a2d9ce",
    "#abebc6",
    "#fad7a0",
    "#edbb99",
    "#e5e7e9",
    "#ccd1d1",
    "#abb2b9",
    "#d98880",
    "#c39bd3",
    "#7fb3d5",
    "#76d7c4",
    "#7dcea0",
    "#f7dc6f",
    "#f0b27a",
    "#f4f6f7",
    "#bfc9ca",
    "#85929e",
    "#f1948a",
    "#bb8fce",
    "#85c1e9",
    "#73c6b6",
    "#82e0aa",
    "#f8c471",
    "#e59866",
    "#d7dbdd",
    "#b2babb",
    "#808b96",
    "#cd6155",
    "#af7ac5",
    "#5499c7",
    "#48c9b0",
    "#52be80",
    "#f4d03f",
    "#eb984e",
    "#cacfd2",
    "#99a3a4",
    "#566573",
    "#ec7063",
    "#a569bd",
    "#5dade2",
    "#45b39d",
    "#58d68d",
    "#f5b041",
    "#dc7633",
    "#c0392b",
    "#e74c3c",
    "#9b59b6",
    "#2980b9",
    "#1abc9c",
    "#27ae60",
    "#f1c40f",
    "#e67e22",
    "#ecf0f1",
    "#95a5a6",
    "#34495e",
    "#8e44ad",
    "#3498db",
    "#16a085",
    "#2ecc71",
    "#f39c12",
    "#d35400",
    "#bdc3c7",
    "#7f8c8d",
    "#2c3e50",
    "#239b56",
    "#b9770e",
    "#2874a6",
    "#cb4335",
    "#2e4053",
    "#717d7e",
    "#cad371",
    "#d1a171",
    "#9c71d3",
    "#71b0d3",
    "#edbb99",
    "#e5e7e9",
    "#ccd1d1",
    "#abb2b9",
    "#7184d3",
    "#72cec9",
    "#71d1bf",
    "#78d371",
    "#d1b671",
    "#aed6f1",
    "#a2d9ce",
    "#abebc6",
    "#fad7a0",
    "#4e5e6b",
    "#e6b0aa",
    "#d7bde2",
    "#a9cce3",
    "#a3e4d7",
    "#a9dfbf",
    "#576877",
    "#f9e79f",
    "#f5cba7",
    "#f7f9f9",
    "#d5dbdb",
    "#aeb6bf",
    "#f5b7b1",
    "#d2b4de",
    "#d38e71",
    "#c6cacc",
    "#a1afaf",
    "#919a9b",
    "#71d39f",
    "#a771d1",
    "#d56f77",
    "#e29996",
    "#d98880",
    "#c39bd3",
    "#7fb3d5",
    "#76d7c4",
    "#7dcea0",
    "#f7dc6f",
    "#f0b27a",
    "#f4f6f7",
    "#bfc9ca",
    "#85929e",
    "#f1948a",
    "#bb8fce",
    "#85c1e9",
    "#73c6b6",
    "#82e0aa",
    "#f8c471",
    "#e59866",
    "#d7dbdd",
    "#b2babb",
    "#808b96",
    "#cd6155",
    "#af7ac5",
    "#5499c7",
    "#48c9b0",
    "#52be80",
    "#f4d03f",
    "#eb984e",
    "#cacfd2",
    "#99a3a4",
    "#566573",
    "#ec7063",
    "#a569bd",
    "#5dade2",
    "#45b39d",
    "#58d68d",
    "#f5b041",
    "#dc7633",
    "#c0392b",
    "#e74c3c",
    "#9b59b6",
    "#2980b9",
    "#1abc9c",
    "#27ae60",
    "#f1c40f",
    "#e67e22",
    "#ecf0f1",
    "#95a5a6",
    "#34495e",
    "#8e44ad",
    "#3498db",
    "#16a085",
    "#2ecc71",
    "#f39c12",
    "#d35400",
    "#bdc3c7",
    "#7f8c8d",
    "#2c3e50",
    "#239b56",
    "#b9770e",
    "#2874a6",
    "#cb4335",
    "#2e4053",
    "#717d7e"
  ];
  coloresGra() {
    return this.colores;
  }
}
