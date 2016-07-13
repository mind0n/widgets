/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../builder/uicreator.ts" />

namespace wo{
    Widgets.loading = function():any{
        return{
            tag:"div",
            class:"loading",
            made: function(){
                let p1 = wo.use({ui:"arc"});
                p1.setAttributeNS(null, "class", "arc p1");
                p1.update([32, 32], 16, 180);
                this.$sbox.appendChild(p1);                

                let p2 = wo.use({ui:"arc"});
                p2.setAttributeNS(null, "class", "arc p1");
                p2.update([32, 32], 16, 180);
                this.$sbox.appendChild(p2);

                //$element.velocity({ opacity: 1 }, { duration: 1000 });
                p1.style.transformOrigin = "32px 32px";
                p2.style.transformOrigin = "32px 32px";

                let t1 = 1500, t2=1000;
                ($(p1) as any).velocity({rotateZ:"-=360deg"}, {duration:t1, easing:"linear"});
                this.$handle1 = window.setInterval(function() {
                    ($(p1) as any).velocity({rotateZ:"-=360deg"}, {duration:t1, easing:"linear"});
                }, t1);
                ($(p2) as any).velocity({rotateZ:"+=360deg"}, {duration:t2, easing:"linear", loop:true});
            },$:{
                sg:"svg",
                alias:"sbox",
                style:{
                    width:64,
                    height:64
                }
            }
        }; 
    }; 
    Widgets.arc = function():any{
        return{
            sg:"path",
            update:function(center:number[], radius:number, angle:number):void{
                let pend = polarToCartesian(center[0], center[1], radius, angle);
                let pstart = [center[0] + radius, center[1]];
                let d = ["M" + pstart[0], pstart[1], "A" + radius, radius, "0 0 0", pend[0], pend[1]];
                this.setAttributeNS(null, "d", d.join(" "));
            }
        };
    };
    function polarToCartesian(centerX:number, centerY:number, radius:number, angleInDegrees:number) {
        let angleInRadians = angleInDegrees * Math.PI / 180.0;
        let x = centerX + radius * Math.cos(angleInRadians);
        let y = centerY + radius * Math.sin(angleInRadians);
        return [x,y];
    }
}