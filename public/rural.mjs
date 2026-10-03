import { clamp } from './model.mjs';
import { drawTractor } from './tractor.mjs';

// Coordinates refer to the Romanian scene, not to the browser viewport.
export const ROAD = [[.273,.546],[.30,.596],[.36,.636],[.44,.678],[.53,.709],[.596,.713]];
export function routePoint(progress) {
  const position = clamp(progress) * (ROAD.length - 1), index = Math.min(ROAD.length - 2, Math.floor(position)), t = position - index;
  const a = ROAD[index], b = ROAD[index + 1];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
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
function shadow(ctx, rx, ry) { ellipse(ctx,0,6,rx,ry,'#26361e35'); }
function hayBale(ctx,x,y,s){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);shadow(ctx,9,3);
  const straw=ctx.createLinearGradient(-9,-15,9,2);straw.addColorStop(0,'#ead094');straw.addColorStop(.5,'#ba9650');straw.addColorStop(1,'#74592e');
  ellipse(ctx,0,-7,10,8,straw);ellipse(ctx,-4,-7,6,8,'#c9a864');
  ctx.strokeStyle='#90703a';ctx.lineWidth=.7;
  for(const radius of [2,4,6]){ctx.beginPath();ctx.ellipse(-4,-7,radius*.7,radius,0,0,Math.PI*2);ctx.stroke();}
  line(ctx,[[4,-14],[4,0]],'#6f623b',1);ctx.restore();
}
function rotor(ctx, x, y, scale, angle, water = false) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.rotate(angle);
  if(water){
    ctx.scale(1,.84);ctx.strokeStyle='#604b2f';ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,0,31,0,Math.PI*2);ctx.stroke();
    ctx.lineWidth=2;ctx.strokeStyle='#c2a170';ctx.beginPath();ctx.arc(0,0,27,0,Math.PI*2);ctx.stroke();
    for(let i=0;i<10;i++){ctx.save();ctx.rotate(i*Math.PI/5);line(ctx,[[0,0],[30,0]],'#71583a',3);ctx.fillStyle='#947046';ctx.fillRect(25,-7,10,14);ctx.restore();}
  }else{
    for(let i=0;i<4;i++){ctx.save();ctx.rotate(i*Math.PI/2);const timber=ctx.createLinearGradient(0,0,55,0);timber.addColorStop(0,'#6a4a2c');timber.addColorStop(1,'#ad8a59');ctx.fillStyle=timber;ctx.fillRect(0,-3,64,6);ctx.fillStyle='#dcc8a0';ctx.fillRect(22,-16,41,13);for(let j=0;j<6;j++)line(ctx,[[24+j*7,-16],[24+j*7,-3]],'#8c704d',1);ctx.restore();}
  }
  ellipse(ctx,0,0,6,6,'#694b31');ellipse(ctx,0,0,2,2,'#e9d0a0');ctx.restore();
}
function sheep(ctx,x,y,scale,time,index){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);shadow(ctx,12,3);
  for(const k of [-7,5])line(ctx,[[k,0],[k+Math.sin(time*3+index)*2,8]],'#514f40',2);
  ellipse(ctx,0,-4,12,7,'#eee4c9');ellipse(ctx,-5,-7,6,4,'#f9f3df');ellipse(ctx,5,-7,5,4,'#f9f3df');ellipse(ctx,12,-5,4,5,'#615b47');ellipse(ctx,13,-7,.8,.8,'#161f17');ctx.restore();
}
function chicken(ctx,x,y,scale,time){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);shadow(ctx,5,2);
  line(ctx,[[-2,0],[-3+Math.sin(time*8),4]],'#bb8d37',1);line(ctx,[[2,0],[3-Math.sin(time*8),4]],'#bb8d37',1);
  ellipse(ctx,0,-3,5,4,'#f8ebcc');ellipse(ctx,4,-6,3,3,'#fff2d7');ellipse(ctx,4,-9,2,1.4,'#c45646');line(ctx,[[6,-6],[9,-5]],'#d6a143',1.8);line(ctx,[[-3,-4],[-7,-7]],'#8b754a',2);ctx.restore();
}

export function createRuralRenderer(ctx, point, sceneScale, tractorImage = null) {
  let tractorProgress=.26,millAngle=0,wheelAngle=0,lastStats={};
  const motes=Array.from({length:150},(_,i)=>({x:((i*47+17)%149)/149,y:((i*31+3)%137)/137,phase:i*1.7}));
  return {
    get stats(){return {...lastStats};},
    render({ activity, dt, time, still, night, width, height }) {
      const rates=ruralRates(activity),s=sceneScale();
      if(!still){tractorProgress=(tractorProgress+dt*rates.tractor)%2;millAngle+=dt*rates.mill;wheelAngle+=dt*rates.wheel;}
      lastStats={tractorProgress,millAngle,wheelAngle,hayBales:rates.hay,rainDrops:rates.rain,tractorLoaded:Boolean(tractorImage?.complete && tractorImage.naturalWidth)};
      // Ambient birds and grazing animals are decorative; meters describe the telemetry mapping.
      for(let i=0;i<4;i++){const p=motes[i],x=((p.x+time*.007)%1)*width,y=(.1+p.y*.12+Math.sin(time+i)*.003)*height;line(ctx,[[x-5,y],[x,y+Math.sin(time*4+i)*2],[x+5,y]],night?'#cbd7d075':'#47594b90',1.5);}
      for(let i=0;i<6;i++){const [x,y]=point(.64+(i%3)*.02+Math.sin(time*.32+i)*.006,.36+Math.floor(i/3)*.017);sheep(ctx,x,y,s*.8,time,i);}
      for(let i=0;i<5;i++){const [x,y]=point(.47+i*.012+Math.sin(time*.6+i)*.006,.508+Math.cos(time*.55+i)*.009);chicken(ctx,x,y,s,time+i);}
      // GPU: an unmistakable large wooden rotor anchored on the mill facade.
      {const [x,y]=point(.724,.287);rotor(ctx,x,y,s*1.02,millAngle);}
      // Disk: a riverside waterwheel. Its rate follows I/O, not network traffic.
      {const [x,y]=point(.720,.658);rotor(ctx,x,y,s*.9,wheelAngle,true);}
      // RAM: fill the visible courtyard with neatly stacked bales, not barely visible glows.
      for(let i=0;i<rates.hay;i++){const col=i%6,row=Math.floor(i/6),[x,y]=point(.506+col*.014,.457-row*.012);hayBale(ctx,x,y,s);}
      // Road vehicle speed and dust visibly follow CPU load; stops at zero/unavailable.
      {const reverse=tractorProgress>1,[rx,ry]=routePoint(reverse ? 2-tractorProgress : tractorProgress),[x,y]=point(rx,ry);drawTractor(ctx,tractorImage,{x,y,scale:s*(.82+ry*.28),phase:tractorProgress,load:activity.wind,reverse,night,moving:!still && rates.tractor>0});}
      // Upload and download are combined for the rain scale, with an intentionally gentle ceiling.
      if(rates.rain){
        const [cloudX,cloudY]=point(.87,.10);
        const mist=ctx.createRadialGradient(cloudX,cloudY,0,cloudX,cloudY,width*.16);
        mist.addColorStop(0,night?'#b9c8d32b':'#eaf0f044');mist.addColorStop(1,'#eaf0f000');
        ellipse(ctx,cloudX,cloudY,width*.16,height*.06,mist);
        for(let i=0;i<rates.rain;i++){const p=motes[i];if(!still)p.y=(p.y+dt*(.25+activity.rain*.18))%1;const [x,y]=point(.76+p.x*.19,.13+p.y*.63);line(ctx,[[x,y],[x-3,y+9]],night?'#c2dfe580':'#527f9d6b',1.3);}
      }
      // Read/write ripples provide a second, smaller indicator beside the wheel.
      for(let i=0;i<Math.round(activity.ripples*15);i++){const p=motes[i+30],[x,y]=point(.74+p.x*.035,.72+p.y*.17),phase=(time*.5+p.phase)%1;ctx.strokeStyle=`rgba(226,244,247,${(1-phase)*.6})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,2+phase*10,1+phase*3,0,0,Math.PI*2);ctx.stroke();}
      // Dusk fireflies, slow at rest: decorative, not the primary GPU indicator.
      if(night)for(let i=0;i<12;i++){const p=motes[i+70],[x,y]=point(.1+p.x*.7,.45+p.y*.3+Math.sin(time+p.phase)*.009);ellipse(ctx,x,y,1.8,1.8,'#ffdd9a9c');}
    }
  };
}

