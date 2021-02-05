import { RouterModule, Routes } from "@angular/router";
import { MapComponent } from "./map/map.component";
import { ResultComponent } from "./result/result.component";



const appRoutes:Routes=[
    

    { path: 'result', component: ResultComponent},
    { path: 'optimizar', component:MapComponent },
    { path: '', pathMatch:"full", redirectTo:'/optimizar' },
    { path: '**', redirectTo:'optimizar' },
]

export const APP_ROUTING = RouterModule.forRoot(appRoutes,{useHash:true});