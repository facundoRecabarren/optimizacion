import { Component, OnInit } from '@angular/core';
import { DataService } from '../data/data.service';
import { Marker } from '../map/marker';
import * as L from 'leaflet';
import "leaflet";
import 'leaflet-routing-machine';
import { Truck } from '../truck-form/truck';
import { Package } from '../package-form/package';

import { AntPath, antPath } from 'leaflet-ant-path';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { AllInfoComponent } from './all-info/all-info.component';
//import { request } from 'http';
import { HttpClientModule } from '@angular/common/http';
import { ResultService } from './result.service';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {

  ///

  displayedColumns: string[] = ['id', 'capacidad', 'dinero_recaudado', 'acciones'];



  ///



  private trucks: Truck[];
  private markers: Marker[];
  private map;

  private antRoutes = [];

  private routes = [];


  private truckRoutes;

  private markersForRoute = [];

  private basepoint = { lat: -31.530967, lon: -68.521479 };

  markerIcon = L.icon({
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    popupAnchor: [2, -40],
    // specify the path here
    iconUrl: "assets/iconcamion.png",
    shadowUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-shadow.png"
  });

  baseIcon = L.icon({
    iconSize: [50, 82],
    iconAnchor: [25, 82],
    popupAnchor: [2, -40],
    // specify the path here
    iconUrl: "assets/almacen.png",
    shadowUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-shadow.png"
  });

  private trucksResult;
  /*private jsonTemp = {
    Vol_Total_Usado: 1355.0,
    peso_total: 91,
    camiones: [
      {
        id: 1,
        capacidad: 1000,
        dinero_recaudado: 910,
        packages: [
          { id: 1, weight: 20, volume: 50, lat: -31.540313, lon: -68.509977 },
          { id: 2, weight: 30, volume: 60, lat: -31.539301, lon: -68.531530 },
          { id: 9, weight: 19, volume: 900, lat: -31.529852, lon: -68.537292 }
        ]
      },
      {
        id: 2,
        capacidad: 1300,
        dinero_recaudado: 0,
        packages: [
          { id: 1, weight: 20, volume: 50, lat: -31.533831, lon: -68.521864 },
          { id: 1, weight: 20, volume: 50, lat: -31.530667, lon: -68.526437 },
          { id: 1, weight: 20, volume: 50, lat: -31.530842, lon: -68.529437 },
          { id: 1, weight: 20, volume: 50, lat: -31.527814, lon: -68.531887 }
        ]
      }
    ]
  };*/

  //dataSource = this.jsonTemp.camiones;
  dataSource;
  constructor(private _data: DataService, private _http: HttpClient, private dialogAllInfo:MatDialog, private _result:ResultService) {  }
  


  allInfo(indice:number)
  {
    console.log(indice);
    console.log(this.trucksResult[indice]);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.disableClose = false;
    dialogConfig.data = this.trucksResult[indice]
    
    const dialogRef = this.dialogAllInfo.open(AllInfoComponent, dialogConfig);
  }

  allTheWays()
  {
    for(let i=0;i<this.truckRoutes.length;i++)
    {
      if(!this.truckRoutes[i].active)
      {
        this.truckRoutes[i].route.addTo(this.map);
        this.truckRoutes[i].active = true;
        for(let j=0;j<this.markersForRoute[i].length;j++)
        {
          this.markersForRoute[i][j].addTo(this.map);
        }
      }
    }
  }

  async loadMarkersAndRoutes() {
    let markersForRouteTemp;
    let rutas=[]
    for (let i = 0; i < this.trucksResult.length; i++) {
      var pointsToGet = [];
      markersForRouteTemp = [];
      pointsToGet.push(this.basepoint);

      if (this.trucksResult[i].packages.length >= 1) {

        for (let j = 0; j < this.trucksResult[i].packages.length; j++) {
          markersForRouteTemp.push(L.marker([this.trucksResult[i].packages[j].lat, this.trucksResult[i].packages[j].lon],
            {
              icon: this.markerIcon,
              draggable: true
            })
            .addTo(this.map));
          pointsToGet.push({ lat: this.trucksResult[i].packages[j].lat, lon: this.trucksResult[i].packages[j].lon });
        }

        pointsToGet.push(this.basepoint);
        this.markersForRoute.push(markersForRouteTemp);

        let ruta = await this.createRoute(pointsToGet);
        console.log(ruta);
        rutas.push(ruta);
        
      }
    }
    return rutas;
  }

  createRoute(pointsToGet) {
    return new Promise((resolve,reject)=>{
      var coordenadas;
      var temp
      var route;
      console.log(pointsToGet);
  
      this.getPoints(pointsToGet).subscribe(coords => {
        coordenadas = coords;
        route = this.createAntRoute(coordenadas);
        console.log(route);
      },
      err=>{reject(err)},
      ()=>{
        temp = { route: route, active: true };
        console.log(temp);
        resolve(temp);
      });
    })




    /* .subscribe(res => {
              ruta = res;
              let truckRoute={route:this.createAntRoute(ruta),active:true};
              this.truckRoutes.push(truckRoute);
            }); */

    /*         var route = L.Routing.control({
              router: L.Routing.osrmv1({
                serviceUrl: `http://router.project-osrm.org/route/v1/`
            }),
              waypoints: points,
              routeWhileDragging: true,
              
            }).addTo(this.map); */


    /*         var antPolyline = new AntPath(points,{use:L.polygon,fillColor:"red"});
            
            antPolyline.addTo(this.map) */

    /* 
            this.routes.push(route); */

  }


  getPoints(puntosPeticion) {
    var stPoints = ""
    for (let i = 0; i < puntosPeticion.length; i++) {
      if (i < puntosPeticion.length - 1) {
        stPoints += puntosPeticion[i].lon + "," + puntosPeticion[i].lat + ";";
      }
      else {
        stPoints += puntosPeticion[i].lon + "," + puntosPeticion[i].lat;
      }
    }
    console.log(stPoints);
    let resp = this._http.get("http://router.project-osrm.org/route/v1/driving/" + stPoints + "?alternatives=false&geometries=geojson&steps=true&overview=false");
    return resp;
  }


  onlyOneWay(indice: number) {
    console.log(indice);
    console.log(this.truckRoutes);
    console.log(this.markersForRoute);
    for (let i = 0; i < this.truckRoutes.length; i++) {
      if (i != indice && this.truckRoutes[i].active) {
        for (let j = 0; j < this.markersForRoute[i].length; j++) {
          this.map.removeLayer(this.markersForRoute[i][j]);
        }
        this.map.removeLayer(this.truckRoutes[i].route);
        this.truckRoutes[i].active = false;
      }
    }
    if (!this.truckRoutes[indice].active) {
      this.truckRoutes[indice].active = true;
      this.truckRoutes[indice].route.addTo(this.map);
      for (let h = 0; h < this.markersForRoute[indice].length; h++) {
        this.markersForRoute[indice][h].addTo(this.map);
      }
    }

  }


  createAntRoute(ruta) {

    var coords = [];
    console.log(ruta);
    for (let i = 0; i < ruta.routes[0].legs.length; i++) {
      for (let j = 0; j < ruta.routes[0].legs[i].steps.length; j++) {
        for (let k = 0; k < ruta.routes[0].legs[i].steps[j].geometry.coordinates.length; k++) {
          coords.push([ruta.routes[0].legs[i].steps[j].geometry.coordinates[k][1], ruta.routes[0].legs[i].steps[j].geometry.coordinates[k][0]]);
        }
      }
    }
    console.log(coords);

    var randomcolor = Math.floor(Math.random() * 16777215).toString(16);
    var pulsecolor = Math.floor(Math.random() * 16777215).toString(16);

    var antPolyline = new AntPath(coords, { use: L.polyline, delay: 1000, opacity: 0.8, weight: 5, color: "#" + randomcolor, pulseColor: "#" + pulsecolor, popup: "Hola hola" });
    antPolyline.addTo(this.map);
    return antPolyline;
  }

  ngOnInit() {
    this.map = L.map("map").setView([-31.537761471965993, -68.53183507919313], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 17,
      minZoom: 13
    }).addTo(this.map);


    this._data.currentMessage.subscribe((mess: any) => {
      console.log("/result");
      this.trucks = mess.trucks;
      this.markers = mess.markers;
      this._result.getResult(mess).subscribe((respuesta: any) => {
        this.trucksResult = respuesta.camiones;
        this.dataSource = this.trucksResult;
        console.log("///////////");
        console.log(this.trucksResult);
        L.marker([-31.530967, -68.521479],
          {
            icon: this.baseIcon,
            draggable: true
            /*                 id: this.markers.length,
                    packages: this.packagesPerMarker */
          })
          .addTo(this.map);
    
        this.loadMarkersAndRoutes().then(rutas=>{
          this.truckRoutes=rutas;
          console.log(this.truckRoutes);
        })
      });
      console.log(this.trucks);
      console.log(this.markers);
    }),
      err => console.log(err),
      () => {
        
      }
    //this.trucksResult = this.jsonTemp.camiones;




  }

}
