import { RouterModule, Router } from '@angular/router';
import { UsuarioService } from '../services/Login/login.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Usuario } from '../models/usuario';
import { User } from '../models/user';
import { AppComponent } from '../app.component';
import { TranslateService } from '@ngx-translate/core';
import { userLoginInterface } from '../interfaces/originData.Interfaces';

declare var M: any;
@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: [ './login.component.css' ]
})
export class LoginComponent implements OnInit {
	user = {} as User;

	constructor(
		public usuarioService: UsuarioService,
		private router: Router,
		private appComponent: AppComponent,
		private translate: TranslateService
	) {
		this.usuarioService.selecUsuario.rol_id = 2;
		this.usuarioService.selecUsuario.observacion = '';
		this.appComponent.menu1 = 'block';
		this.appComponent.menu2 = 'none';
	}

	ngOnInit() {
		// inicia los componentes de materialize
		setTimeout(() => {
			M.AutoInit();
		}, 100);
	}
	//funcion que permite limpiar los campos del formulario
	resetForm(form?: NgForm) {
		if (form) {
			form.reset();
			this.usuarioService.selecUsuario = new Usuario();
		}
	}

	// funcion que permite el registro de usuarios
	registrar(form?: NgForm) {
		this.usuarioService.registrar(form.value).subscribe((res) => {
			console.log(res);
			if (res.success) {
				this.translate.get('ALERT-WELCOME').subscribe((msn) => {
					M.toast({ html: msn });
				});
				this.resetForm(form);
				let usuario = {
					id: res.usuario_id
				};
				sessionStorage.setItem('usuario', JSON.stringify(usuario));

				this.router.navigate([ '/planes' ]);
			} else {
				this.translate.get('ALERT-PROBLEM').subscribe((msn) => {
					M.toast({ html: msn });
				});
			}
		});
	}

	// funcion que permite la autenticacion de usuarios
	autenticar(user: User) {
		//	this.router.navigate([ '/tutorial' ]);

		this.usuarioService.autenticar(user).subscribe((res) => {
			if (res.success) {
				sessionStorage.setItem('token', JSON.stringify(res.token));
				sessionStorage.setItem('id', JSON.stringify(res.currUser));
				this.usuarioService.getUser(res.currUser).subscribe((res) => {
					/*let usuario = {
						id: res[0].id,
						identification: res[0].identificacion,
						name: res[0].nombre,
						rolID: res[0].rol_id,
						userName: res[0].username,
						email: res[0].correo,
						tutorial: res[0].tutorial,
						rol: res[0].rol
					};*/

					const user: userLoginInterface = res;

					// se guarda los datos del usuario autenticado en el sessionStorage
					sessionStorage.setItem('usuario', JSON.stringify(res[0]));
					if (res[0].tutorial === '0') {
						// usuario que no ha realizado el tutorial
						this.router.navigate([ '/tutorial' ]);
					} else {
						this.router.navigate([ 'inicio' ]);
					}
				});
			} else {
				M.toast({ html: res.message });
			}
		});
	}
}
