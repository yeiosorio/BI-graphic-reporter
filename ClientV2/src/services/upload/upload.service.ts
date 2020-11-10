import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { global } from '../global';

interface respColumnas {
	desc_tabla: {};
	success: string;
}
interface respondTabla {
	success: string;
	insert_id: string;
}
@Injectable({
	providedIn: 'root'
})
export class UploadService {
	URL_API: string;

	//	readonly URL_API = 'http://localhost:8000/api';
	constructor(private http: HttpClient) {
		this.URL_API = global.baseURL;
	}

	// envia la informacion para la cracion de la tabla que el usuario este almacenando
	sendInfoTable(usuario, empresa, nomb_tabla, info: any) {
		let token = sessionStorage
			.getItem('token')
			.substring(1, sessionStorage.getItem('token').length - 1);
		return this.http.post<any>(
			this.URL_API + `crearTabla`,
			{
				empresa_id: empresa,
				usuario_id: usuario,
				nombre: nomb_tabla,
				datos: JSON.stringify(info)
			},
			{
				headers: new HttpHeaders().append('token', token)
			}
		);
	}
	// consulta las tablas que el usuario tenga en la empresa que indique
	getTables(empresa, inicio, limite) {
		let token = sessionStorage
			.getItem('token')
			.substring(1, sessionStorage.getItem('token').length - 1);
		return this.http.post<any>(
			this.URL_API + `getTablasPorEmpresa`,
			{
				empresa_id: empresa
			},
			{
				headers: new HttpHeaders().append('token', token)
			}
		);
	}
	// consulta las columnas de la tabla y su tipo de datos
	getColumnasTabla(nomb_tabla: string, empresa_id: string) {
		let token = sessionStorage
			.getItem('token')
			.substring(1, sessionStorage.getItem('token').length - 1);
		return this.http.post<any>(
			this.URL_API + `getColumnasTabla`,
			{
				nomb_tabla: nomb_tabla,
				empresa_id: empresa_id
			},
			{
				headers: new HttpHeaders().append('token', token)
			}
		);
	}
}
