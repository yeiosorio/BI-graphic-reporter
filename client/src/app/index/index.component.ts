import { AppComponent } from './../app.component';
import { KeysPipe } from './keys.pipe';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IndexService } from '../services/index/index.service';
import { Chart } from 'chart.js';

import * as moment from 'moment';

declare var M: any;
@Component({
	selector: 'app-index',
	templateUrl: './index.component.html',
	styleUrls: [ './index.component.css' ],
	providers: [ IndexService ]
})
export class IndexComponent implements OnInit {
	@ViewChild('lineChart') private chartRef;	lineChart: any;
	chart: any;
	items: any;
	foo: any;
	userProfile: any;
	table: string;
	schema: string;
	tableSelected: string;
	ejeXSelected: string;
	ejeYSelected: string;
	operacionSelected: string;
	agrupacionSelected: string;
	tipoAgrupacionSelected: string;
	ejeX: string[];
	ejeY: string[];
	info: any;
	infoGraph: {}[];
	dato: string[];
	campos: string[];
	tipoCampo: string[];
	graphInit: any;
	progress = false;
	chartGenerate: any;
	type: string;
	datosEjeY: number[];
	datosEjeX: number[];

	constructor(private indexService: IndexService, private appComponent: AppComponent) {
		this.tableSelected = 'medical_offices';
		// esquema
		this.schema = 'sambiomab_prod';
	}

	ngOnInit() {
		// inicia los componentes de materialize
		M.AutoInit();
		this.chart = new Chart(this.chartRef.nativeElement, {
			type: 'line',
			data: {
			  labels: [1,2,3,4,4], // your labels array
			  datasets: [
				{
				  data: [1,3,4,4,4], // your data array
				  borderColor: '#00AEFF',
				  fill: false
				}
			  ]
			},
			options: {
			  legend: {
				display: false
			  },
			  scales: {
				xAxes: [{
				  display: true
				}],
				yAxes: [{
				  display: true
				}],
			  }
			}
		  });


	}
	// consulta los campos de la tabla seleccionada
	consultarCampos() {
		this.getCampos();
	}
	// consulta la informacion de la tabla de acuerdo a los ejes y operacion seleccionada
	consultarInfo() {
		this.getInfo();
	}
	// permite cargar los campos de la tabla seleccionada
	getCampos() {
		this.items = []; // inicializo la variable que muestra la info en la tabla
		this.campos = []; // se inicia el arreglo de campos
		this.tipoCampo = []; // se inicia el arreglo de tipos
		this.indexService.getQuery(this.tableSelected, this.schema).subscribe((res) => {
			this.items = res;
			this.items.map((campo, key) => {
				this.campos[key] = campo.COLUMNAS;
				this.tipoCampo[key] = campo.TYPE;
			});
			// se espera un momento para inicializar los campos select
			setTimeout(() => {
				M.AutoInit();
			}, 100);
		});
	}
	// permite cargar loa informacion  de la tabla seleccionada, con los parametros indicados
	getInfo() {
		this.info = []; // inicializo la variable que muestra la info en la tabla
		this.ejeX = []; // inicia el arreglo de los datos del eje x
		this.ejeY = []; // inicia el arreglo de los datos del eje Y
		console.log(this.agrupacionSelected);
		console.log(this.tipoAgrupacionSelected);

		if (this.agrupacionSelected == undefined && this.tipoAgrupacionSelected == undefined) {
			//grafica sin agrupamiento, solo con la operacion
			this.indexService
				.getQueryGraph(
					this.tableSelected,
					this.ejeXSelected,
					this.ejeYSelected,
					this.operacionSelected
				)
				.subscribe((res) => {
					this.info = res;
					this.info.map((campo, key) => {
						this.ejeX[key] = campo.campoX;
						this.ejeY[key] = campo.campoY;
					});
					// setTimeout(() => {
					// 	this.lineChart = this.getBarChart();
					// }, 150);
				});
		} else {
			// grafica con agrupamiento
			this.indexService
				.getQueryGraphGroup(
					this.tableSelected,
					this.ejeXSelected,
					this.ejeYSelected,
					this.operacionSelected,
					this.agrupacionSelected,
					this.tipoAgrupacionSelected
				)
				.subscribe((res) => {
					this.info = res;
					console.log(this.info);
					this.info.map((campo, key) => {
						this.ejeX[key] = campo.campoX;
						this.ejeY[key] = campo.campoY;
					});
					// setTimeout(() => {
					// 	this.lineChart = this.getBarChart();
					// }, 150);
				});
		}
	}

	// identifica y decide que funcionar usar de acuerdo al tipo de grafica seleccionado
	tiposGraficas(tipo, canvas) {
		switch (tipo) {
			case 'bar':
				this.lineChart = this.getBarChart(canvas);
				break;
			case 'horizontalBar':
				this.lineChart = this.getBarHoriChart(canvas);
				break;

			case 'line':
				this.lineChart = this.getLineChart(canvas);
				break;
			case 'lineInterPol':
				this.lineChart = this.getLineInterPolChart(canvas);
				break;

			case 'lineArea':
				this.lineChart = this.getLineAreaChart(canvas);
				break;
			case 'pie':
				this.lineChart = this.getPieChart(canvas);
				break;
			case 'doughnut':
				this.lineChart = this.getDoughnutChart(canvas);
				break;
			case 'radar':
				this.lineChart = this.getRadarChart(canvas);
				break;
			case 'bubble':
				this.lineChart = this.getBubbbleChart(canvas);
				break;

			default:
				break;
		}
	}
	// parametriza la grafica, sin importar aun el tipo
	getChart(context, chartType, data, options?) {
		this.chartGenerate = new Chart(context, {
			data,

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
			},
			responsive: true,
			type: chartType,
			title: {
				fontSize: 18,
				display: true,
				text: 'I want to believe !',
				position: 'bottom'
			}
		});
		return this.chartGenerate;
	}
	// permite  la contruccion de la grafica de barras vertical
	getBarChart(canvas) {
		this.type = 'bar';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: 'eje x',
					data: this.datosEjeY, // eje y
					backgroundColor: '#d56f77',
					borderColor: '#d56f77',
					borderCapStyle: 'round',
					borderWidth: 3,
					hoverBackgroundColor: '#5dade2',
					hoverBorderColor: '#5dade2',
					hoverBorderWidth: 7
				}
			]
		};

		return this.getChart(canvas, this.type, data);
	}
	// permite  la contruccion de la grafica de barras horizontal
	getBarHoriChart(canvas) {
		this.type = 'horizontalBar';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: 'eje x',
					data: this.datosEjeY, // eje y
					backgroundColor: '#d56f77',
					borderColor: '#d56f77',
					borderCapStyle: 'round',
					borderWidth: 3,
					hoverBackgroundColor: '#5dade2',
					hoverBorderColor: '#5dade2',
					hoverBorderWidth: 7
				}
			]
		};

		return this.getChart(canvas, this.type, data);
	}

	// permite la construccion de la grafica de linea
	getLineChart(canvas) {
		this.type = 'line';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: 'eje x',
					data: this.datosEjeY, // eje y
					fill: false, // rellenar el area bajo la curva
					lineTension: 0, // si son angulos rectos, o con grado de curva en cada punto
					backgroundColor: '#9c71d3',
					borderColor: '#9c71d3',
					borderWidth: 1,
					borderCapStyle: 'square', //but , round, square -- termina la linea
					borderJoinStyle: 'miter', // "bevel" || "round" || "miter"; -- curvas
					pointRadius: 2,
					pointHitRadius: 20,
					scanGaps: true,
					steppedLine: false
				}
			]
		};

		return this.getChart(canvas, this.type, data);
	}

	// permite la construccion de la grafica de linea
	getLineInterPolChart(canvas) {
		this.type = 'line';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: 'eje x',
					data: this.datosEjeY, // eje y
					fill: false, // rellenar el area bajo la curva
					lineTension: 0, // si son angulos rectos, o con grado de curva en cada punto
					backgroundColor: '#71b0d3',
					borderColor: '#71b0d3',
					borderWidth: 1,
					borderCapStyle: 'square', //but , round, square -- termina la linea
					borderJoinStyle: 'miter', // "bevel" || "round" || "miter"; -- curvas
					pointRadius: 2,
					pointHitRadius: 20,
					scanGaps: true,
					steppedLine: true
				}
			]
		};

		return this.getChart(canvas, this.type, data);
	}

	// permite la construccion de la grafica de area
	getLineAreaChart(canvas) {
		this.type = 'line';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: 'eje x',
					data: this.datosEjeY, // eje y
					fill: true, // rellenar el area bajo la curva
					lineTension: 0, // si son angulos rectos, o con grado de curva en cada punto
					backgroundColor: this.appComponent.colores[7],
					borderColor: this.appComponent.colores[7],
					borderWidth: 1,
					borderCapStyle: 'square', //but , round, square -- termina la linea
					borderJoinStyle: 'miter', // "bevel" || "round" || "miter"; -- curvas
					pointRadius: 2,
					pointHitRadius: 20,
					pointHoverBorderColor: 80,
					scanGaps: false,
					steppedLine: false // linea escalonada
				}
			]
		};

		return this.getChart(canvas, this.type, data);
	}

	// permite  la contruccion de la grafica de radar

	getRadarChart(canvas) {
		this.type = 'radar';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: 'eje x',
					data: this.datosEjeY, // eje y
					fill: true, // rellenar el area bajo la curva
					lineTension: 0, // si son angulos rectos, o con grado de curva en cada punto
					backgroundColor: this.appComponent.colores[7],
					borderColor: this.appComponent.colores[7],
					borderWidth: 1,
					borderCapStyle: 'square', //but , round, square -- termina la linea
					borderJoinStyle: 'miter', // "bevel" || "round" || "miter"; -- curvas
					pointRadius: 2,
					pointHitRadius: 20,
					pointHoverBorderColor: 80,
					scanGaps: false,
					steppedLine: false // linea escalonada
				}
			]
		};

		return this.getChart(canvas, this.type, data);
	}

	// permite  la contruccion de la grafica de radar

	getBubbbleChart(canvas) {
		this.type = 'bubble';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: 'eje x',
					data: this.datosEjeY, // eje y
					fill: true, // rellenar el area bajo la curva
					lineTension: 0, // si son angulos rectos, o con grado de curva en cada punto
					backgroundColor: this.appComponent.colores[7],
					borderColor: this.appComponent.colores[7],
					borderWidth: 1,
					borderCapStyle: 'square', //but , round, square -- termina la linea
					borderJoinStyle: 'miter', // "bevel" || "round" || "miter"; -- curvas
					pointRadius: 2,
					pointHitRadius: 20,
					pointHoverBorderColor: 80,
					scanGaps: false,
					steppedLine: false // linea escalonada
				}
			]
		};

		return this.getChart(canvas, this.type, data);
	}

	// grafica de torta
	getPieChart(canvas) {
		this.type = 'pie';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: 'eje x',
					data: this.datosEjeY, // eje y
					fill: false,
					lineTension: 0.1,
					backgroundColor: this.appComponent.colores,
					borderColor: this.appComponent.colores,
					borderWidth: 1,
					borderCapStyle: 'square', //but , round, square -- termina la linea
					borderJoinStyle: 'miter', // "bevel" || "round" || "miter"; -- curvas
					pointRadius: 2,
					pointHitRadius: 20,
					scanGaps: true
				}
			]
		};

		return this.getChart(canvas, this.type, data);
	}
	// tipo de grafica de rosquilla
	getDoughnutChart(canvas) {
		this.type = 'doughnut';
		const data = {
			labels: this.datosEjeX, // eje x
			datasets: [
				{
					label: 'eje x',
					data: this.datosEjeY, // eje y
					//fill: true,
					lineTension: 0.1,
					borderWidth: 1,
					backgroundColor: this.appComponent.colores,
					borderColor: this.appComponent.colores,
					borderCapStyle: 'square', //but , round, square -- termina la linea
					borderJoinStyle: 'miter', // "bevel" || "round" || "miter"; -- curvas
					pointRadius: 2,
					pointHitRadius: 20,
					scanGaps: true
				}
			]
		};

		return this.getChart(canvas, this.type, data);
	}
	// permite la construccion de la grafica de barras
	// getBarChart() {
	// 	console.log('barra grafica');
	// 	const data = {
	// 		labels: this.ejeX, // eje x
	// 		datasets: [
	// 			{
	// 				label: this.ejeYSelected,
	// 				data: this.ejeY, // eje y
	// 				backgroundColor: 'rgb(232, 79, 110)',
	// 				borderColor: 'rgb(232, 79, 110)',
	// 				borderCapStyle: 'round',
	// 				borderWidth: 3,
	// 				hoverBackgroundColor: 'yellow',
	// 				hoverBorderColor: 'yellow',
	// 				hoverBorderWidth: 7
	// 			}
	// 		]
	// 		// datasets: [
	// 		// {
	// 		// 	label: this.ejeYSelected,
	// 		// 	fill: true,
	// 		// 	lineTension: 0.1,
	// 		// 	backgroundColor: 'rgb(232, 79, 110)',
	// 		// 	borderWidth: 3,
	// 		// 	borderColor: 'rgb(232, 79, 110)',
	// 		// 	borderCapStyle: 'round', //but , round, square -- termina la linea
	// 		// 	borderJoinStyle: 'round', // "bevel" || "round" || "miter"; -- curvas
	// 		// 	pointRadius: 3,
	// 		// 	pointHitRadius: 20,
	// 		// 	data: this.ejeY, // eje y
	// 		// 	scanGaps: false
	// 		// }
	// 		// ,
	// 		// {
	// 		// 	label: this.ejeYSelected,
	// 		// 	fill: true,
	// 		// 	lineTension: 0.1,
	// 		// 	backgroundColor: 'green',
	// 		// 	borderWidth: 3,
	// 		// 	borderColor: 'green',
	// 		// 	borderCapStyle: 'square', //but , round, square -- termina la linea
	// 		// 	borderJoinStyle: 'miter', // "bevel" || "round" || "miter"; -- curvas
	// 		// 	pointRadius: 2,
	// 		// 	pointHitRadius: 20,
	// 		// 	data: this.ejeY, // eje y
	// 		// 	scanGaps: true
	// 		// },
	// 		//	]
	// 	};

	// 	return this.getChart(data);
	// }

	guardarDatosGrafica() {
		this.progress = true;
		let creacion = moment().format('YYYY-MM-DD HH:mm:ss');
		// let dataset = {
		// 	labels: this.ejeX,
		// 	data: this.ejeY,
		// 	label: this.ejeYSelected,
		// }
		let dataArray = {
			labels: [
				0,
				1,
				2,
				3,
				4,
				5,
				6,
				7,
				8,
				9,
				10,
				11,
				12,
				13,
				14,
				15,
				16,
				17,
				18,
				19,
				20,
				21,
				22,
				24,
				25,
				26,
				27,
				28,
				30,
				32,
				33,
				34,
				35,
				37,
				38,
				39,
				41,
				43,
				44,
				46,
				47,
				48,
				49,
				50,
				53,
				54,
				56,
				59,
				60,
				61,
				63,
				65,
				66,
				68,
				69,
				71,
				72,
				73,
				74,
				75
			],
			data: [
				3313,
				6662,
				10267,
				6947,
				443,
				1303,
				57,
				1087,
				1566,
				7490,
				4,
				1326,
				2761,
				9001,
				10027,
				9342,
				17143,
				2,
				611,
				474,
				5402,
				10,
				8631,
				495,
				9780,
				529,
				2588,
				7649,
				2854,
				2485,
				3488,
				7,
				2777,
				7118,
				13333,
				2128,
				4090,
				595,
				2,
				9,
				59,
				226,
				2912,
				254,
				7686,
				3947,
				7086,
				4931,
				136,
				5310,
				5115,
				4340,
				153,
				4552,
				6310,
				672,
				34,
				455,
				1665,
				160
			],
			label: 'appointments_id'
		};

		let dataset = JSON.stringify(dataArray);
		// guardado de grafica
		this.indexService
			.guardarDatosGrafica(dataset, this.tableSelected, creacion)
			.subscribe((res) => {
				M.toast({ html: 'Grafica guardada con exito' });
				this.progress = false;
			});
	}
	
 data = {
  labels: ["2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016"],
  datasets: [{
    label: "UFO Sightings",
    fill: true,
    lineTension: 0.1,
    backgroundColor: "rgba(0,255,0,0.4)",
    borderColor: "green", // The main line color
    borderCapStyle: 'square',
    pointBorderColor: "white",
    pointBackgroundColor: "green",
    pointBorderWidth: 1,
    pointHoverRadius: 8,
    pointHoverBackgroundColor: "yellow",
    pointHoverBorderColor: "green",
    pointHoverBorderWidth: 2,
    pointRadius: 4,
    pointHitRadius: 10,
    data: [10, 13, 17, 12, 30, 47, 60, 120, 230, 300, 310, 400],
    spanGaps: true,
  },
            {
    label: "UFO Sightings",
    fill: true,
    lineTension: 0.1,
    backgroundColor: "rgba(0,255,0,0.4)",
    borderColor: "red", // The main line color
    borderCapStyle: 'square',
    pointBorderColor: "white",
    pointBackgroundColor: "red",
    pointBorderWidth: 1,
    pointHoverRadius: 8,
    pointHoverBackgroundColor: "yellow",
    pointHoverBorderColor: "red",
    pointHoverBorderWidth: 2,
    pointRadius: 4,
    pointHitRadius: 10,
    data: [0, 1, 7, 2, 3, 4, 6, 12, 230, 300, 310, 400],
    spanGaps: true,
  },
            {
    label: "UFO Sightings",
    fill: true,
    lineTension: 0.1,
    backgroundColor: "rgba(0,255,0,0.4)",
    borderColor: "green", // The main line color
    borderCapStyle: 'square',
    pointBorderColor: "white",
    pointBackgroundColor: "green",
    pointBorderWidth: 1,
    pointHoverRadius: 8,
    pointHoverBackgroundColor: "yellow",
    pointHoverBorderColor: "green",
    pointHoverBorderWidth: 2,
    pointRadius: 4,
    pointHitRadius: 10,
    data: [10, 13, 17, 12, 30, 47, 60, 120, 230, 300, 310, 400],
    spanGaps: true,
  }]
};

// Notice the scaleLabel at the same level as Ticks
 options = {
  scales: {
    yAxes: [{
      ticks: {
        beginAtZero: true
      }
    }]
  },
  title: {
    fontSize: 18,
    display: true,
    text: 'I want to believe !',
    position: 'bottom'
  }
};

	////////////////
}
