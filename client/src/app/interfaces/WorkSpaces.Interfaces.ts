import { fieldCDK } from "./listFieldCDK";
import { NgGridConfig, NgGridItemConfig } from "angular2-grid";
import { iconInterface } from "./icons.interfaces";

//Interface para el usuario asignado
export interface workspaceClient {
  /*id: Array<{
    userName: string;
    id: number;
    checked: boolean;
  }>;*/
  userName: string;
  id: number;
  checked: boolean;
}
export interface configItemGridInterface {
  dragHandle: ".handle";
  col: 1;
  row: 1;
  sizex: 250;
  sizey: 175;
  //sizex: 475;
  //sizey: 475;
  minHeight: 55;
  minWidth: 70;
}

export interface WorkSpaceItemsInterface {
  fieldCDK: fieldCDK; // Datos del Chart de la grafica
  config: configItemGridInterface; // Almacena la configuracion del componente Card que se muestra en el espacio de trabajo (Tamaño y posición)
  type: string; //Indica si es tipo gráfica(Chart) o una tabla
  table: any;
  icon: iconInterface;
  chart: any;
  id: number;
}

export interface WorkSpaceInterface {
  date: {
    init: any;
    end: any;
  };
  name: string; //Nombre del espacio de trabajo
  items: Array<WorkSpaceItemsInterface>; //Almacena los datos de los Charts de las graficas
  description: string; //Descripcion del espacio de trabajo
  idSchema: number;
  idWorkSpace: number;
  creationPhase: string; //Indica si el espacio de trabajo esta siendo creado, editado o ya fue creado en tal caso
}

//se usa clase en vez de interface porque se requiere iniciar los valores
export class gridConfigClass {
  private gridConfig: NgGridConfig = <NgGridConfig>{
    margins: [5],
    draggable: true,
    resizable: true,
    max_cols: 0,
    max_rows: 0,
    visible_cols: 0,
    visible_rows: 0,
    min_cols: 1,
    min_rows: 1,
    col_width: 2,
    row_height: 5,
    cascade: "up",
    min_width: 70,
    min_height: 55,
    fix_to_grid: true,
    auto_style: true,
    auto_resize: false,
    maintain_ratio: false,
    prefer_new: true,
    zoom_on_drag: false,
    limit_to_screen: true,
    element_based_row_height: false,
    center_to_screen: true,
    fix_item_position_direction: "vertical",
    fix_collision_position_direction: "vertical"
  };
  private gridItemConfig:configItemGridInterface = {
    dragHandle: ".handle",
    col: 1,
    row: 1,
    sizex: 250,
    sizey: 175,
    //sizex: 475;
    //sizey: 475;
    minHeight: 55,
    minWidth: 70
  }
  constructor() {}

  public getGridConfig() {
    return this.gridConfig;
  }

  public getItemGridConfig() {
    return this.gridItemConfig;
  }
}
