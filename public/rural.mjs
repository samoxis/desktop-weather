import { clamp } from './model.mjs';
import { drawTractor } from './tractor.mjs';
import { createTractorMotion, roadPosition, roadLength, ROAD } from './motion.mjs';
import { drawRiver, drawWaterwheel } from './river.mjs';
import { drawFarm } from './farm.mjs';
import { drawMill } from './mechanics.mjs';

// Coordinates refer to the Romanian scene, not to the browser viewport.
export { ROAD };
export function routePoint(progress) {
  return roadPosition(clamp(progress)*roadLength).point;
}
export function ruralRates(activity) {
  return {
    tractor: activity.wind > 0 ? .012 + activity.wind * .075 : 0,
    mill: activity.fireflies > 0 ? .05 + activity.fireflies * 1.6 : 0,
    wheel: activity.ripples > 0 ? .05 + activity.ripples * 1.9 : 0,
    hay: Math.round(activity.glow * 18),
    rain: Math.round(activity.rain * 150)
  };
}
function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill();
}
function line(ctx, points, color, width = 1) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.stroke();
}
export function createRuralRenderer(ctx, point, sceneScale, tractorImage = null, waterwheelImage = null, waterImage = null, hensImage = null, farmImage = null) {
  const motion=createTractorMotion();
  let millAngle=0,wheelAngle=0,lastStats={};
  const motes=Array.from({length:150},(_,i)=>({x:((i*47+17)%149)/149,y:((i*31+3)%137)/137,phase:i*1.7}));
  return {
    get stats(){return {...lastStats};},
    render({ activity, dt, time, still, night, width, height }) {
      const rates=ruralRates(activity),s=sceneScale();
      const vehicle=motion.step(dt,activity.wind,still);
      if(!still){millAngle+=dt*rates.mill;wheelAngle+=dt*rates.wheel;}
      lastStats={tractorProgress:vehicle.distance/roadLength,tractorSpeed:vehicle.speed,tractorDirection:vehicle.direction,tireAngle:vehicle.tireAngle,millAngle,wheelAngle,waterPhase:wheelAngle,hayBales:rates.hay,rainDrops:rates.rain,tractorLoaded:Boolean(tractorImage?.complete && tractorImage.naturalWidth),waterwheelLoaded:Boolean(waterwheelImage?.complete && waterwheelImage.naturalWidth),farmLoaded:Boolean(hensImage?.complete && hensImage.naturalWidth && farmImage?.complete && farmImage.naturalWidth)};
      drawRiver(ctx,point,s,wheelAngle,night,waterImage);
      // Ambient birds and grazing animals are decorative; meters describe the telemetry mapping.
      for(let i=0;i<4;i++){const p=motes[i],x=((p.x+time*.007)%1)*width,y=(.1+p.y*.12+Math.sin(time+i)*.003)*height;line(ctx,[[x-5,y],[x,y+Math.sin(time*4+i)*2],[x+5,y]],night?'#cbd7d075':'#47594b90',1.5);}
      drawFarm(ctx,point,s,time,night,hensImage,farmImage,rates.hay);
      // GPU: an unmistakable large wooden rotor anchored on the mill facade.
      drawMill(ctx,waterwheelImage,point,s*1.02,millAngle,night);
      // Disk: a riverside waterwheel. Its rate follows I/O, not network traffic.
      drawWaterwheel(ctx,waterwheelImage,point,s,wheelAngle,night);
      // Road vehicle speed and dust visibly follow CPU load; stops at zero/unavailable.
      {const [rx,ry]=vehicle.point,[x,y]=point(rx,ry);drawTractor(ctx,tractorImage,{x,y,scale:s*(.82+ry*.28),phase:vehicle.tireAngle,load:activity.wind,reverse:false,night,moving:!still && vehicle.speed>.1,heading:vehicle.heading,tireAngle:vehicle.tireAngle});}
      // Upload and download are combined for the rain scale, with an intentionally gentle ceiling.
      if(rates.rain){
        const [cloudX,cloudY]=point(.87,.10);
        const mist=ctx.createRadialGradient(cloudX,cloudY,0,cloudX,cloudY,width*.16);
        mist.addColorStop(0,night?'#b9c8d32b':'#eaf0f044');mist.addColorStop(1,'#eaf0f000');
        ellipse(ctx,cloudX,cloudY,width*.16,height*.06,mist);
        for(let i=0;i<rates.rain;i++){const p=motes[i];if(!still)p.y=(p.y+dt*(.25+activity.rain*.18))%1;const [x,y]=point(.76+p.x*.19,.13+p.y*.63);line(ctx,[[x,y],[x-3,y+9]],night?'#c2dfe580':'#527f9d6b',1.3);}
      }
      // Dusk fireflies, slow at rest: decorative, not the primary GPU indicator.
      if(night)for(let i=0;i<12;i++){const p=motes[i+70],[x,y]=point(.1+p.x*.7,.45+p.y*.3+Math.sin(time+p.phase)*.009);ellipse(ctx,x,y,1.8,1.8,'#ffdd9a9c');}
    }
  };
}



