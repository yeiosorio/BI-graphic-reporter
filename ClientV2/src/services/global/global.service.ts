import { Usuario } from './../../app/models/usuario';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { global } from '../global';
import { Cliente } from 'src/app/models/cliente';

interface responDepto {
	success: boolean;
	departamentos: [];

}
interface responCiudad {

	success: boolean;
	ciudades: [];

}
@Injectable({
	providedIn: 'root'
})
export class GlobalService {
	URL_API: string;
	client: any;
	table: any;
	constructor(private http: HttpClient) {
		this.URL_API = global.baseURL;
	}
	// consulta los departamentos
	getDepartamentos() {
		let token = sessionStorage
			.getItem('token')
			.substring(1, sessionStorage.getItem('token').length - 1);
		return this.http.get<responDepto>(this.URL_API + `getDepartamentos`, {
			headers: new HttpHeaders().append('token', token)
		});
	}
	// consulta las ciudades de acuerdo al departamentos
	getCiudad(departamento_id: string) {
		let token = sessionStorage
			.getItem('token')
			.substring(1, sessionStorage.getItem('token').length - 1);
		return this.http.get<responCiudad>(this.URL_API + `getCiudadPorDepartamento/${departamento_id}`, {
			headers: new HttpHeaders().append('token', token)
		});
	}

	getSelectClient(){
		return this.client;
	}
	setSelectClient(client: any){
		this.client = client;
	}
	getSelectTable(){
		return this.table;
	}
	setSelectTable(table: any){
		this.table = table;
	}
}
