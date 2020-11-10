import { userLoginInterface } from "./originData.Interfaces";

//Modelo de los datos del usuario logueado
export interface userSchemInfoInterface {
  user: userLoginInterface;
  business: businessInterface
}
//Modelo de los datos de la empresa/cliente
export interface businessInterface {
  id: number;
  name: string;
  description: string;
  creationDate: string;
  schemaName: string;
}
