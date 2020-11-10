import { Usuario } from '../../models/usuario';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { global } from '../global';
import { Cliente } from 'src/app/models/cliente';

import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { workspaceClient } from 'src/app/interfaces/WorkSpaces.Interfaces';
import { iconInterface } from 'src/app/interfaces/icons.interfaces';

interface responDepto {
	success: boolean;
	departamentos: [];

}
interface responCiudad {

	success: boolean;
	ciudades: [];

}
@Injectable({
	providedIn: 'root'
})
export class GlobalService {
	URL_API: string;

	private table = new BehaviorSubject(null);
	private grafica = new BehaviorSubject(null);
	private icon = new BehaviorSubject(null);
	private workSpace= new BehaviorSubject(null);
	private workSpaceClient= new BehaviorSubject(null);
	private selectEmpresa = new BehaviorSubject(null);
	private lisTablas = new BehaviorSubject(null);
	private addGrahp = new Subject();
	private addIcon= new Subject();
	private addWorkSpace= new Subject();
	private addDataOrigin = new Subject();
	private workSpaceGraph = new BehaviorSubject(null);
	private workSpaceIcon = new BehaviorSubject(null);

	private previousUrl: string = undefined;
	private currentUrl: string = undefined;
	  
	constructor(private http: HttpClient) {	
		this.URL_API = global.baseURL;
	}

	//Consulta los usuarios
	getWorkspaceUsers(idWorkSpace) {
		const token = sessionStorage
			.getItem('token')
			.substring(1, sessionStorage.getItem('token').length - 1);
		return this.http.get<{success:string, res:Array<workspaceClient>}>(this.URL_API + `getWorkspaceUsers/${idWorkSpace}`, {
			headers: new HttpHeaders().append('token', token)
		});
	}
	//Consulta los usuarios
	assignUsersToWorkSpace( users) {
		const token = sessionStorage
			.getItem('token')
			.substring(1, sessionStorage.getItem('token').length - 1);
		return this.http.post<{success:string, message: string}>(this.URL_API + `assignUsersToWorkSpace`, users,{
			headers: new HttpHeaders().append('token', token)
		});
	}

	// consulta los departamentos
	getDepartamentos() {
		let token = sessionStorage
			.getItem('token')
			.substring(1, sessionStorage.getItem('token').length - 1);
		return this.http.get<responDepto>(this.URL_API + `getDepartamentos`, {
			headers: new HttpHeaders().append('token', token)
		});
	}
	// consulta las ciudades de acuerdo al departamentos
	getCiudad(departamento_id: string) {
		let token = sessionStorage
			.getItem('token')
			.substring(1, sessionStorage.getItem('token').length - 1);
		return this.http.get<responCiudad>(this.URL_API + `getCiudadPorDepartamento/${departamento_id}`, {
			headers: new HttpHeaders().append('token', token)
		});
	}

	testServiceYei(){
		let url="";
		let headers ={};
		return this.http.post(url, headers);
	}

	setSelectTable(items: any){
		this.table.next(items);
	}

	getSelectTable(): Observable<any> {		
		return this.table.asObservable();
	}

	setSelectGrafica(items: any){
		this.grafica.next(items);
	}

	getSelectGrafica():Observable<any>{
		return this.grafica.asObservable();
	}

	setSelectIcon(items: any){
		this.icon.next(items);
	}

	getSelectIcon():Observable<iconInterface>{
		return this.icon.asObservable();
	}

	setSelectWorkSpace(items: any){
		this.workSpace.next(items);
	}

	getSelectWorkSpace(): Observable<any>{
		return this.workSpace.asObservable();
	}

	setSelectWorkSpaceClient(items: any){
		this.workSpaceClient.next(items);
	}

	getSelectWorkSpaceClient(): Observable<any>{
		return this.workSpaceClient.asObservable();
	}

	setSelectEmpresa(empresaId:any){
		this.selectEmpresa.next(empresaId);
	}

	getSelectEmpresa():Observable<any>{
		return this.selectEmpresa.asObservable();
	}

	setListTablas(tablas:any){
		this.lisTablas.next(tablas);
	}

	getListTablas():Observable<any>{
		return this.lisTablas.asObservable();
	}
	
	successAddGraph(){
		this.addGrahp.next();
	}

	getAddGraph(){
		return this.addGrahp.asObservable();
	}

	successAddIcon(){
		this.addIcon.next();
	}

	getAddIcon(){
		return this.addIcon.asObservable();
	}

	successAddWorkSpace(){
		this.addWorkSpace.next();
	}

	getAddWorkSpace(){
		return this.addWorkSpace.asObservable();
	}

	successAddDataOrigin(){
		this.addDataOrigin.next();
	}

	getAddDataOrigin(){
		return this.addDataOrigin.asObservable();
	}

	getWorkSpaceGraph(){
		return this.workSpaceGraph.asObservable();
	}

	setWorkSpaceGraph(graph){
		this.workSpaceGraph.next(graph);
	}

	getWorkSpaceIcon(){
		return this.workSpaceIcon.asObservable();
	}

	setWorkSpaceIcon(icon: any){
		this.workSpaceIcon.next(icon);
	}

	functionTest(campos){
		let token = sessionStorage
			.getItem('token')
			.substring(1, sessionStorage.getItem('token').length - 1);
		return this.http.get<any>(this.URL_API + `getFunctionTest`, {
			headers: new HttpHeaders().append('token', token)
		});
	}
}
