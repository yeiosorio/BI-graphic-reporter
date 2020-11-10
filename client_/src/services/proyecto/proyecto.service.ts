import { Usuario } from './../../app/models/usuario';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { global } from '../global';
import { Cliente } from 'src/app/models/cliente';
interface respond {
	success: string;
	message: string;
	insert_id: number;
}

interface resProyecto {
	id: string;
	Usuario: string;
	empresa: string;
	nombre: string;
	nombre_proyecto: string;
	desc_proyecto: string;
	esquemas: {};
}

interface resCliente {
	success: string;
	empresas: {};
}

@Injectable({
	providedIn: 'root'
})
export class ProyectoService {
	URL_API: string;
	selecProyecto: Cliente;
	Clientes: Cliente[];
	constructor(private http: HttpClient) {
		this.URL_API = global.baseURL;
		this.selecProyecto = new Cliente();
	}
	// crea un cliente del usuario
	crearCliente(info: any) {
		let token = localStorage
			.getItem('token')
			.substring(1, localStorage.getItem('token').length - 1);
		return this.http.post<respond>(this.URL_API + `crearEmpresa`, info, {
			headers: new HttpHeaders().append('token', token)
		});
	}
	// asocia el usuario al cliente (empresa) creada
	asocEmpresaUsuario(info: any) {
		let token = localStorage
			.getItem('token')
			.substring(1, localStorage.getItem('token').length - 1);
		return this.http.post<respond>(this.URL_API + `asocEmpresaUsuario`, info, {
			headers: new HttpHeaders().append('token', token)
		});
	}
	// consulta todos los clientes que el usuario tenga
	getClientes(usuario_id: string) {
		let token = localStorage
			.getItem('token')
			.substring(1, localStorage.getItem('token').length - 1);
		return this.http.post<resCliente>(
			this.URL_API + `getEmpresasPorUsuarioId`,
			{ usuario_id: usuario_id },
			{
				headers: new HttpHeaders().append('token', token)
			}
		);
	}
	// consulata el esquema de la base de datos del usuario y el cliente seleccionado
	getProyectos(usuario_id: string, empresa_id: string) {
		let token = localStorage
			.getItem('token')
			.substring(1, localStorage.getItem('token').length - 1);
		return this.http.post<resProyecto>(
			this.URL_API + `getEsquemasUsuario`,
			{ usuario_id: usuario_id, empresa_id: empresa_id },
			{
				headers: new HttpHeaders().append('token', token)
			}
		);
	}

	// omitir tutorial
	omitirTutorial(usuario_id, esatdo_tuto) {
		let token = localStorage
			.getItem('token')
			.substring(1, localStorage.getItem('token').length - 1);
		return this.http.post<respond>(
			this.URL_API + `setEstadoTurorial`,
			{ usuario_id: usuario_id, estado_tuto_id: esatdo_tuto },
			{
				headers: new HttpHeaders().append('token', token)
			}
		);
	}
}
