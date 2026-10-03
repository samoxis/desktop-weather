import * as T from './vendor/three.module.js';
export const ART={width:1672,height:941,pixelsPerUnit:40,elevation:35*Math.PI/180};
export function groundAt(x,y){return new T.Vector3((x*ART.width-ART.width/2)/ART.pixelsPerUnit,0,(y*ART.height-ART.height/2)/(ART.pixelsPerUnit*Math.sin(ART.elevation)));}
export function imageAt(p){return {x:ART.width/2+p.x*ART.pixelsPerUnit,y:ART.height/2+(p.z*Math.sin(ART.elevation)-p.y*Math.cos(ART.elevation))*ART.pixelsPerUnit};}
export const ROAD=new T.CatmullRomCurve3([[.66,.766],[.54,.754],[.40,.714],[.272,.658],[.163,.562],[.147,.486],[.198,.431],[.25,.408],[.33,.33],[.44,.27],[.62,.32],[.75,.41],[.745,.54],[.735,.66],[.73,.72]].map(p=>groundAt(...p)),true,'centripetal');
ROAD.arcLengthDivisions=1600;
export const ROAD_LENGTH=ROAD.getLength();
export const VEHICLE={scale:1.10,rearRadius:.73,frontRadius:.46,wheelbase:2.04,track:1.60};
export function vehicleScale(point){return VEHICLE.scale*(.50+Math.max(.25,Math.min(.78,imageAt(point).y/ART.height))*.66);}
export function poseAt(distance){
  const u=((distance/ROAD_LENGTH)%1+1)%1,p=ROAD.getPointAt(u),t=ROAD.getTangentAt(u);
  const ahead=ROAD.getTangentAt((u+.001)%1),behind=ROAD.getTangentAt((u-.001+1)%1);
  const a=Math.atan2(ahead.x,ahead.z),b=Math.atan2(behind.x,behind.z);
  const curvature=Math.atan2(Math.sin(a-b),Math.cos(a-b))/(ROAD_LENGTH*.002);
  return {point:p,yaw:Math.atan2(t.x,t.z),curvature,u};
}
export function createPhotoDrive(){
  let traveled=0,speed=0,rearAngle=0,frontAngle=0;const start=ROAD_LENGTH*.17;
  return {step(dt,load,still){
    const delta=Math.max(0,Math.min(.10,dt));
    const current=poseAt(start+traveled);
    if(!still){
      const target=load>0?(.28+load*1.80)/(1+Math.abs(current.curvature)*1.2):0;
      speed=load<=0?0:speed+(target-speed)*(1-Math.exp(-delta*2.2));
      const distance=speed*delta,scale=(vehicleScale(current.point)+vehicleScale(poseAt(start+traveled+distance).point))*.5;
      traveled+=distance;rearAngle+=distance/(VEHICLE.rearRadius*scale);frontAngle+=distance/(VEHICLE.frontRadius*scale);
    }
    const pose=poseAt(start+traveled),steering=Math.atan(VEHICLE.wheelbase*vehicleScale(pose.point)*pose.curvature);
    return {...pose,traveled,speed,steering,scale:vehicleScale(pose.point),rearAngle,frontAngle};
  }};
}
