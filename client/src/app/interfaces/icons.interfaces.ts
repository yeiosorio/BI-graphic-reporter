import { ejeValue } from "./listFieldCDK";

export interface iconInterface {
    id: number;
    name: string;
    image: imagesInterface;
    description: string;
    businessID: number;
    field: {ejeValue: ejeValue, table: string};
    textValue: string;
    onlyText: boolean;
    table:string;
    stateCreation: string;
}

export interface imagesInterface {
    id: number;
    url: string;
    image: any;
}