export class global {
	// cantante de la conexion a los servicios back
	public static get baseURL(): string {
		//return 'http://192.168.2.111:8000/';
		return 'http://localhost:8000/';
	}
	// de prueba
	public static get nameApp(): string {
		return 'BI-GL';
	}
}