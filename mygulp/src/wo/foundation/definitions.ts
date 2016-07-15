interface Window{
	opr:any;
	opera:any;
	chrome:any;
	StyleMedia:any;
	InstallTrigger:any;
	CSS:any;
}

interface Document{
	documentMode:any;
}

// Element.ts
interface Element{
	[name:string]:any;
	astyle(styles:string[]):string;
	destroyStatus:any;
	dispose():any;
}

interface Node{
	cursor:any;
}

interface String{
	startsWith(str:string):boolean;
}

interface Array<T>{
	add(item:T):void;
	clear(del?:boolean):void;
}

Array.prototype.add = function (item:any) {
	this[this.length] = item;
}

Array.prototype.clear = function (keepalive?:boolean) {
	let n = this.length;
	for(let i = n - 1; i >= 0; i--){
		delete this[i];
	}
}
