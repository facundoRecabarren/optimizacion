import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Truck } from './truck';

@Component({
  selector: 'app-truck-form',
  templateUrl: './truck-form.component.html',
  styleUrls: ['./truck-form.component.scss']
})
export class TruckFormComponent implements OnInit {

  name:string;
  capacity:number;
  idCounters;

  constructor(public dialogRef: MatDialogRef<TruckFormComponent>,@Inject(MAT_DIALOG_DATA) data) {

    this.idCounters=data.idCounters;

  }

  ngOnInit() {
  }

  save()
  {
    var truck= new Truck(this.idCounters.idTrucks,this.name,Number(this.capacity));
    this.idCounters.idTrucks++;
    this.dialogRef.close(truck);
  }

  close()
  {
    this.dialogRef.close();
  }

}
