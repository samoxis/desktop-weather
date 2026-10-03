// Photographic sprite with transparent padding; the contact point is on the road.
export function drawTractor(ctx, image, {x,y,scale,phase,load,reverse,night,moving,heading=.2,tireAngle=0}) {
  if (!image?.complete || !image.naturalWidth) return false;
  ctx.save();ctx.translate(x,y);ctx.scale(reverse ? -scale : scale,scale);
  // Keep the cab upright: rotating the entire photograph made tire contact slide.
  const contact=ctx.createRadialGradient(0,-4,2,0,-4,47);
  contact.addColorStop(0,night?'#070d17a0':'#2d241461');contact.addColorStop(1,'#2d241400');
  ctx.fillStyle=contact;ctx.beginPath();ctx.ellipse(0,-4,47,12,.12,0,Math.PI*2);ctx.fill();
  // Dust follows actual travel, rather than the wall clock, and vanishes at rest.
  if(moving && load>0)for(let i=0;i<Math.round(load*7);i++){
    const dust=ctx.createRadialGradient(-38-i*6,2,0,-38-i*6,2,8+i);
    dust.addColorStop(0,`rgba(173,148,107,${.10*(1-i/8)})`);dust.addColorStop(1,'#ad946b00');
    ctx.fillStyle=dust;ctx.beginPath();ctx.ellipse(-38-i*6,2,8+i,4+i*.3,0,0,Math.PI*2);ctx.fill();
  }
  ctx.filter=night?'brightness(.58) saturate(.72)':'brightness(.94) saturate(.86)';
  const sway=moving?Math.sin(phase*9)*.16:0;
  ctx.drawImage(image,-66,-84+sway,132,88);
  // Rotate each photographed wheel face in its perspective ellipse. Source
  // coordinates stay within the rims, keeping fenders and tire silhouettes fixed.
  const ratio=132/1536;
  for(const [cx,cy,rx,ry] of [[351,607,90,130],[861,842,63,89],[1254,769,46,64]]){
    ctx.save();ctx.translate(-66+cx*ratio,-84+sway+cy*ratio);ctx.scale(rx*ratio,ry*ratio);
    ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.clip();ctx.rotate(tireAngle*(cy<700?1:1.6));
    ctx.drawImage(image,cx-rx,cy-ry,rx*2,ry*2,-1,-1,2,2);ctx.restore();
  }
  // Project tread grooves onto the rubber sidewall; unlike rotating a cutout,
  // this keeps the silhouette, tire contact and illumination stationary.
  for(const [cx,cy,rx,ry,multiplier] of [[351,607,139,196,1],[861,842,95,131,1.6]]){
    ctx.save();ctx.translate(-66+cx*ratio,-84+sway+cy*ratio);
    ctx.strokeStyle='#16171460';ctx.lineWidth=1.5*ratio*10;ctx.lineCap='round';
    for(let lug=0;lug<18;lug++){
      const a=lug*Math.PI/9+tireAngle*multiplier;
      // The rear fender occludes the uppermost tread.
      if(cy<700 && Math.sin(a)<-.83)continue;
      ctx.beginPath();ctx.moveTo(Math.cos(a)*rx*ratio,Math.sin(a)*ry*ratio);
      ctx.lineTo(Math.cos(a+.035)*(rx-14)*ratio,Math.sin(a+.035)*(ry-19)*ratio);ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();return true;
}

