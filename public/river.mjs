// Hand-mapped visible water channels; gaps keep foam off bridges, banks and rocks.
export const CHANNELS = [
  [[.762,.551],[.753,.576],[.751,.604],[.741,.625]],
  [[.741,.651],[.735,.677],[.727,.711],[.713,.733]],
  [[.713,.744],[.717,.767],[.711,.788],[.692,.815]],
  [[.695,.877],[.685,.898],[.674,.928],[.667,.960],[.644,1.01]],
  [[.928,.550],[.919,.577],[.925,.605],[.911,.630],[.913,.671],[.891,.71]],
  [[.891,.724],[.871,.749],[.842,.765],[.817,.789],[.787,.823],[.756,.839]]
];
function along(path,t){
  const p=t*(path.length-1),i=Math.min(path.length-2,Math.floor(p)),f=p-i;
  const a=path[i],b=path[i+1];return {x:a[0]+(b[0]-a[0])*f,y:a[1]+(b[1]-a[1])*f,dx:(b[0]-a[0])*1672,dy:(b[1]-a[1])*941};
}
export function drawRiver(ctx,point,scale,waterPhase,night,waterImage=null){
  // A shared phase advances downstream foam and wheel paddles together.
  for(let channel=0;channel<CHANNELS.length;channel++){
    const path=CHANNELS[channel];
    if(waterImage?.complete && waterImage.naturalWidth){
      // Drift the existing photographic water texture inside a narrow channel
      // mask, blending two offset layers to hide the wrap. Banks stay untouched.
      const edges=[[],[]], halfWidth=channel===0?5:8;
      for(let sample=0;sample<=24;sample++){
        const p=along(path,sample/24),norm=Math.hypot(p.dx,p.dy)||1;
        for(const side of [-1,1])edges[side<0?0:1].push([p.x+side*(-p.dy/norm)*halfWidth/1672,p.y+side*(p.dx/norm)*halfWidth/941]);
      }
      const polygon=[...edges[0],...edges[1].reverse()];
      ctx.save();ctx.beginPath();polygon.forEach((p,i)=>{const [x,y]=point(...p);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);});ctx.closePath();ctx.clip();
      const minX=Math.max(0,Math.min(...polygon.map(p=>p[0]))*1672-10),minY=Math.max(0,Math.min(...polygon.map(p=>p[1]))*941-12);
      const maxX=Math.min(1672,Math.max(...polygon.map(p=>p[0]))*1672+10),maxY=Math.min(941,Math.max(...polygon.map(p=>p[1]))*941+12);
      const [left,top]=point(minX/1672,minY/941),w=maxX-minX,h=maxY-minY;
      for(let layer=0;layer<2;layer++){
        const phase=((waterPhase*.12+layer*.5+channel*.17)%1+1)%1;
        ctx.globalAlpha=Math.sin(phase*Math.PI)*.28;
        ctx.drawImage(waterImage,minX,minY,w,h,left,top+phase*7*scale,w*scale,h*scale);
      }
      ctx.restore();
    }
    for(let i=0;i<22;i++){
      const t=((i/22+waterPhase*.065+(channel*.173))%1+1)%1;
      const p=along(path,t),[x,y]=point(p.x,p.y),angle=Math.atan2(p.dy,p.dx);
      const fade=Math.sin(t*Math.PI),jitter=Math.sin(i*12.37)*((channel===0?3:6)*scale);
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);
      ctx.globalAlpha=fade*(night?.19:.26);
      ctx.strokeStyle=i%3===0?'#d8e9ed':'#eff2e6';ctx.lineWidth=(.65+(i%3)*.35)*scale;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(-3*scale,jitter);ctx.bezierCurveTo(0,jitter-1.2*scale,3*scale,jitter+scale,7*scale,jitter);ctx.stroke();ctx.restore();
    }
  }
}
export function drawWaterwheel(ctx,image,point,scale,angle,night){
  if(!image?.complete||!image.naturalWidth)return;
  const [x,y]=point(.735,.672);
  ctx.save();ctx.translate(x,y);ctx.transform(.72, .09, 0, 1, 0, 0);ctx.scale(scale,scale);
  ctx.filter=night?'brightness(.60) saturate(.75)':'brightness(.83) saturate(.78)';
  ctx.rotate(-angle);ctx.drawImage(image,-43,-43,86,86);ctx.restore();
  // Water drips from the rising paddles into the same visible channel.
  if(angle>0)for(let i=0;i<5;i++){
    const phase=(angle*.8+i*.21)%1;
    const [sx,sy]=point(.750-i*.001,.696+phase*.024);
    ctx.strokeStyle=night?'#dae7ea50':'#eef7ee80';ctx.lineWidth=scale;
    ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx-scale,sy+2.5*scale);ctx.stroke();
  }
}
