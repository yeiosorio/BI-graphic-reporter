import { RouterModule, Routes } from '@angular/router';
// importing component...
import { UploadComponent } from './upload/upload.component';
import { IndexComponent } from './index/index.component';
import { LoginComponent } from './login/login.component';
import { PlanesComponent } from './planes/planes.component';
import { ProyectoComponent } from './proyecto/proyecto.component';
import { InicioComponent } from './inicio/inicio.component';
import { OridenDatosComponent } from './oriden-datos/oriden-datos.component';
import { GraficosComponent } from './graficos/graficos.component';
import { EspTrabajoComponent } from './esp-trabajo/esp-trabajo.component';
import { TutorialComponent } from './tutorial/tutorial.component';

const app_routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'proyecto', component: ProyectoComponent },
	{ path: 'upload', component: UploadComponent },
	{ path: 'graph', component: IndexComponent },
	{ path: 'planes', component: PlanesComponent },
	{ path: 'inicio', component: InicioComponent, data: { requiresLogin: true } },
	{ path: 'origenDatos', component: OridenDatosComponent },
	{ path: 'graficos', component: GraficosComponent },
	{ path: 'espTrabajo', component: EspTrabajoComponent },
	{ path: 'tutorial', component: TutorialComponent },
	{ path: '**', pathMatch: 'full', redirectTo: 'login' }
	// path: '**' -> cualquier otra direccion
];

export const app_routing = RouterModule.forRoot(app_routes);
