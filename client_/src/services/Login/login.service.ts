import { Usuario } from './../../app/models/usuario';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { User } from 'src/app/models/user';
import { global } from '../global';
interface respond {
	success: string;
	message: string;
	token: string;
	currUser: string;
	id: string;
	rol_id: string;
	username: string;
	nombre: string;
	correo: string;
	identificacion: string;
	usuario_id: string;
	tutorial: string;
}

interface respondToken {
	success: boolean;
	message: string;
}

@Injectable({
	providedIn: 'root'
})
export class UsuarioService {
	URL_API: string;
	selecUsuario: Usuario;
	Usuarios: Usuario[];

	//readonly URL_API = 'http://localhost:8000/';

	constructor(private http: HttpClient) {
		this.URL_API = global.baseURL;
		this.selecUsuario = new Usuario();
	}

	registrar(Usuario: Usuario) {
		return this.http.post<respond>(this.URL_API + `signup`, Usuario);
	}

	autenticar(user: User) {
		return this.http.post<respond>(this.URL_API + `userlogin`, user);
	}

	getUser(id: string) {
		let token = localStorage
			.getItem('token')
			.substring(1, localStorage.getItem('token').length - 1);
		return this.http.get<respond>(this.URL_API + `consultarPorId/${id}`, {
			headers: new HttpHeaders().append('token', token)
		});
	}

	verificarToken() {
		let token = localStorage
			.getItem('token')
			.substring(1, localStorage.getItem('token').length - 1);
		return this.http.post<respondToken>(this.URL_API + `checkAuth`, {
			headers: new HttpHeaders().append('token', token)
		});
	}
}
