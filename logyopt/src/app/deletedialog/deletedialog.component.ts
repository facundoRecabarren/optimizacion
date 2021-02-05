import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-deletedialog',
  templateUrl: './deletedialog.component.html',
  styleUrls: ['./deletedialog.component.scss']
})
export class DeletedialogComponent implements OnInit {

  text:string;

  constructor(@Inject(MAT_DIALOG_DATA) data,private dialogRef: MatDialogRef<DeletedialogComponent>) {
    this.text=data.text;
  }

  ngOnInit() {
  }

  close()
  {
    this.dialogRef.close()
  }

  eliminar()
  {
    this.dialogRef.close(true);
  }

}
