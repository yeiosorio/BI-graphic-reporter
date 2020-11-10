import { Injectable } from '@angular/core';
import { global } from "../global";
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { infoCDCInterface } from 'src/app/interfaces/info-cdc.Interfaces';

@Injectable({
  providedIn: 'root'
})
export class InforCdcService {

  URL_API: string;
  constructor(private http: HttpClient) {
    this.URL_API = global.baseURL;
  }

  getInfo(){
    const token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
      const headers =  { headers: new HttpHeaders().append(`token`, token)};
        return this.http.post<{success:boolean, result: Array<infoCDCInterface>}>(this.URL_API+`getTotalInfoCDC`, headers)
  }
  
  getClients(){
    const token = sessionStorage
      .getItem("token")
      .substring(1, sessionStorage.getItem("token").length - 1);
      const headers =  { headers: new HttpHeaders().append(`token`, token)};
        return this.http.get<{success:boolean, result: Array<any>}>(this.URL_API+`getClientsInfoCDC`, headers)
  }
}
