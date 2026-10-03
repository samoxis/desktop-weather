const TAU=Math.PI*2;
export const TRACK={a:12,b:10};
export function trackPose(t){
  const x=TRACK.a*Math.sin(t),z=TRACK.b*Math.cos(t);
  const dx=TRACK.a*Math.cos(t),dz=-TRACK.b*Math.sin(t);
  const curvature=TRACK.a*TRACK.b/Math.pow(dx*dx+dz*dz,1.5);
  return {x,z,yaw:Math.atan2(dx,dz),curvature,metric:Math.hypot(dx,dz)};
}
export function createDrive(){
  let t=2.15,speed=0,distance=0;
  return {step(dt,load,still){
    dt=Math.max(0,Math.min(.1,dt));
    if(!still){
      if(load<=0)speed=0;
      else speed+=(.32+load*1.05-speed)*(1-Math.exp(-dt*2));
      const travel=speed*dt;t=(t+travel/trackPose(t).metric)%TAU;distance+=travel;
    }
    const pose=trackPose(t);
    return {...pose,t,speed,distance,rearAngle:distance/.59,frontAngle:distance/.39,steering:Math.atan(1.38*pose.curvature)};
  }};
}
export function henGait(distance){
  // During stance the foot moves backwards exactly as far as the body travels.
  // Opposite legs overlap contact, then swing forward while lifted.
  return [0,.5].map(offset=>{
    const phase=(distance/.18+offset)%1;
    if(phase<.6)return {swing:.054-phase*.18,lift:0};
    const u=(phase-.6)/.4;
    return {swing:-.054+.108*u*u*(3-2*u),lift:Math.sin(u*Math.PI)*.055};
  });
}
