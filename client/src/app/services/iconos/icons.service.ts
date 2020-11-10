import { Injectable } from "@angular/core";
import { global } from "../global";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { imagesInterface, iconInterface } from "../../interfaces/icons.interfaces";
import { ejeValue } from "src/app/interfaces/listFieldCDK";
import { businessInterface } from "src/app/interfaces/inicio.interfaces";
@Injectable({
    providedIn: "root"
})
export class iconsService {
    URL_API: string;
  constructor(private http: HttpClient) {
    this.URL_API = global.baseURL;
  }

  getIcons(schemaID: number){
    const token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
      const headers =  { headers: new HttpHeaders().append(`token`, token)};
        return this.http.get<{success:boolean, result: Array<iconInterface>}>(this.URL_API+`getIcons/${schemaID}`, headers)
  }

  getIconsID(schemaID: number, iconID: number){
    const token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
      const headers =  { headers: new HttpHeaders().append(`token`, token)};
        return this.http.get<{success:boolean, result: Array<iconInterface>}>(this.URL_API+`getIcons/${schemaID}/${iconID}`, headers)
  }
  
  getImages(){
    const token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
    const headers =  { headers: new HttpHeaders().append(`token`, token)};
      return this.http.get<{success:boolean, result: Array<imagesInterface>}>(this.URL_API+`getImages`, headers)
  }


  saveIcon(icon: iconInterface){
    const token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
    const headers =  { headers: new HttpHeaders().append(`token`, token)};
      return this.http.post<{success:boolean, result: any}>(this.URL_API+`saveIcon`, icon, headers)
  }

  doCalculate(field: ejeValue, schema: businessInterface, table:string){
    const token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
    const headers =  { headers: new HttpHeaders().append(`token`, token)};
      return this.http.post<{success:boolean, result: any}>(this.URL_API+`doCalculate`, {field: field, schema: schema, table: table}, headers)

  }
}