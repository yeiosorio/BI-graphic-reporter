import { RouterModule, Routes } from '@angular/router';
// importing component...
import { UploadComponent } from './upload/upload.component';
import { IndexComponent } from './index/index.component';
import { LoginComponent } from './login/login.component';
import { PlanesComponent } from './planes/planes.component';
import { ProyectoComponent } from './proyecto/proyecto.component';
import { InicioComponent } from './inicio/inicio.component';
import { OridenDatosComponent } from './oriden-datos/oriden-datos.component';
import { TutorialComponent } from './tutorial/tutorial.component';
import { AuthGuard } from './_guards'; 
import { GraphicsComponent } from './graphics/graphics.component';
import { WorkSpaceComponent } from './work-space/work-space.component';
import { WorkSpaceClientComponent } from './work-space-client/work-space-client.component';
import { IconsComponent } from './icons/icons.component';
import { InfoCdcComponent } from './info-cdc/info-cdc.component';


const app_routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'proyecto', component: ProyectoComponent, canActivate: [AuthGuard] },
	{ path: 'upload', component: UploadComponent, canActivate: [AuthGuard] },
	{ path: 'graph', component: IndexComponent, canActivate: [AuthGuard] },
	{ path: 'planes', component: PlanesComponent, canActivate: [AuthGuard] },
	{ path: 'index', component: IndexComponent, canActivate: [AuthGuard] },
	{ 
		path: 'inicio', component: InicioComponent, 
		children: [
			{ path: 'origenDatos', component: OridenDatosComponent, canActivate: [AuthGuard] },
			{ path: 'demoGrafico', component: GraphicsComponent, canActivate: [AuthGuard] },
			{ path: 'workSpace', component: WorkSpaceComponent, canActivate: [AuthGuard] },
			{ path: 'icons', component: IconsComponent, canActivate: [AuthGuard] },
			{ path: 'workSpaceClient', component: WorkSpaceClientComponent, canActivate: [AuthGuard] },
			{ path: 'infoCDC', component: InfoCdcComponent, canActivate: [AuthGuard] }
		], canActivate: [AuthGuard] 
	},

	//{ path: 'origenDatos', component: OridenDatosComponent, canActivate: [AuthGuard] },
	//{ path: 'tutorial', component: TutorialComponent, canActivate: [AuthGuard]},
	{ path: '**', pathMatch: 'full', redirectTo: 'login' },
	// path: '**' -> cualquier otra direccion
];
export const app_routing = RouterModule.forRoot(app_routes);
