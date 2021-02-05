import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResultService {

  constructor(private _http:HttpClient) { }
  getResult(json){
    var jsonString=JSON.stringify(json);
    var headers=new HttpHeaders({'Content-Type':'application/json','Accept':'*/*'});
    return this._http.post("http://localhost:8000/buscar/",jsonString,{headers});
  }
}
