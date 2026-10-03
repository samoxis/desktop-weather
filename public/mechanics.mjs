// A centered wheel is projected from geometry. Lighting and axle stay fixed
// while the spokes and paddles move; no rotating perspective photograph.
export function wheelProjection(x,y,z){return [.72*x+.85*z,y+.09*x+.20*z];}
function face(ctx,points,color,texture){
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=color;ctx.fill();
  if(texture){ctx.save();ctx.clip();ctx.globalAlpha*=.19;ctx.fillStyle=texture;ctx.fill();ctx.restore();}
}
const cache=new WeakMap();
function wood(ctx,image){
  if(!image?.complete||!image.naturalWidth || typeof OffscreenCanvas==='undefined')return null;
  if(!cache.has(ctx)){
    const tile=new OffscreenCanvas(48,48),paint=tile.getContext('2d');
    paint.drawImage(image,image.naturalWidth*.075,image.naturalHeight*.42,image.naturalWidth*.06,image.naturalHeight*.1,0,0,48,48);
    cache.set(ctx,ctx.createPattern(tile,'repeat'));
  }
  return cache.get(ctx);
}
export function drawMechanicalWheel(ctx,image,point,scale,angle,night){
  const [x,y]=point(.735,.672),texture=wood(ctx,image);
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.globalAlpha=night?.78:1;
  const rotate=(px,py,z)=>{const c=Math.cos(angle),s=Math.sin(angle);return wheelProjection(px*c-py*s,px*s+py*c,z);};
  // Back rim, front rim, then paddles: the same axis and radius at all angles.
  for(const z of [-5,5]){
    for(let i=0;i<32;i++){
      const a=i*Math.PI/16,b=(i+1)*Math.PI/16;
      face(ctx,[[35*Math.cos(a),35*Math.sin(a)],[35*Math.cos(b),35*Math.sin(b)],[40*Math.cos(b),40*Math.sin(b)],[40*Math.cos(a),40*Math.sin(a)]].map(([px,py])=>rotate(px,py,z)),z<0?'#3b3024':'#796044',texture);
    }
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6,radial=[Math.cos(a),Math.sin(a)],normal=[-radial[1],radial[0]];
      const quad=[[5,-1.8],[36,-1.8],[36,1.8],[5,1.8]].map(([r,w])=>rotate(radial[0]*r+normal[0]*w,radial[1]*r+normal[1]*w,z));
      face(ctx,quad,z<0?'#4c3b28':'#927653',texture);
    }
  }
  for(let i=0;i<12;i++){
    const a=angle+i*Math.PI/6,c=Math.cos(a),s=Math.sin(a),r=39;
    const shade=Math.round(66+23*(1-s));
    const corners=[[-5,-6],[5,-6],[5,6],[-5,6]].map(([t,z])=>wheelProjection(r*c-t*s,r*s+t*c,z));
    face(ctx,corners,`rgb(${shade},${Math.round(shade*.79)},${Math.round(shade*.55)})`,texture);
  }
  ctx.fillStyle='#483924';ctx.beginPath();ctx.ellipse(4.25,1,5.8,8,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#afa08a';ctx.beginPath();ctx.ellipse(5,1,2.1,3.1,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
export function drawMill(ctx,image,point,scale,angle,night){
  const [x,y]=point(.724,.287),texture=wood(ctx,image);
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.globalAlpha=night?.75:1;ctx.rotate(angle);
  for(let blade=0;blade<4;blade++){
    ctx.save();ctx.rotate(blade*Math.PI/2);
    face(ctx,[[5,-2],[66,-2],[66,3],[5,3]],'#785c3f',texture);
    for(let plank=0;plank<8;plank++){
      const px=22+plank*5.4;
      face(ctx,[[px,-16],[px+4.2,-16],[px+4.2,-3],[px,-3]],plank%2?'#a78d65':'#b39a72',texture);
    }
    ctx.strokeStyle='#5c4633';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(21,-15);ctx.lineTo(65,-4);ctx.stroke();ctx.restore();
  }
  ctx.fillStyle='#453328';ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.restore();
}
