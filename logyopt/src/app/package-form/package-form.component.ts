import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Package } from './package';

@Component({
  selector: 'app-package-form',
  templateUrl: './package-form.component.html',
  styleUrls: ['./package-form.component.scss']
})
export class PackageFormComponent implements OnInit {
  @ViewChild('packageForm', { static: false }) packageForm: NgForm;
  description:string;
  weight:Number;
  volume:Number;
  packages:Package[];
  edit:boolean;
  idCounters;

  constructor(public dialogRef: MatDialogRef<PackageFormComponent>,@Inject(MAT_DIALOG_DATA) data) {
    this.packages=[];
    console.log(data);

    this.idCounters=data.idCounters;
    //Se recibe de map el objeto data que contiene options del marker
    if(data.options)
    {
      //Se asigna a packages los paquetes que vienen de map que ya tenía cargado el marker anteriormente
      this.edit=true;
      this.packages=data.options.packages;
    }

    console.log(this.edit);
    console.log(this.idCounters);
  }

  deletepackage(index)
  {
    this.packages.splice(index,1);
  }

  save()
  {
    if(this.packages.length>0)
    {
      this.dialogRef.close(this.packages);
    }
    else 
    {
      this.dialogRef.close();
    }
  }

  close()
  {
    this.dialogRef.close();
  }

  onSubmit()
  {
    this.packages.push(new Package(this.idCounters.idPackages,this.volume,this.weight,this.description));
    this.idCounters.idPackages++;
    this.packageForm.resetForm();
  }

  ngOnInit() {
  }

}
