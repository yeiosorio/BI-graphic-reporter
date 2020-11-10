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
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';

import { AuthGuard } from './_guards';

//materialize

import {
	MatPaginatorModule,
	MatTableModule,
	MatSortModule,
	MatAutocompleteModule,
	MatBadgeModule,
	MatBottomSheetModule,
	MatButtonModule,
	MatButtonToggleModule,
	MatCardModule,
	MatCheckboxModule,
	MatChipsModule,
	MatDatepickerModule,
	MatDialogModule,
	MatDividerModule,
	MatExpansionModule,
	MatGridListModule,
	MatIconModule,
	MatInputModule,
	MatListModule,
	MatMenuModule,
	MatNativeDateModule,
	MatProgressBarModule,
	MatProgressSpinnerModule,
	MatRadioModule,
	MatRippleModule,
	MatSelectModule,
	MatSidenavModule,
	MatSliderModule,
	MatSlideToggleModule,
	MatSnackBarModule,
	MatStepperModule,
	MatTabsModule,
	MatToolbarModule,
	MatTooltipModule,
	MatTreeModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login/login.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { PlanesComponent } from './planes/planes.component';
import { ProyectoComponent } from './proyecto/proyecto.component';
import { InicioComponent } from './inicio/inicio.component';
import { OridenDatosComponent } from './oriden-datos/oriden-datos.component';
import { GraficosComponent } from './graficos/graficos.component';
import { EspTrabajoComponent } from './esp-trabajo/esp-trabajo.component';
import { TutorialComponent } from './tutorial/tutorial.component';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgGridModule } from 'angular2-grid';
import { VerGraficoComponent } from './graficos/ver-grafico/ver-grafico.component';
import { InicioBComponent } from './inicio-b/inicio-b.component';
import { GraficosbComponent } from './graficosb/graficosb.component';

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
		GraficosComponent,
		EspTrabajoComponent,
		TutorialComponent,
		VerGraficoComponent,
		InicioBComponent,
		GraficosbComponent
	],
	imports: [
		NgGridModule,
		DragDropModule,
		CdkTableModule,
		CdkTreeModule,
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
		MatPaginatorModule,
		MatTableModule,
		MatSortModule,
		MatAutocompleteModule,
		MatBadgeModule,
		MatBottomSheetModule,
		MatButtonModule,
		MatButtonToggleModule,
		MatCardModule,
		MatCheckboxModule,
		MatChipsModule,
		MatStepperModule,
		MatDatepickerModule,
		MatDialogModule,
		MatDividerModule,
		MatExpansionModule,
		MatGridListModule,
		MatIconModule,
		MatInputModule,
		MatListModule,
		MatMenuModule,
		MatNativeDateModule,
		MatPaginatorModule,
		MatProgressBarModule,
		MatProgressSpinnerModule,
		MatRadioModule,
		MatRippleModule,
		MatSelectModule,
		MatSidenavModule,
		MatSliderModule,
		MatSlideToggleModule,
		MatSnackBarModule,
		MatSortModule,
		MatTableModule,
		MatTabsModule,
		MatToolbarModule,
		MatTooltipModule,
		MatTreeModule,
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
