import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { GlobalService } from "src/app/services/global/global.service";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private globalService: GlobalService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        /**
         * @desc `Validacion para ingreso a rutas deacuerdo al rol`
         * @author Yeison Osorio
         * 
         * `Active Url`
         */ 
        let activeRoute = state.url.split('/').pop();
        
        let usuario = JSON.parse(sessionStorage.getItem('usuario'));
        //Si es admin solo accede a las rutas diferentes a [workSpaceClient]
        if (usuario && usuario.rol === 1) {
            if (activeRoute !== 'workSpaceClient') {
                return true;
            }else if(activeRoute === 'workSpaceClient'){
                this.router.navigate(['/inicio']);
                return true;
            }
        }

        // Si es cliente solo accede a workSpaceClient
        if(usuario && usuario.rol === 2){
            if (activeRoute === 'workSpaceClient') {
                return true;
            }else{
                this.router.navigate(['/inicio/workSpaceClient']);
                return true;
            }
        }

        this.router.navigate(['/login']);
        return false;
    }
}