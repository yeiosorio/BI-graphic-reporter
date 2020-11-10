import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { global } from '../global';
interface respond {
	success: string;
	message: string;
}
@Injectable({
	providedIn: 'root'
})
export class PlanService {
	URL_API: string;
	header = new HttpHeaders();
	constructor(private http: HttpClient) {
		this.URL_API = global.baseURL;
	}

	asociarPlan(info: any) {
		let token = localStorage
			.getItem('token')
			.substring(1, localStorage.getItem('token').length - 1);
		return this.http.post<respond>(this.URL_API + `asocUsuarioPlan`, info, {
			headers: new HttpHeaders().append('token', token)
		});
	}
}
