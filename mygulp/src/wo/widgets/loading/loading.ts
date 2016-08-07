/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../builder/uicreator.ts" />

namespace wo{
    Widgets.loading = function():any{
        return{
            tag:"div",
            class:"loading",
            made: function(){
                let rd = wo.use({sg:"circle", class:"rd"});
                rd.setAttributeNS(null, "cx", 32);
                rd.setAttributeNS(null, "cy", 32);
                rd.setAttributeNS(null, "r", 16);
                this.$sbox.appendChild(rd);

                let p1 = wo.use({ui:"arc"});
                p1.setAttributeNS(null, "class", "arc p1");
                p1.update([16, 48], 16, 270);
                this.$sbox.appendChild(p1);                

                let p2 = wo.use({ui:"arc"});
                p2.setAttributeNS(null, "class", "arc p1");
                p2.update([16, 48], 16, 270);
                this.$sbox.appendChild(p2);

                //$element.velocity({ opacity: 1 }, { duration: 1000 });
                p1.style.transformOrigin = "32px 32px";
                p2.style.transformOrigin = "50% 50%";

                let t1 = 2000, t2=1400;
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
                let d = ["M" + pstart[0], pstart[1], "A" + radius, radius, "0 1 0", pend[0], pend[1]];
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