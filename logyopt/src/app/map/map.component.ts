import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { on } from 'process';
import { DataService } from '../data/data.service';
import { DeletedialogComponent } from '../deletedialog/deletedialog.component';
import { Package } from '../package-form/package';
import { PackageFormComponent } from '../package-form/package-form.component';
import { Truck } from '../truck-form/truck';
import { TruckFormComponent } from '../truck-form/truck-form.component';
import { Marker } from './marker';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  trucks: Truck[];
  packagesPerMarker: Package[];
  idCounters;
  private map;
  private markers;
  private markersToSend: Marker[] = [];
  markerIcon = L.icon({
    iconSize: [25, 41],
    iconAnchor: [10, 41],
    popupAnchor: [2, -40],
    // specify the path here
    iconUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-shadow.png"
  })
    ;

  constructor(private dialogPackage: MatDialog, private dialogDelete: MatDialog, private dialogTruck: MatDialog, private _router: Router, private _data: DataService) {
    this.markers = [];
    this.packagesPerMarker = [];
    this.idCounters = {
      idPackages: 0,
      idTrucks: 0
    };
    this.trucks = [];
  }

  addTruck() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.disableClose = false;
    dialogConfig.data = {
      idCounters: this.idCounters
    }
    const dialogRef = this.dialogTruck.open(TruckFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      res => {
        if (res) {
          console.log(res);
          this.trucks.push(res);
          console.log(this.trucks);
        }
      }
    );
  }


  //Handle marker click
  onMarkerClick = (e) => {
    console.log(e.target.options);
    //Se carga en data options para enviar al form
    var options = e.target.options;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      options,
      idCounters: this.idCounters
    };
    dialogConfig.disableClose = false;
    const dialogRef = this.dialogPackage.open(PackageFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(res => {
      if (options.packages.length == 0) {
        //Si se han eliminado todos los paquetes del marker entonces se borra el marcador
        this.map.removeLayer(this.markers[options.id]);
        this.markers[options.id] = undefined;
      }
      console.log(e.target.options);
    });
  }

  del = (e) => {
    //Para borrar un marker se busca el id en options
    var id = e.target.options.id;
    console.log(e);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.disableClose = false;
    dialogConfig.data = { text: "el marcador" }
    const dialogRef = this.dialogDelete.open(DeletedialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        //Con el id hacemos referencia al marker a eliminar en el array markers y lo remueve del map
        this.map.removeLayer(this.markers[id]);
        //Se pone en undefined y no se shiftea porque sino se pierde la correspondencia de los ids
        this.markers[id] = undefined;
      }
    });

  }

  optimizar() {
    this.markersToSend = [];
    this.markers.forEach(marker => {
      if (marker != undefined) {
        this.markersToSend.push(new Marker(marker.options.id, marker._latlng.lat, marker._latlng.lng, marker.options.packages));
      }
    });
    var jsonToSend = {
      trucks: this.trucks,
      markers: this.markersToSend
    };
    console.log(this.markersToSend);
    console.log(this.trucks);
    this._data.putMessage(jsonToSend);
    console.log(jsonToSend);
    this._router.navigate(['/result']);
  }

  ngOnInit() {
    this.map = L.map("map").setView([-31.537761471965993, -68.53183507919313], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 17,
      minZoom: 13
    }).addTo(this.map);

    this.map.on("click", e => {
      //log coords
      console.log(e.latlng);
      this.packagesPerMarker = [];
      const dialogConfig = new MatDialogConfig();
      dialogConfig.autoFocus = false;
      dialogConfig.disableClose = true;
      dialogConfig.data = {
        idCounters: this.idCounters
      };
      //dialogPackage cargar paquetes a entregar en el marcador indicado
      const dialogRef = this.dialogPackage.open(PackageFormComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(res => {
        //Si se han cargado paquetes
        if (res) {
          console.log(this.idCounters);
          //Cada paquete cargado se pushea en packagesPerMarker
          res.forEach((pack: Package) => {
            this.packagesPerMarker.push(pack);
          })
          console.log(this.markers);
          //En el arreglo markers se agrega el nuevo marker agregado
          //Cada marcador tiene sobre _latlng las coordenadas
          //Y sobre options el objeto que contiene id, y packages que deben entregarse en ese marker.
          this.markers.push(
            L.marker([e.latlng.lat, e.latlng.lng],
              {
                icon: this.markerIcon,
                draggable: true,
                /*id: this.markers.length,
                packages: this.packagesPerMarker*/
              })
              .on('click', this.onMarkerClick)//Con el evento click sobre un marker llama a onMarkerClick
              .on('contextmenu', this.del)//Con el segundo click llama al del
              .addTo(this.map));
        }
        console.log(this.markers);
      }
      );
    });

  }
}