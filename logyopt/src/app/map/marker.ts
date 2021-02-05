import { Package } from "../package-form/package";

export class Marker{
    id:number;
    lat:number;
    lon:number;
    packages:Package[];
    constructor($id,$lat,$lon,$packages){
        this.lat=$lat;
        this.lon=$lon;
        this.packages=$packages;
        this.id=$id;
    }
}