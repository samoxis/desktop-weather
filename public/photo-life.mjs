export async function createLife(){
 const image=new Image();image.src=new URL('./assets/village-life.webp',import.meta.url).href;await image.decode();
 const tiles=[];
 for(let i=0;i<12;i++){
  const cell=document.createElement('canvas');cell.width=cell.height=362;const c=cell.getContext('2d',{willReadFrequently:true});c.drawImage(image,i%4*image.width/4,Math.floor(i/4)*image.height/3,image.width/4,image.height/3,0,0,362,362);
  // Remove transparent-edge colour bleed at runtime; the source atlas stays intact.
  const pixels=c.getImageData(0,0,362,362),p=pixels.data;let l=362,t=362,r=0,b=0;
  for(let y=0;y<362;y++)for(let x=0;x<362;x++){const k=(y*362+x)*4;if(p[k+3]<175){p[k+3]=0;continue;}if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;if(y>b)b=y;}
  c.putImageData(pixels,0,0);tiles.push({cell,l,t,w:r-l+1,h:b-t+1});
 }
 let time=0;
 function sprite(ctx,i,x,y,w,flip=false,night=false,shadow=true){
  const t=tiles[i],h=w*t.h/t.w;
  if(shadow){ctx.save();ctx.globalAlpha=.17;ctx.fillStyle='#292b1c';ctx.beginPath();ctx.ellipse(x,y-1,w*.38,w*.055,-.18,0,Math.PI*2);ctx.fill();ctx.restore();}
  ctx.save();if(night)ctx.filter='brightness(.48) saturate(.6)';ctx.translate(x,y);ctx.scale(flip?-1:1,1);ctx.drawImage(t.cell,t.l,t.t,t.w,t.h,-w/2,-h,w,h);ctx.restore();
 }
 return {get time(){return time;},draw(ctx,dt,a,still,night){
  if(!still)time+=dt*(.4+a.wind*.6);
  // Feed storage is filled from back to front; RAM is represented by actual bales.
  const bales=Math.round(a.glow*15);
  for(let i=0;i<bales;i++){const col=i%5,row=Math.floor(i/5);sprite(ctx,11,875+col*24,447-row*14,31,false,night,false);}
  for(let i=0;i<4;i++){
   const p=time*.10+i*1.83,moving=Math.sin(p)>-.15;
   const x=780+i*39+Math.sin(p)*17,y=479+i%2*14+Math.cos(p)*3;
   const index=moving?Math.floor(time*6+i)%4:Math.sin(time*.65+i)>0?4:5;
   sprite(ctx,index,x,y,17+i%2*2,Math.cos(p)<0,night);
  }
  for(let i=0;i<3;i++)sprite(ctx,Math.sin(time*.18+i)>0?6:7,1243+i*36,439+(i%2)*12,34,false,night);
  // Birds follow arcs in the distant sky; photographic wing poses alternate with glides.
  if(!night&&a.fireflies>.04)for(let i=0;i<3;i++){
   const u=(time*(.022+a.fireflies*.015)+i*.30)%1,x=130+u*1290,y=180+Math.sin(u*Math.PI*2+i)*24+i*12;
   const frame=Math.sin(time*.75+i)>.3?10:8+Math.floor(time*9+i)%2;
   sprite(ctx,frame,x,y,12+i*2,false,false,false);
  }
  if(night)for(let i=0;i<Math.round(a.fireflies*40);i++){
   const x=440+((i*191)%710)+Math.sin(time*.47+i)*7,y=445+((i*67)%90)+Math.cos(time*.32+i)*5;
   const glow=Math.max(0,Math.sin(time*1.2+i*2.7));ctx.fillStyle=`rgba(222,222,117,${glow*.6})`;ctx.beginPath();ctx.arc(x,y,1.4,0,Math.PI*2);ctx.fill();
  }
  return bales;
 }};
}
