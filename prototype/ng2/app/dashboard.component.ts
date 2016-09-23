import {Component, OnInit} from "@angular/core";
import {Hero} from "./hero";
import {HeroService} from "./hero.service";
import {ActivatedRoute,Params} from "@angular/router";

@Component({
    selector:'my-dashboard',
    //templateUrl:'app/dashboard.component.html',
    template:`
<h3>Top Heroes</h3>
<div class="grid grid-pad">
  <div *ngFor="let hero of heroes" (click)="gotoDetail(hero)" class="col-1-4">
    <div class="module hero">
      <h4>{{hero.name}}</h4>
    </div>
  </div>
</div>
    `,
    providers:[HeroService, ActivatedRoute]
})
export class DashboardComponent implements OnInit{
    heroes:Hero[];
    constructor(private heroService:HeroService){}
    ngOnInit():void{
        this.heroService.getHeros().then((heroes)=>{this.heroes = heroes.splice(0, 5)});        
    }
    gotoDetail(hero:Hero){

    }
}