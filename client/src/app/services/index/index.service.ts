import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { global } from '../global';

@Injectable({
	providedIn: 'root'
})
export class IndexService {
	//readonly URL_API = 'http://localhost:8000/api';
	URL_API: string;
	constructor(private http: HttpClient) {
		this.URL_API = global.baseURL;
	}

	// permite consultar los campos de la tabla seleccionada por el usuario (schema)
	getQuery(table: string, schema: string) {
		return this.http.get(this.URL_API + `/${table}&${schema}`);
	}
	// permite consultar la info de la tabla seleccionada por el usuario (schema) para la grafica
	getQueryGraph(table: string, campoX: string, campoY: string, operacion: string) {
		if (operacion != undefined && operacion != '') {
			return this.http.get(
				this.URL_API + `/infoGraph/${table}&${campoX}&${campoY}&${operacion}`
			);
		} else {
			var limit = 30000;
			return this.http.get(this.URL_API + `/infoGraph/${table}&${campoX}&${campoY}`);
		}
	}
	// permite consultar la info de la tabla seleccionada por el usuario (schema) para la grafica agrpada por otro campo
	getQueryGraphGroup(
		table: string,
		campoX: string,
		campoY: string,
		operacion: string,
		campoAgrupar: string,
		tipoAgrupar: string
	) {
		if (operacion != undefined && operacion != '') {
			return this.http.get(
				this.URL_API +
				`/infoGraphAgrupa/${table}&${campoX}&${campoY}&${operacion}&${campoAgrupar}&${tipoAgrupar}`
			);
		} else {
			var limit = 30000;
			return this.http.get(this.URL_API + `/infoGraph/${table}&${campoX}&${campoY}`);
		}
	}

	// Guardado de datos de grafica
	guardarDatosGrafica(dataset, tableSelected, creacion) {
		return this.http.post(this.URL_API + '/guardarDatosGrafica', {
			dataset: dataset,
			tableSelected: tableSelected,
			creacion: creacion
		});
	}
}
