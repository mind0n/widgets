/// <reference path="definitions.ts" />

Element.prototype.astyle = function actualStyle(props:string[]) {
	let el:Element = this;
	let compStyle:CSSStyleDeclaration = window.getComputedStyle(el, null);
	for (let i:number = 0; i < props.length; i++) {
		let style:string = compStyle.getPropertyValue(props[i]);
		if (style != null) {
			return style;
		}
	}
	return null;
};

module wo{
	class Destroyer{
		disposing:boolean;
		destroying:boolean;
		static container:HTMLElement = document.createElement("div");
		static destroy(target:HTMLElement){
			if (!target.destroyStatus){
				target.destroyStatus = new Destroyer();
			}
			if (target.dispose && !target.destroyStatus.disposing){
				target.destroyStatus.disposing = true;
				target.dispose();
			}
			if (!target.destroyStatus.destroying){
				target.destroyStatus.destroying = true;
				Destroyer.container.appendChild(target);
				for(let i in target){
					if (i.indexOf('$') == 0){
						let tmp:any = target[i];
						if (tmp instanceof HTMLElement){
							target[i] = null;
							tmp = null;
						}else{
							delete target[i];
						}
					}
				}
				Destroyer.container.innerHTML = '';
			}
		}
	}

	export function destroy(target:HTMLElement):void{
		Destroyer.destroy(target);
	}
}

