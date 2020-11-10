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
import { AuthGuard } from './_guards';
import { InicioBComponent } from './inicio-b/inicio-b.component';
import { GraficosbComponent } from './graficosb/graficosb.component';

const app_routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'proyecto', component: ProyectoComponent, canActivate: [AuthGuard] },
	{ path: 'upload', component: UploadComponent, canActivate: [AuthGuard] },
	{ path: 'graph', component: IndexComponent, canActivate: [AuthGuard] },
	{ path: 'planes', component: PlanesComponent, canActivate: [AuthGuard] },
	{ path: 'inicio', component: InicioComponent, canActivate: [AuthGuard]},
	{ 
		path: 'iniciob', 
		component: InicioBComponent, 
		children:[
			{path: 'graficob', component: GraficosbComponent}
		],
		canActivate: [AuthGuard]},
	{ path: 'origenDatos', component: OridenDatosComponent, canActivate: [AuthGuard] },
	{ path: 'graficos', component: GraficosComponent, canActivate: [AuthGuard] },
	{ path: 'espTrabajo', component: EspTrabajoComponent, canActivate: [AuthGuard] },
	{ path: 'tutorial', component: TutorialComponent, canActivate: [AuthGuard]},
	{ path: '**', pathMatch: 'full', redirectTo: 'login' }
	// path: '**' -> cualquier otra direccion
];

export const app_routing = RouterModule.forRoot(app_routes);
