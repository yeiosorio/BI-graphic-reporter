import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { global } from "../global";
import { fieldCDK } from "src/app/interfaces/listFieldCDK";
import { Observable } from "rxjs";
import { WorkSpaceInterface } from "src/app/interfaces/WorkSpaces.Interfaces";
interface respond {
  success: string;
}
interface respondGrafica {
  success: string;
  insert_id: string;
}
interface respondGraph {
  success: string;
  graficos: [];
}

interface resultSaveWorkSpace {
  success: boolean,
  result: Array<any>,
  subResult: Array<any>,
  idWorkSpace: number
}

interface respondSpace {
  success: string;
  espacios_trabajo: Array<WorkSpaceInterface>;
}

@Injectable({
  providedIn: "root"
})
export class GraficosService {
  URL_API: string;
  constructor(private http: HttpClient) {
    this.URL_API = global.baseURL;
  }

  //Obtiene los dataSets para el grafico
  postPaintGraph(data: fieldCDK, dates) {
    let token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
    return this.http.post<any>(this.URL_API + `api/paintGraph`, {data:data, dates:dates}, {
      headers: new HttpHeaders().append("token", token)
    });
  }

  // consulta la informacion de la tabla que el usuario seleccione
  getQueryGraph(
    table: string,
    campoX: string,
    campoY: string,
    esquema: string,
    tipoConsulta
  ) {
    let token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
    if (tipoConsulta == 1) {
      return this.http.get(
        this.URL_API +
          "api/" +
          `infoGraph/${table}&${campoX}&${campoY}&${esquema}`,
        {
          headers: new HttpHeaders().append("token", token)
        }
      );
    }
    if (tipoConsulta == 2) {
      return this.http.get(
        this.URL_API +
          "api/" +
          `infoGraph2/${table}&${campoX}&${campoY}&${esquema}`,
        {
          headers: new HttpHeaders().append("token", token)
        }
      );
    }
    if (tipoConsulta == 3) {
      return this.http.get(
        this.URL_API +
          "api/" +
          `infoGraph3/${table}&${campoX}&${campoY}&${esquema}`,
        {
          headers: new HttpHeaders().append("token", token)
        }
      );
    }
  }
  // guarda la grafica creada o generada por el usuario
  guardarGrafica(
    nombre: string,
    dataset,
    businessID: number,
    tipo: string,
    descGrafico: string
  ) {
    let token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
    return this.http.post<respondGrafica>(
      this.URL_API + `guardarDatosGrafica`,
      {
        nombGrafico: nombre,
        dataset: dataset,
        businessID: businessID,
        type: tipo,
        descGrafico: descGrafico
      },
      {
        headers: new HttpHeaders().append("token", token)
      }
    );
  }

  // consultar las graficas que tiene este esquema y cliente del usuario
  getGraficos(schemaID: string, clientID: number) {
    let token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);

    return this.http.post<respondGraph>(
      this.URL_API + `getListaGraficosEmpresa`,
      { esquema: schemaID, empresa_id: clientID },
      {
        headers: new HttpHeaders().append("token", token)
      }
    );
  }
  // guarda espacios de trabajo
  guardarEspacioTrabajo(graphic_dataset, name, schemaID, description) {
    let token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
    return this.http.post<respondGraph>(
      this.URL_API + `guardarEspacioTrabajo`,
      {
        dataset_graficas: graphic_dataset,
        nombre: name,
        esquema_id: schemaID,
        descripcion: description
      },
      {
        headers: new HttpHeaders().append("token", token)
      }
    );
  }

  saveWorkSpace(dataWorkSpace:WorkSpaceInterface) {
    let token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
    return this.http.post<resultSaveWorkSpace>(
      this.URL_API + `saveWorkSpace`,
      dataWorkSpace,
      {
        headers: new HttpHeaders().append("token", token)
      }
    );
  }

  saveChangesWorkSpace(dataWorkSpace:WorkSpaceInterface) {
    let token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
    return this.http.post<resultSaveWorkSpace>(
      this.URL_API + `saveChangesWorkSpace`,
      dataWorkSpace,
      {
        headers: new HttpHeaders().append("token", token)
      }
    );
  }

  // guarda espacios de trabajo
  editarEspacioTrabajo(id, dataset_graficas, nombre, esquema_id, descripcion) {
    let token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
    return this.http.post<respondGrafica>(
      this.URL_API + `editarEspacioTrabajo`,
      {
        id: id,
        nombre: nombre,
        dataset_graficas: dataset_graficas,
        esquema_id: esquema_id,
        descripcion: descripcion
      },
      {
        headers: new HttpHeaders().append("token", token)
      }
    );
  }
  // consulta los espacios de trabajo por usuario y empresa
  getEspaciosTrabajo(usuario, empresa, rol) {
    let token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
    return this.http.post<respondSpace>(
      this.URL_API + `getEspaciosPorEmpresaYUsuario`,
      { usuario_id: usuario, empresa_id: empresa, rol: rol },
      {
        headers: new HttpHeaders().append("token", token)
      }
    );
  }
  // consulta la informacion de la tabla
  getInfoTable(empresa_id, nombre_tabla, onlyHeadersInfo: false) {
    let token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
    return this.http.post<{headers:[], columns:[], success: boolean}>(
      this.URL_API + `getTabla`,
      { empresa_id: empresa_id, nombre: nombre_tabla, onlyHeadersInfo: onlyHeadersInfo},
      {
        headers: new HttpHeaders().append("token", token)
      }
    );
  }

  removeWorkSpaceItem(graphId, WorkSpaceId) {
    let token = sessionStorage.getItem("token").substring(1, sessionStorage.getItem("token").length - 1);

    return this.http.post<{headers:[], columns:[], success: boolean}>(
      this.URL_API + `removeWorkSpaceItem`,{ graphId: graphId, WorkSpaceId: WorkSpaceId},
      {
        headers: new HttpHeaders().append("token", token)
      }
    );
  }

  /**
   * @author `Yeison osorio`
   * @desc edicion de grafico
   */
  /**
   * @ModifyBy `eciro`
   * @param nombre  Nombre de la grafica
   * @param graphId  Id de la grafica
   * @param dataset Datos del ChartsJs
   * @param esquema 
   * @param tipo Tipo de grafica
   */
  editarGrafico(
    nombre: string,
    graphId,
    dataset,
    tipo: string
  ): Observable<{ success: boolean }> {
    let token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
    return this.http.post<{ success: boolean }>(
      this.URL_API + `editarGrafico`,
      {
        graphId: graphId,
        nombGrafico: nombre,
        dataset: dataset,
        type: tipo
      },
      {
        headers: new HttpHeaders().append("token", token)
      }
    );
  }
}
