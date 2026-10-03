// Photographic sprite with transparent padding; the contact point is on the road.
export function drawTractor(ctx, image, {x,y,scale,phase,load,reverse,night,moving,heading=.2,tireAngle=0}) {
  if (!image?.complete || !image.naturalWidth) return false;
  ctx.save();ctx.translate(x,y);ctx.scale(reverse ? -scale : scale,scale);
  ctx.rotate(Math.max(-.14,Math.min(.14,heading-.2)));
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
  const sway=moving?Math.sin(phase*80)*.35:0;
  ctx.drawImage(image,-66,-84+sway,132,88);
  // Rotate each photographed wheel face in its perspective ellipse. Source
  // coordinates stay within the rims, keeping fenders and tire silhouettes fixed.
  const ratio=132/1536;
  for(const [cx,cy,rx,ry] of [[351,607,90,130],[861,842,63,89],[1254,769,46,64]]){
    ctx.save();ctx.translate(-66+cx*ratio,-84+sway+cy*ratio);ctx.scale(rx*ratio,ry*ratio);
    ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.clip();ctx.rotate(tireAngle*(cy<700?1:1.6));
    ctx.drawImage(image,cx-rx,cy-ry,rx*2,ry*2,-1,-1,2,2);ctx.restore();
  }
  ctx.restore();return true;
}
