import { UsuarioService } from 'src/app/services/Login/login.service';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { global } from './services/global';

declare var M: any;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.css' ]
})
export class AppComponent {
	language = 'es';
	menu1: string;
	menu2: string;
	colores: string[];
	isLogged: boolean;
	colores2: string[];
	constructor(private translate: TranslateService, private loginService: UsuarioService) {
		//M.AutoInit();
		this.changeLanguaje(this.language);
		this.menu1 = 'block';
		this.menu2 = 'none';
		this.cargarColoresGraficas();
	}

	// funcion que verifica en el backend si el usuario esta autenticado
	estaAutenticado() {
		this.loginService.verificarToken().subscribe((res) => {
			this.isLogged = res.success;
		});
	}

	changeLanguaje(language) {
		this.language = language;
		sessionStorage.setItem('idioma', this.language);

		// se declara por defecto un idioma
		this.translate.setDefaultLang(sessionStorage.getItem('idioma'));
		this.translate.use(sessionStorage.getItem('idioma'));
	}

	exitApp(){
		this.loginService.logout();
	}

	cargarColoresGraficas() {
		this.colores = [
			'#a771d1',
			'#d56f77',
			'#7184d3',
			'#72cec9',
			'#71d39f',
			'#cad371',
			'#d1a171',
			'#e29996',
			'#9c71d3',
			'#71b0d3',
			'#71d1bf',
			'#78d371',
			'#d1b671',
			'#d38e71',
			'#c6cacc',
			'#a1afaf',
			'#919a9b',
			'#4e5e6b',
			'#e6b0aa',
			'#d7bde2',
			'#a9cce3',
			'#a3e4d7',
			'#a9dfbf',
			'#576877',
			'#f9e79f',
			'#f5cba7',
			'#f7f9f9',
			'#d5dbdb',
			'#aeb6bf',
			'#f5b7b1',
			'#d2b4de',
			'#aed6f1',
			'#a2d9ce',
			'#abebc6',
			'#fad7a0',
			'#edbb99',
			'#e5e7e9',
			'#ccd1d1',
			'#abb2b9',
			'#d98880',
			'#c39bd3',
			'#7fb3d5',
			'#76d7c4',
			'#7dcea0',
			'#f7dc6f',
			'#f0b27a',
			'#f4f6f7',
			'#bfc9ca',
			'#85929e',
			'#f1948a',
			'#bb8fce',
			'#85c1e9',
			'#73c6b6',
			'#82e0aa',
			'#f8c471',
			'#e59866',
			'#d7dbdd',
			'#b2babb',
			'#808b96',
			'#cd6155',
			'#af7ac5',
			'#5499c7',
			'#48c9b0',
			'#52be80',
			'#f4d03f',
			'#eb984e',
			'#cacfd2',
			'#99a3a4',
			'#566573',
			'#ec7063',
			'#a569bd',
			'#5dade2',
			'#45b39d',
			'#58d68d',
			'#f5b041',
			'#dc7633',
			'#c0392b',
			'#e74c3c',
			'#9b59b6',
			'#2980b9',
			'#1abc9c',
			'#27ae60',
			'#f1c40f',
			'#e67e22',
			'#ecf0f1',
			'#95a5a6',
			'#34495e',
			'#8e44ad',
			'#3498db',
			'#16a085',
			'#2ecc71',
			'#f39c12',
			'#d35400',
			'#bdc3c7',
			'#7f8c8d',
			'#2c3e50',
			'#239b56',
			'#b9770e',
			'#2874a6',
			'#cb4335',
			'#2e4053',
			'#717d7e'
		];

		this.colores2 = [
			'#cad371',
			'#d1a171',
			'#9c71d3',
			'#71b0d3',
			'#edbb99',
			'#e5e7e9',
			'#ccd1d1',
			'#abb2b9',

			'#7184d3',
			'#72cec9',
			'#71d1bf',
			'#78d371',
			'#d1b671',
			'#aed6f1',
			'#a2d9ce',
			'#abebc6',
			'#fad7a0',
			'#4e5e6b',
			'#e6b0aa',
			'#d7bde2',
			'#a9cce3',
			'#a3e4d7',
			'#a9dfbf',
			'#576877',
			'#f9e79f',
			'#f5cba7',
			'#f7f9f9',
			'#d5dbdb',
			'#aeb6bf',
			'#f5b7b1',
			'#d2b4de',
			'#d38e71',
			'#c6cacc',
			'#a1afaf',
			'#919a9b',
			'#71d39f',
			'#a771d1',
			'#d56f77',
			'#e29996',
			'#d98880',
			'#c39bd3',
			'#7fb3d5',
			'#76d7c4',
			'#7dcea0',
			'#f7dc6f',
			'#f0b27a',
			'#f4f6f7',
			'#bfc9ca',
			'#85929e',
			'#f1948a',
			'#bb8fce',
			'#85c1e9',
			'#73c6b6',
			'#82e0aa',
			'#f8c471',
			'#e59866',
			'#d7dbdd',
			'#b2babb',
			'#808b96',
			'#cd6155',
			'#af7ac5',
			'#5499c7',
			'#48c9b0',
			'#52be80',
			'#f4d03f',
			'#eb984e',
			'#cacfd2',
			'#99a3a4',
			'#566573',
			'#ec7063',
			'#a569bd',
			'#5dade2',
			'#45b39d',
			'#58d68d',
			'#f5b041',
			'#dc7633',
			'#c0392b',
			'#e74c3c',
			'#9b59b6',
			'#2980b9',
			'#1abc9c',
			'#27ae60',
			'#f1c40f',
			'#e67e22',
			'#ecf0f1',
			'#95a5a6',
			'#34495e',
			'#8e44ad',
			'#3498db',
			'#16a085',
			'#2ecc71',
			'#f39c12',
			'#d35400',
			'#bdc3c7',
			'#7f8c8d',
			'#2c3e50',
			'#239b56',
			'#b9770e',
			'#2874a6',
			'#cb4335',
			'#2e4053',
			'#717d7e'
		];
	}
}
