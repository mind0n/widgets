/// Device.ts
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
}

interface HTMLElement{
	destroyStatus:any;
	dispose():any;
}

interface String{
	startsWith(str:string):boolean;
}