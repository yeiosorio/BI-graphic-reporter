import { Usuario } from './../../app/models/usuario';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { global } from '../global';
import { Cliente } from 'src/app/models/cliente';
@Injectable({
	providedIn: 'root'
})
export class GlobalService {
	URL_API: string;
	constructor(private http: HttpClient) {
		this.URL_API = global.baseURL;
	}
	// consulta los departamentos
	getDepartamentos() {
		let token = localStorage
			.getItem('token')
			.substring(1, localStorage.getItem('token').length - 1);
		return this.http.post(this.URL_API + `getDepartamentos`, {
			headers: new HttpHeaders().append('token', token)
		});
	}
	// consulta las ciudades de acuerdo al departamentos
	getCiudad(departamento_id: string) {
		let token = localStorage
			.getItem('token')
			.substring(1, localStorage.getItem('token').length - 1);
		return this.http.post(this.URL_API + `getDepartamentos/${departamento_id}`, {
			headers: new HttpHeaders().append('token', token)
		});
	}
}
