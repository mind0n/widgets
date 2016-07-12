/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../builder/uicreator.ts" />

namespace wo{
    Widgets.loading = function():any{
        return{
            tag:"div",
            class:"loading",
            made: function(){
                let p1 = this.$p1;
                let pos1 = polarToCartesian(32, 32, 32, 180);
                p1.setAttributeNS(null, "d", "M48 32 A32 32 0 0 0 " + pos1[0] + " " + pos1[1]);
            },$:{
                sg:"svg",
                style:{
                    width:64,
                    height:64
                },
                $:[
                    {sg:"path", alias:"p1", style:{stroke:"#222", fill:"none", strokeWidth:"1"}}
                ]
            }
        }; 
    } 

    function polarToCartesian(centerX:number, centerY:number, radius:number, angleInDegrees:number) {
        let angleInRadians = angleInDegrees * Math.PI / 180.0;
        let x = centerX + radius * Math.cos(angleInRadians);
        let y = centerY + radius * Math.sin(angleInRadians);
        return [x,y];
    }
}