import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { global } from '../global';
interface respond {
	success: string;
}

interface respondGraph {
	success: string;
	graficos: {};
}

interface respondSpace {
	success: string;
	espacios_trabajo: {};
}

@Injectable({
	providedIn: 'root'
})
export class GraficosService {
	URL_API: string;
	constructor(private http: HttpClient) {
		this.URL_API = global.baseURL;
	}
	// consulta la informacion de la tabla que el usuario seleccione
	getQueryGraph(table: string, campoX: string, campoY: string, esquema: string) {
		let token = localStorage
			.getItem('token')
			.substring(1, localStorage.getItem('token').length - 1);
		return this.http.get(
			this.URL_API + 'api/' + `infoGraph/${table}&${campoX}&${campoY}&${esquema}`,
			{
				headers: new HttpHeaders().append('token', token)
			}
		);
	}
	// guarda la grafica creada o generada por el usuario
	guardarGrafica(nombre: string, dataset, esquema: string, tipo: string) {
		let token = localStorage
			.getItem('token')
			.substring(1, localStorage.getItem('token').length - 1);
		return this.http.post<respond>(
			this.URL_API + `guardarDatosGrafica`,
			{ nombGrafico: nombre, dataset: dataset, esquema: esquema, type: tipo },
			{
				headers: new HttpHeaders().append('token', token)
			}
		);
	}

	// consultar las graficas que tiene este esquema y cliente del usuario
	getGraficos(esquema: string, empresa: string) {
		let token = localStorage
			.getItem('token')
			.substring(1, localStorage.getItem('token').length - 1);
		return this.http.post<respondGraph>(
			this.URL_API + `getListaGraficosEmpresa`,
			{ esquema: esquema, empresa_id: empresa },
			{
				headers: new HttpHeaders().append('token', token)
			}
		);
	}
	// guarda espacios de trabajo
	guardarEspacioTrabajo(dataset_graficas, nombre, esquema_id) {
		let token = localStorage
			.getItem('token')
			.substring(1, localStorage.getItem('token').length - 1);
		return this.http.post<respondGraph>(
			this.URL_API + `guardarEspacioTrabajo`,
			{ dataset_graficas: dataset_graficas, nombre: nombre, esquema_id: esquema_id },
			{
				headers: new HttpHeaders().append('token', token)
			}
		);
	}
	// consulta los espacios de trabajo por usuario y empresa
	getEspaciosTrabajo(usuario, empresa) {
		let token = localStorage
			.getItem('token')
			.substring(1, localStorage.getItem('token').length - 1);
		return this.http.post<respondSpace>(
			this.URL_API + `getEspaciosPorEmpresaYUsuario`,
			{ usuario_id: usuario, empresa_id: empresa },
			{
				headers: new HttpHeaders().append('token', token)
			}
		);
	}
	// consulta la informacion de la tabla
	getInfoTable(empresa_id, nombre_tabla) {
		let token = localStorage
			.getItem('token')
			.substring(1, localStorage.getItem('token').length - 1);
		return this.http.post(
			this.URL_API + `getTabla`,
			{ empresa_id: empresa_id, nombre: nombre_tabla },
			{
				headers: new HttpHeaders().append('token', token)
			}
		);
	}
}
