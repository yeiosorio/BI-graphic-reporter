import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
//rutas
import { app_routing } from './app.routes';
import { AppComponent } from './app.component';
import { IndexComponent } from './index/index.component';
import { HttpClientModule } from '@angular/common/http';
import { KeysPipe } from './index/keys.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UploadComponent } from './upload/upload.component';

import { PapaParseModule } from 'ngx-papaparse';

import { AuthGuard } from './_guards';

//materialize
import { MaterializeModule } from './app.materialize';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


//components
import { LoginComponent } from './login/login.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { PlanesComponent } from './planes/planes.component';
import { ProyectoComponent } from './proyecto/proyecto.component';
import { InicioComponent } from './inicio/inicio.component';
import { OridenDatosComponent } from './oriden-datos/oriden-datos.component';
import { TutorialComponent } from './tutorial/tutorial.component';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgGridModule } from 'angular2-grid';
import { GraphicsComponent } from './graphics/graphics.component';
import { WorkSpaceComponent } from './work-space/work-space.component';
import { WorkspaceClientDialog } from './work-space/work-space.component';
import { WorkSpaceClientComponent } from './work-space-client/work-space-client.component';
import { IconsComponent } from './icons/icons.component';
import { InfoCdcComponent } from './info-cdc/info-cdc.component';

@NgModule({
	declarations: [
		AppComponent,
		IndexComponent,
		KeysPipe,
		UploadComponent,
		LoginComponent,
		PlanesComponent,
		ProyectoComponent,
		InicioComponent,
		OridenDatosComponent,
		TutorialComponent,
		GraphicsComponent,
		WorkSpaceComponent,
		WorkSpaceClientComponent,
		WorkspaceClientDialog,
		IconsComponent,
		InfoCdcComponent
	],
	entryComponents: [WorkspaceClientDialog],
	imports: [
		NgGridModule,
		BrowserModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		HttpClientModule,
		PapaParseModule,
		FormsModule,
		ReactiveFormsModule,
		app_routing,
		HttpClientModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: createTranslateLoader,
				deps: [ HttpClient ]
			}
		}),
		MaterializeModule,
		AngularDraggableModule
	],
	providers: [
		AuthGuard
	],
	bootstrap: [ AppComponent ]
})
export class AppModule {}

export function createTranslateLoader(http: HttpClient) {
	return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
