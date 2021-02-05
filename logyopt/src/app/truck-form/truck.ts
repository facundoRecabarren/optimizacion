import { Package } from "../package-form/package";

export class Truck{
    id:Number;
    name?:string;
    capacidad:Number;

    //truck result

    dinero_recaudado?:number;
    packages?:Package[];

    constructor($id,$name,$capacidad)
    {
        this.id=$id;
        this.name=$name;
        this.capacidad=$capacidad;
    }

}