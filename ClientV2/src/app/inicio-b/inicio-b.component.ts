import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { Router } from '@angular/router';
import { ProyectoService } from 'src/services/proyecto/proyecto.service';
import { GraficosService } from 'src/services/graficos/graficos.service';
import { UploadService } from 'src/services/upload/upload.service';

@Component({
  selector: 'app-inicio-b',
  templateUrl: './inicio-b.component.html',
  styleUrls: ['./inicio-b.component.css']
})
export class InicioBComponent implements OnInit {

  usuario: any; // usuario que se autentica
  verEnMenu: boolean; // componentes dentro del menu externo


  selectEmpresa: string; // empresa seleccionada
	selectTable: string; // tabla seleccionada
	selectGraphType: string; // tipo de graafica seleccionado
  clientes: any; // clientes del usuario autenticado - matSelect seleccion de cliente
	tablas: any; // tablas del usuario autenticado
  graficas: any; // graficas del usuario
  espacios: any; // espacios de trabajo
  esquema: any; //esquema seleccionada

  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private graficosService: GraficosService,
		private uploadService: UploadService,
    private proyectoService: ProyectoService) { 

    // definen que tipo de menu debe aparecer
		this.appComponent.menu2 = 'block';
    this.appComponent.menu1 = 'none';

    this.usuario = JSON.parse(sessionStorage.getItem('usuario'));
		this.verEnMenu = true;
  }

  ngOnInit() {
    this.cargarClientes();
  }

  // carga los clientes del usuario
	cargarClientes() {
		this.proyectoService.getClientes(this.usuario.id).subscribe((res) => {
			this.clientes = res.empresas;
			// se espera un momento para inicializar los campos select
				this.selectEmpresa = this.clientes[0].empresa_id;
				// carga los proyectos que el usuario tenga asociados
				this.cargarEsquemas();
			
		});
  }
  
  // carga los esquemas del usuario
	cargarEsquemas() {
		this.proyectoService.getProyectos(this.usuario.id, this.selectEmpresa).subscribe((res) => {
			this.esquema = res.esquemas[0];
			this.carrgarTablas();
			this.cargarGraficos();
			this.cargarEspaciosTrabajo();
		});
	}

	// consulta las tablas que tenga el usuario
	carrgarTablas() {
		this.uploadService.getTables(this.selectEmpresa, 1, 10).subscribe((res) => {
			this.tablas = res;
				this.selectTable = this.tablas[0].nomb_tabla;
		});
  }

  // consulta las graficas que el usuario tiene para el cliente seleccionado
	cargarGraficos() {
		this.graficosService
			.getGraficos(this.esquema.nombre, this.selectEmpresa)
			.subscribe((res) => {
				if (res.success) {
					this.graficas = res.graficos;
				}
			});
	}

	cargarEspaciosTrabajo() {
		this.graficosService
			.getEspaciosTrabajo(this.usuario.id, this.selectEmpresa)
			.subscribe((res) => {
				if (res.success) {
					this.espacios = res.espacios_trabajo;
				}
			});
	}
}
