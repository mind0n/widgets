import {ModuleWithProviders} from '@angular/core';
import {Routes,RouterModule} from '@angular/router';
import {HeroesComponent} from './hero.component';
import {DashboardComponent} from './dashboard.component';
import {HeroDetailComponent} from './herodetail.component';

const appRoutes: Routes=[
    {path:'', redirectTo:'/dashboard', pathMatch:'full'}
    ,{path:'heroes', component:HeroesComponent}
    ,{path:'dashboard', component:DashboardComponent}
    ,{path:'details/:id', component:HeroDetailComponent}
];

export const routing:ModuleWithProviders = RouterModule.forRoot(appRoutes);
