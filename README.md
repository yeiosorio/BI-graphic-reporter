__BI - GL__
Seridor creado en NodeJs + Express para una configuracion mas ligera 
del lado del cliente se instala Anular 7 + materilize 

# server - node
1. npm init
   define el archivo packege.json con el detalle del servidor
2. npm install express body-parser ejs mongojs --save
   instala express, ejs  y mongojs
3. se crea el archivo server.js
4. crear las carpetas routes y views
5. dentro de la carpeta routes se crea archivos de rutas, como             index.js y tasks.js
6. en la  carpeta views se crea un archivo index.html
7. npm install -g nodemon
8. npm install mysql express-myconnection morgan
    se instala el conector de mysql

 9. npm install cors --save   
   > npm install nodemon -D
    e instala nodemon en las dependencias de desarrollo, este permite abrir el servidor dentro de un socket que identifica si hay un cambio el lo reinicia automaticamente

10. npm install passport-local    se camnia por jwt
  > npm install jsonwebtoken@^5.7.0
 #Encriptacion de password
   >npm i bcrypt
   >npm i cookie-parser
   >npm i express-session
  #Autenticacion usuarios
   >npm i passport-local
   >npm i passport
*** el servidor se inicia con node server  - npm start**
   corre por <  http://localhost:8000/ > 
 *** para iniciar ahora el servidor**
   npm run dev
11. cifrar las contraseñas 
  >npm install bcrypt
 # angular 

 1. npm install @angular/cli o npm install @angular/cli@latest
    instalar angular 
 2.  ng new client
    se crea el proyecto del lado del cliente    
 *** dentro del proyecto cliente se inicia el servidor ****
    ng serve, 
    corre por < http://localhost:4200/ >
 ## comandos

   ng g service index
   ng g component name -> *ng g c name*

3. enrutamiento:
   se crea un archivo en app -> *app.routes.ts* 
   se debe imnportar en *app.module.ts* -> 
   --import { app_routing } from './app.routes';--

4. lectura de css
 >npm install ngx-papaparse@3 --save

5. materalize - angular
 >npm install --save @angular/material @angular/cdk @angular/animations

6. multilenguaje
  > npm install @ngx-translate/core @ngx-translate/http-loader rxjs --save

   *en app.module.ts:
         import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
         import { TranslateHttpLoader } from '@ngx-translate/http-loader';
         import { HttpClient } from '@angular/common/http';

         imports: [
                     HttpClientModule,
                     TranslateModule.forRoot({
                        loader: {
                           provide: TranslateLoader,
                           useFactory: createTranslateLoader,
                           deps: [ HttpClient ]
                        }
                     }),
                  ]

      > al final del documento:
        export function createTranslateLoader(http: HttpClient) {
            return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
         }
    ** se debe crear  una carpeta en assets llamada i18n y dentro de ella los archivos con cada idioma ejem   en.json  -> {
       "VARIABLDE": "traducion"
    }
   *en app.component.ts : 
   import { TranslateService } from '@ngx-translate/core';

     constructor(private translate: TranslateService) {
      // se declara por defecto un idioma
		translate.setDefaultLang('en');
		translate.use('en');
	}    

   * en el HTML: 
    <h5> <b>{{'VARIABLE' | translate}}</b></h5>

    7. moment 
     >npm install moment --save
     donde se use se debe importar
     > import * as moment from 'moment';


*** si hay error en Angular ***
> npm update

*** dragable ***
> npm install angular2-draggable --save


** grid flex **
> npm install angular2-grid

** lectura de Xlslx **
npm i xlsx

** generar pdf
npm install jspdf jspdf-autotable
npm install html2canvas  