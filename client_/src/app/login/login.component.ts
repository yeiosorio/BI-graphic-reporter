import { RouterModule, Router } from '@angular/router';
import { UsuarioService } from '../../services/Login/login.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Usuario } from '../models/usuario';
import { User } from '../models/user';
import { AppComponent } from '../app.component';
import { resetComponentState } from '@angular/core/src/render3/instructions';
import { TranslateService } from '@ngx-translate/core';

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
				localStorage.setItem('usuario', JSON.stringify(usuario));

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
				localStorage.setItem('token', JSON.stringify(res.token));
				localStorage.setItem('id', JSON.stringify(res.currUser));
				this.usuarioService.getUser(res.currUser).subscribe((res) => {
					let usuario = {
						id: res[0].id,
						identificacion: res[0].identificacion,
						nombre: res[0].nombre,
						rol_id: res[0].rol_id,
						username: res[0].username,
						correo: res[0].correo,
						tutorial: res[0].tutorial
					};

					// se guarda los datos del usuario autenticado en el localstorage
					localStorage.setItem('usuario', JSON.stringify(usuario));
					console.log(res);
					if (res[0].tutorial == '0') {
						// usuario que no ha realizado el tutorial
						this.router.navigate([ '/tutorial' ]);
					} else {
						this.router.navigate([ '/inicio' ]);
					}
				});
			} else {
				M.toast({ html: res.message });
			}
		});
	}
}
