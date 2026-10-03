// Photo-space water. The channel masks exclude banks, buildings and rocks.
export const CHANNELS=[
 [[.961,.438],[.963,.454],[.948,.482],[.955,.498],[.950,.519],[.932,.533],[.922,.562],[.901,.583],[.898,.599],[.889,.603],[.889,.581],[.907,.556],[.911,.529],[.932,.507],[.930,.485],[.944,.463]],
 [[.861,.681],[.869,.684],[.866,.727],[.892,.728],[.881,.746],[.858,.750],[.848,.773],[.829,.785],[.822,.770],[.834,.744],[.854,.730]],
 [[.848,.784],[.868,.789],[.871,.808],[.898,.833],[.886,.853],[.866,.852],[.853,.882],[.834,.908],[.808,.926],[.795,.956],[.701,1],[.560,1],[.626,.975],[.687,.967],[.711,.949],[.752,.945],[.773,.917],[.800,.904],[.812,.877],[.828,.855],[.809,.842],[.801,.819],[.813,.800]]
];
export function polygon(context,points,w=1672,h=941){context.beginPath();for(let i=0;i<points.length;i++){const p=points[i];context[i?'lineTo':'moveTo'](p[0]*w,p[1]*h);}context.closePath();}
export function createWater(day,night){
 const w=1672,h=941,c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');
 const mask=document.createElement('canvas');mask.width=w;mask.height=h;const m=mask.getContext('2d');m.fillStyle='white';
 for(const p of CHANNELS){polygon(m,p);m.fill();}
 let phase=0;
 return {get phase(){return phase;},draw(target,dt,activity,still,isNight){
  if(!still)phase+=dt*(activity.ripples>0?.40+activity.ripples*1.8:0);
  const photo=isNight?night:day;
  ctx.clearRect(0,0,w,h);
  // Small continuous offsets advect real highlights; the original stream remains underneath.
  const offset=(phase*13)%12;
  ctx.globalAlpha=.30;ctx.drawImage(photo,-offset*.30,offset);
  ctx.globalAlpha=.30;ctx.drawImage(photo,-((offset+6)%12)*.30,(offset+6)%12);
  ctx.globalAlpha=1;ctx.globalCompositeOperation='destination-in';ctx.drawImage(mask,0,0);ctx.globalCompositeOperation='source-over';target.drawImage(c,0,0);
  // The waterfall moves more quickly than the deeper downstream pool.
  target.save();polygon(target,CHANNELS[1]);target.clip();
  target.strokeStyle=isNight?'rgba(169,193,209,.18)':'rgba(239,244,231,.28)';target.lineWidth=.8;
  for(let i=0;i<28;i++){const q=((phase*.36+i*.037)%1),x=(.859+Math.sin(i*13.1)*.011)*w,y=(.69+q*.059)*h;target.beginPath();target.moveTo(x,y);target.quadraticCurveTo(x-2,y+5,x-4,y+9);target.stroke();}
  target.restore();
  target.save();polygon(target,CHANNELS[2]);target.clip();target.lineWidth=.7;
  for(let i=0;i<35;i++){const q=(phase*.05+i*.031)%1,x=(.877-q*.24+Math.sin(i*7.2)*.025)*w,y=(.792+q*.208)*h;target.globalAlpha=.12+.16*Math.sin(Math.PI*q);target.strokeStyle=isNight?'#a6bac7':'#f4f0dc';target.beginPath();target.ellipse(x,y,4+i%5,1.0+i%2,0,0,Math.PI*1.3);target.stroke();}target.restore();
 }};
}
