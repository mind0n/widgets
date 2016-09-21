import {Component, OnInit} from "@angular/core";
import {Hero} from "./hero";
import {HeroService} from "./hero.service";

@Component({
    selector:'my-dashboard',
    templateUrl:'app/dashboard.component.html',
    providers:[HeroService]
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