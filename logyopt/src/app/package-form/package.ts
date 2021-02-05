export class Package{
    id:Number;
    volume:Number;
    weight:Number;
    description:string;

    //packages result

    lat?:number;
    lon?:number;

    constructor($id,$volume,$weight,$description){
        this.volume=$volume;
        this.weight=$weight;
        this.description=$description;
        this.id=$id;
    }
}