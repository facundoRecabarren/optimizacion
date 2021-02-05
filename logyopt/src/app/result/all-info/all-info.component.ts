import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-all-info',
  templateUrl: './all-info.component.html',
  styleUrls: ['./all-info.component.scss']
})
export class AllInfoComponent implements OnInit {

  private dataDialog;
  constructor(public dialogRef: MatDialogRef<AllInfoComponent>,@Inject(MAT_DIALOG_DATA) data) {
    console.log(data);
    this.dataDialog=data;
  }

  ngOnInit() {
  }

}
