import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { PackageFormComponent } from './package-form/package-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatButtonModule, MatCardModule, MatCheckboxModule, MatDatepickerModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatListModule, MatPaginatorModule, MatSelectModule, MatSortModule, MatTableModule, MatTabsModule } from '@angular/material';
import { DeletedialogComponent } from './deletedialog/deletedialog.component';
import { TruckFormComponent } from './truck-form/truck-form.component';
import { ResultComponent } from './result/result.component';
import { APP_ROUTING } from './app.routing';
import { HttpClientModule } from '@angular/common/http';
import { AllInfoComponent } from './result/all-info/all-info.component';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    PackageFormComponent,
    DeletedialogComponent,
    TruckFormComponent,
    ResultComponent,
    AllInfoComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    BrowserModule,
    MatButtonModule,
    MatDialogModule,
    MatButtonModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatListModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatTableModule,
    MatCardModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatInputModule,
    MatPaginatorModule,
    HttpClientModule,
    MatSortModule,
    APP_ROUTING
  ],
  providers: [],
  entryComponents:[PackageFormComponent,DeletedialogComponent,TruckFormComponent,AllInfoComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
