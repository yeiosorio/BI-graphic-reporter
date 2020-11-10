import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AppComponent } from '../app.component';
import { TranslateService } from '@ngx-translate/core';
import { ProyectoService } from 'src/services/proyecto/proyecto.service';
import { NgForm } from '@angular/forms';
import { Cliente } from '../models/cliente';
import { RouterModule, Router } from '@angular/router';

declare var M: any;
@Component({
	selector: 'app-proyecto',
	templateUrl: './proyecto.component.html',
	styleUrls: [ './proyecto.component.css' ]
})
export class ProyectoComponent implements OnInit {
	events: string[];
	opened: boolean;
	expand: string;
	expand2: string;
	margiLeftDinamic: string;
	verEnMenu: boolean;
	usuario: any;
	constructor(
		private appComponent: AppComponent,
		public proyectoService: ProyectoService,
		private router: Router,
		private translate: TranslateService
	) {
		// definen que tipo de menu debe aparecer
		this.appComponent.menu2 = 'block';
		this.appComponent.menu1 = 'none';
		// permite obtener la informacion del usuario autenticado
		this.usuario = JSON.parse(localStorage.getItem('usuario'));
		this.margiLeftDinamic = 'margin-left-dinamic1';
		this.expand2 = 'tam-row-lateral2';
		this.expand = 'tam-row-lateral';
		this.verEnMenu = true;
	}

	ngOnInit() {
		// inicia los componentes de materialize
		setTimeout(() => {
			M.AutoInit();
		}, 100);
	}
	// funcion que permite contraer  el panel interno
	cerrarPanel() {
		if (this.expand == 'tam-row-lateral') {
			this.verEnMenu = false;
			this.expand = 'tam-row-lateral-menos';
			this.expand2 = 'tam-row-lateral2';
			this.margiLeftDinamic = 'margin-left-dinamic2';
		}
	}
	// funcion que permite expandir  el panel interno
	abrirPanel() {
		if (this.expand == 'tam-row-lateral-menos') {
			this.verEnMenu = true;
			this.expand = 'tam-row-lateral';
			this.expand2 = 'tam-row-lateral2';
			this.margiLeftDinamic = 'margin-left-dinamic1';
		}
	}
	//funcion que permite limpiar los campos del formulario
	resetForm(form?: NgForm) {
		if (form) {
			form.reset();
			this.proyectoService.selecProyecto = new Cliente();
		}
	}
	// funcion que permite crear el cliente y asociarlo a un usuario (crear esquema de base de datos)
	crearCliente(form?: NgForm) {
		this.proyectoService.crearCliente(form.value).subscribe((res) => {
			if (res.success) {
				// se definen las variables necesarias para asociar cliente con usuario, crear esquema
				let proyecto = {
					usuario_id: this.usuario.id,
					empresa_id: res.insert_id,
					nomb_proyecto: form.value.nomb_proyecto,
					desc_proyecto: form.value.desc_proyecto
				};
				this.proyectoService.asocEmpresaUsuario(proyecto).subscribe((res) => {
					if (res.success) {
						this.translate.get('ALERT-CLIENT-CREATE').subscribe((msn) => {
							M.toast({ html: msn });
						});

						if (this.usuario.tutorial == '0') {
							this.router.navigate([ '/tutorial' ]);
						} else {
							this.router.navigate([ '/inicio' ]);
						}
					} else {
						this.translate.get('ALERT-PROBLEM').subscribe((msn) => {
							M.toast({ html: msn });
						});
					}
				});
				this.resetForm(form); // limpia el formulario
				//this.router.navigate([ '/planes' ]);
			} else {
				this.translate.get('ALERT-PROBLEM').subscribe((msn) => {
					M.toast({ html: msn });
				});
			}
		});
	}
}