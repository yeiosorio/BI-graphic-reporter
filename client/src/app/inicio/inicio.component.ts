import { ProyectoService } from "src/app/services/proyecto/proyecto.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { AppComponent } from "../app.component";
import { ActivatedRoute, Router } from "@angular/router";
import { UploadService } from "../services/upload/upload.service";
import {
  CdkDragDrop
} from "@angular/cdk/drag-drop";

import { GraficosService } from "src/app/services/graficos/graficos.service";
import { GlobalService } from "src/app/services/global/global.service";
import { userSchemInfoInterface, businessInterface } from "../interfaces/inicio.interfaces";
import { userLoginInterface } from "../interfaces/originData.Interfaces";
import { iconInterface } from "../interfaces/icons.interfaces";
import { iconsService } from "src/app/services/iconos/icons.service";
declare var M: any;

@Component({
  selector: "app-inicio",
  templateUrl: "./inicio.component.html",
  styleUrls: ["./inicio.component.css"]
})
export class InicioComponent implements OnInit {

  // Contiene la lista de gráficas que se listan en el menú
  graficas: Array<{dataset:any, id:any,type:any, nombre:any}>;
  // Almacena la lista de clientes del usuario autenticado
  clientes: Array<businessInterface>; 
  //Almacena la lista de espacios de trabajo del usuario autenticado y cliente seleccionado
  espacios: any;
  //Almacena la lista de las tablas del usuario autenticado y cliente seleccionado
  tablas: any; 
  //Almacena la lista de Iconos
  icons: Array<iconInterface>;

  opened: boolean; // abrir o cerra panel interno
  verEnMenu: boolean; // componentes dentro del menu externo
  userSchemInfo: userSchemInfoInterface; // usuario que se autentica

  activeUrl: string;

  constructor(
    private appComponent: AppComponent,
    private route: ActivatedRoute,
    public router: Router,
    private serviceProject: ProyectoService,
    private graficosService: GraficosService,
    private uploadService: UploadService,
    private iconsService: iconsService,
    private globalService: GlobalService
  ) {
    // definen que tipo de menu debe aparecer
    this.appComponent.menu2 = "block";
    this.appComponent.menu1 = "none";
    // permite obtener la informacion del usuario autenticado
    this.userSchemInfo = {} as userSchemInfoInterface;
    this.userSchemInfo.user = {} as userLoginInterface;
    this.userSchemInfo.user = JSON.parse(sessionStorage.getItem("usuario"));
    this.verEnMenu = true;
    
    this.graficas = new Array<{dataset:any, id:any,type:any, nombre:any}>();
    // Almacena la lista de clientes del usuario autenticado
    this.clientes = new Array<businessInterface>(); 
    //Almacena la lista de espacios de trabajo del usuario autenticado y cliente seleccionado
    this.espacios = new Array<any>();
    this.tablas = new Array<any>();
    this.icons = new Array<iconInterface>();
    this.opened = true;

  }

  ngOnInit() {
    this.activeUrl = this.router.url

    // inicia los componentes de materialize
    setTimeout(() => {
      M.AutoInit();
    }, 100);
   
    this.loadBusiness();

    this.globalService.getAddGraph().subscribe(elem=>{
      this.cargarGraficos();
    });
    this.globalService.getAddIcon().subscribe(elem=>{
      this.loadIcons();
    });
    this.globalService.getAddDataOrigin().subscribe(elem=>{
      this.carrgarTablas();
    });
    this.globalService.getAddWorkSpace().subscribe(elem=>{
      this.cargarEspaciosTrabajo();
    });
    /**
      this.globalService.getAddedWorkSpace().subscribe(elem=>{
      this.cargarGraficos();
    })
     */
  }


  // si le da click en omitir tutorial
  omitirTutorial() {
    this.serviceProject.omitirTutorial(this.userSchemInfo.user.id, 1).subscribe(res => {
      if (res.success) {
        this.router.navigate(["/inicio"]);
      }
    });
  }

  // carga los clientes del usuario
  loadBusiness() {
    this.serviceProject.getClientes(this.userSchemInfo.user.id).subscribe(res => {
      this.clientes = res.empresas;

      //Si es primer ingreso a la plataforma, toma el primer registro de cliente
      if (!this.userSchemInfo.business) {
        this.userSchemInfo.business = this.clientes[0];
      }
      //Envia la empresa seleccionada por un observable par que los demas componentes esten actualizados a este
      this.globalService.setSelectEmpresa(this.userSchemInfo);
      this.loadItemsMenu();
    });
  }

  loadItemsMenu(){
    // carga los proyectos que el usuario tenga asociados
    this.carrgarTablas();
    this.cargarGraficos();
    this.loadIcons();
    this.cargarEspaciosTrabajo();

  }
  
  loadIcons(){
    this.iconsService.getIcons(this.userSchemInfo.business.id).subscribe(res => {
      if(res.success){
        this.icons = res.result;
      }
    })
  }

  // consulta las tablas que tenga la empresa/cliente seleccionado
  carrgarTablas() {
    this.uploadService.getTables(this.userSchemInfo.business.id, 1, 10).subscribe(res => {
      if (res.length > 0) {
        this.tablas = res;
        //Envia las tablas pro un Observable para ser usada por los demas componentes
        this.globalService.setListTablas(this.tablas);
      } 
    });
  }

  // consulta las graficas que el usuario tiene para el cliente seleccionado
  cargarGraficos() {
    this.graficosService
      .getGraficos(this.userSchemInfo.business.schemaName, this.userSchemInfo.business.id)
      .subscribe(res => {
        if (res.success && res.graficos.length > 0) {
          this.graficas = res.graficos;
          this.graficas.forEach(element => {
            element.dataset = JSON.parse(element.dataset);
            element.dataset.id = element.id;
          });
        } 
      });
  }

  cargarEspaciosTrabajo() {

    const rol = this.userSchemInfo.user.rol
    this.graficosService.getEspaciosTrabajo(this.userSchemInfo.user.id, this.userSchemInfo.business.id, rol)
      .subscribe(res => {
        if (res.success) {
          this.espacios = res.espacios_trabajo;
        } 
      });
  }

  // identifica que cambia de cliente
  cambiaCliente() {
    this.graficas = [];
    this.tablas = [];
    this.espacios = [];
    this.loadItemsMenu();

    // @author eciro
    this.globalService.setSelectEmpresa(this.userSchemInfo);
  }

  // Abre la tabla seleccionada
  /**
   *
   * @author eciro
   * @param id posicion de la tabla en el ngFor
   * @param item Objeto con las propiedades de la tabla seleccionada
   */
  openTable(key, item) {
    if (key !== undefined) {
      // Envia los datos por el observable y es leido en el componente Tabla
      this.globalService.setSelectTable([key, item]);
    }
    this.router.navigate(["origenDatos"], { relativeTo: this.route });
  }
  /**
   * @author eciro
   * @param id posicion de la tabla en el ngFor
   * @param item Objeto con las propiedades de la tabla seleccionada
   */
  openGraphic(key, item) {
    if (key !== undefined) {
      // Envia los datos por el observable y es leido en el componente graphic
      this.globalService.setSelectGrafica([key, item]);
    }
    this.router.navigate(["demoGrafico"], { relativeTo: this.route });
  }

 /**
   * @author eciro
   * @param id posicion de la tabla en el ngFor
   * @param item Objeto con las propiedades de la tabla seleccionada
   */
  openIcon(icon) {
    if (icon !== undefined) {
      // Envia los datos por el observable y es leido en el componente graphic
      this.globalService.setSelectIcon(icon);
    }
    this.router.navigate(["icons"], { relativeTo: this.route });
  }
  /**
   * @author eciro
   * @param key posicion de la tabla en el ngFor
   * @param item Objeto con las propiedades de la tabla seleccionada
   */
   openWorkSpace(key, item, userType) {
      // Envia los datos por el observable y es leido en el componente workSpace
    key !==undefined && userType!=='client' ? this.globalService.setSelectWorkSpace([key, item]) : null;
    key !==undefined && userType==='client' ? this.globalService.setSelectWorkSpaceClient([key, item]) : null;

    userType!=='client' ? this.router.navigate(["workSpace"], { relativeTo: this.route }) : this.router.navigate(["workSpaceClient"], { relativeTo: this.route });
  }


  //Abre el elemento gráfico en el workspace
  drop(event: CdkDragDrop<string[]>, type) {
    this.globalService.setWorkSpaceGraph({data:event.container.data[event.currentIndex], type: type});
    //this.globalService.setWorkSpaceGraph(event);
  }

  //Abre el icono en el espacio de trabajo
  dropIcon(event: CdkDragDrop<string[]>, type) {
    this.globalService.setWorkSpaceIcon ( {data: event.container.data[event.currentIndex], type: type});
    //this.globalService.setWorkSpaceGraph(event);
  }
}
