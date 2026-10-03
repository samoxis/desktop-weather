// Tiny droplets in depth, with acceleration, impacts and expanding wet rings.
const W=1672,H=941;
const rnd=n=>{const x=Math.sin(n*91.37)*43758.5453;return x-Math.floor(x);};
export function createRain(){
 const drops=Array.from({length:260},(_,i)=>({x:rnd(i+1)*W,y:rnd(i+361)*H,z:.2+rnd(i+671)*.8,v:0,hit:H*(.49+rnd(i+711)*.51)})),impacts=[];
 let wet=0;
 return {get count(){return drops.length;},draw(ctx,dt,a,still,night){
  const strength=a.rain;if(!still)wet+=(strength-wet)*(1-Math.exp(-dt*.18));
  if(strength<.004&&impacts.length===0)return 0;
  const count=Math.round(strength*drops.length);
  ctx.save();ctx.fillStyle=night?`rgba(30,43,56,${strength*.10})`:`rgba(77,92,100,${strength*.18})`;ctx.fillRect(0,0,W,H);
  // Wet ground picks up the sky. Elongated reflections stay on the actual dirt road.
  if(wet>.02){ctx.strokeStyle=`rgba(207,215,215,${wet*.16})`;ctx.lineWidth=1.4;
   for(let i=0;i<23;i++){const x=345+i*34,y=554+(x-345)*.206+Math.sin(i*9)*5;ctx.beginPath();ctx.ellipse(x,y,7+i%9,1.2, .18,0,Math.PI*2);ctx.stroke();}}
  for(let i=0;i<count;i++){
   const d=drops[i];if(!still){d.v=Math.min(700,d.v+dt*1900);d.y+=dt*d.v*(.4+d.z*.7);d.x+=dt*(14+a.wind*24)*d.z;
    if(d.y>=d.hit){impacts.push({x:d.x,y:d.hit,z:d.z,age:0,seed:i});d.x=rnd(i+impacts.length*17)*W;d.y=-20;d.v=360;}}
   const radius=.35+d.z*.55;ctx.fillStyle=night?'rgba(201,217,231,.22)':'rgba(236,246,249,.32)';
   ctx.beginPath();ctx.ellipse(d.x,d.y,radius,radius*(1.5+d.v/300),-.07,0,Math.PI*2);ctx.fill();
  }
  for(let i=impacts.length-1;i>=0;i--){const p=impacts[i];if(!still)p.age+=dt;if(p.age>.48){impacts.splice(i,1);continue;}
   const opacity=(1-p.age/.48)*.20*p.z;ctx.strokeStyle=`rgba(216,225,226,${opacity})`;ctx.lineWidth=.6;ctx.beginPath();ctx.ellipse(p.x,p.y,(1+p.age*13)*p.z,(.3+p.age*3)*p.z,0,0,Math.PI*2);ctx.stroke();
   if(p.age<.14)for(let j=0;j<4;j++){const f=j/4*Math.PI*2;ctx.fillStyle=`rgba(238,244,242,${opacity})`;ctx.beginPath();ctx.arc(p.x+Math.cos(f)*p.age*26*p.z,p.y-Math.sin(Math.PI*p.age/.18)*3*p.z,.5,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();return count;
 }};
}
