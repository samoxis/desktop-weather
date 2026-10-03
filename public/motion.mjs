// Distances use the artwork's pixel coordinates, so wheels follow ground travel.
export const ROAD = [[.325,.633],[.37,.650],[.45,.688],[.53,.713],[.59,.721]];
const metric = p => [p[0]*1672,p[1]*941];
const table=[];
let length=0, previous;
for(let i=0;i<ROAD.length-1;i++)for(let j=0;j<30;j++){
  const t=j/30,t2=t*t,t3=t2*t;
  const a=ROAD[Math.max(0,i-1)],b=ROAD[i],c=ROAD[i+1],d=ROAD[Math.min(ROAD.length-1,i+2)];
  const p=[0,1].map(k=>.5*((2*b[k])+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t2+(-a[k]+3*b[k]-3*c[k]+d[k])*t3));
  if(previous){const A=metric(previous),B=metric(p);length+=Math.hypot(B[0]-A[0],B[1]-A[1]);}
  table.push({distance:length,p});previous=p;
}
const end=ROAD.at(-1),A=metric(previous),B=metric(end);
length+=Math.hypot(B[0]-A[0],B[1]-A[1]);table.push({distance:length,p:end});
export const roadLength=length;
export function roadPosition(distance){
  distance=Math.max(0,Math.min(length,distance));
  let i=1;while(i<table.length-1 && table[i].distance<distance)i++;
  const a=table[i-1],b=table[i],f=(distance-a.distance)/(b.distance-a.distance||1);
  return {point:a.p.map((v,k)=>v+(b.p[k]-v)*f),heading:Math.atan2((b.p[1]-a.p[1])*941,(b.p[0]-a.p[0])*1672)};
}
export function createTractorMotion(){
  let distance=length*.26,speed=0,direction=1,pause=0,tireAngle=0;
  return {
    step(dt,load,still){
      dt=Math.max(0,Math.min(.15,dt));
      if(!still){
        if(load<=0){speed=0;}
        else if(pause>0){pause=Math.max(0,pause-dt);if(pause===0)direction*=-1;}
        else{
          const remaining=direction>0?length-distance:distance;
          const target=Math.min((8+load*32)*(direction>0?1:.48),Math.sqrt(2*35*remaining));
          speed+=(target-speed)*(1-Math.exp(-dt*3));
          const travel=Math.min(remaining,speed*dt);
          distance+=travel*direction;tireAngle+=travel/21*direction;
          if(remaining-travel<.12){distance=direction>0?length:0;speed=0;pause=1.2;}
        }
      }
      return {...roadPosition(distance),distance,speed,direction,tireAngle,pause};
    }
  };
}

