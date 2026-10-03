function sprite(ctx,image,frame,cols,rows,x,y,width,height,night,flip=false,opacity=1){
  if(!image?.complete||!image.naturalWidth)return;
  const cw=image.naturalWidth/cols,ch=image.naturalHeight/rows;
  ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.globalAlpha=opacity;
  ctx.filter=night?'brightness(.60) saturate(.72)':'brightness(.85) saturate(.8)';
  const baseline=rows===2?.94:.79;
  ctx.fillStyle='#1c241630';ctx.beginPath();ctx.ellipse(0,1,width*.27,height*.055,0,0,Math.PI*2);ctx.fill();
  ctx.drawImage(image,(frame%cols)*cw,Math.floor(frame/cols)*ch,cw,ch,-width/2,-height*baseline,width,height);ctx.restore();
}
export function drawFarm(ctx,point,s,time,night,hens,atlas,hay){
  for(let i=0;i<4;i++){
    const offset=time+i*4.3,lap=Math.floor(offset/18),cycle=offset%18,walking=cycle<5;
    const progress=walking?cycle:5,distance=lap%2===0?progress:5-progress;
    const step=progress*8,phase=Math.floor(step)%4,blend=step%1;
    const frame=walking?phase:cycle<10?4:5;
    // Feet move only during a short purposeful walk; the bird then rests/pecks.
    const [x,y]=point(.465+i*.018+distance*.0012,.51+(i%2)*.009);
    sprite(ctx,hens,frame,3,2,x,y,19*s,19*s,night,lap%2===1,walking?1-blend:1);
    if(walking)sprite(ctx,hens,(phase+1)%4,3,2,x,y,19*s,19*s,night,lap%2===1,blend);
  }
  for(let i=0;i<4;i++){
    const [x,y]=point(.644+(i%2)*.025,.36+Math.floor(i/2)*.022);
    sprite(ctx,atlas,(Math.floor(time/7+i)%4===0)?1:0,3,1,x,y,32*s,32*s,night);
  }
  for(let i=0;i<hay;i++){
    const col=i%6,row=Math.floor(i/6),[x,y]=point(.506+col*.014,.457-row*.012);
    sprite(ctx,atlas,2,3,1,x,y,23*s,23*s,night);
  }
}
