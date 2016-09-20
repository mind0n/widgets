import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HeroDetailComponent } from './herodetail.component';
import {HeroesComponent} from './hero.component';
import {routing} from './app.routing';

@NgModule({
  imports:      [BrowserModule, FormsModule, routing],
  declarations: [AppComponent, HeroDetailComponent, HeroesComponent],
  bootstrap:    [AppComponent]
})
export class AppModule { }
