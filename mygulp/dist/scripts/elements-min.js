Element.prototype.astyle=function(t){for(var e=this,n=window.getComputedStyle(e,null),r=0;r<t.length;r++){var o=n.getPropertyValue(t[r]);if(null!=o)return o}return null};var Destroyer=function(){function t(){}return t.destroy=function(e){if(e.destroyStatus||(e.destroyStatus=new t),e.dispose&&!e.destroyStatus.disposing&&(e.destroyStatus.disposing=!0,e.dispose()),!e.destroyStatus.destroying){e.destroyStatus.destroying=!0,t.container.appendChild(e);for(var n in e)if(n.startsWith("$")){var r=e[n];r instanceof HTMLElement?(e[n]=null,r=null):delete e[n]}t.container.innerHTML=""}},t.container=document.createElement("div"),t}();