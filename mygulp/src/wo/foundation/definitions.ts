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
interface Object{
	oread(keys:string[]):any;
	owrite(keys:string[], val:any):void;
}
// Element.ts
interface Element{
	[name:string]:any;
	astyle(styles:string[]):string;
	set(val:any):void;
	get(keys:string[]):any;
	destroyStatus:any;
	dispose():any;
	visible():boolean;
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
		//delete this[i];
		let tmp = this.pop();
		tmp = null;
	}
}
