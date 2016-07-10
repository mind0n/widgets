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

namespace wo{
	class Destroyer{
		disposing:boolean;
		destroying:boolean;
		static container:HTMLElement = document.createElement("div");
		static destroy(target:Element){
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

	export function destroy(target:any):void{
		if (target.length > 0 || target instanceof Array){
			for(let i of target){
				Destroyer.destroy(i);
			}
		} else if (target instanceof Element){
				Destroyer.destroy(target);
		}
	}

	export function centerScreen(target:any){
		let rect = target.getBoundingClientRect();
		target.style.position = "fixed";
		target.style.left = "50%";
		target.style.top = "50%";
		target.style.marginTop = -rect.height / 2 + "px";
		target.style.marginLeft = -rect.width / 2 + "px";
	}
}