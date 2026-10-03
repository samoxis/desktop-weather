import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../public/vendor/three.module.js';
import {createPhotoDrive,poseAt,ROAD_LENGTH,VEHICLE,vehicleScale,groundAt,imageAt} from '../public/photo-course.mjs';
import {photographicTractor,photographicWheel} from '../public/photo-machinery.mjs';

test('Photo route closes, follows its tangent and steers through continuous turns',()=>{
 const drive=createPhotoDrive();let last=drive.step(0,1,false),wraps=0,turn=0;
 for(let i=0;i<900;i++){
  const next=drive.step(.05,1,false),angle=Math.atan2(Math.sin(next.yaw-last.yaw),Math.cos(next.yaw-last.yaw));
  assert.ok(next.point.distanceTo(last.point)<.11);assert.ok(Math.abs(angle)<.11);turn+=angle;
  if(next.u<last.u)wraps++;
  const distance=next.traveled-last.traveled,scale=(vehicleScale(last.point)+vehicleScale(next.point))*.5;
  assert.ok(Math.abs((next.rearAngle-last.rearAngle)*VEHICLE.rearRadius*scale-distance)<1e-11);
  assert.ok(Math.abs((next.frontAngle-last.frontAngle)*VEHICLE.frontRadius*scale-distance)<1e-11);
  last=next;
 }
 assert.ok(wraps>=1);assert.ok(Math.abs(turn)>Math.PI*2);
 assert.ok(poseAt(0).point.distanceTo(poseAt(ROAD_LENGTH).point)<1e-9);
});
test('Still freezes distance, steering and all tire angles; absent CPU stops immediately',()=>{
 const drive=createPhotoDrive();for(let i=0;i<50;i++)drive.step(.1,1,false);
 const previous=drive.step(0,1,true);
 assert.deepEqual(drive.step(.1,1,true),previous);
 const stopped=drive.step(.1,0,false);assert.equal(stopped.traveled,previous.traveled);assert.equal(stopped.rearAngle,previous.rearAngle);assert.equal(stopped.speed,0);
});
test('Photo coordinates preserve wheel contact under the calibrated camera',()=>{
 for(const [x,y] of [[.14,.49],[.66,.766],[.44,.27]]){const p=groundAt(x,y),s=imageAt(p);assert.ok(Math.abs(s.x-x*1672)<1e-9);assert.ok(Math.abs(s.y-y*941)<1e-9);}
 assert.ok(vehicleScale(groundAt(.3,.35))<vehicleScale(groundAt(.3,.75)));
});
test('Photographic machinery retains independent wheels, steering and a fixed waterwheel axle',()=>{
 const material=new T.MeshStandardMaterial(),m=new Proxy({},{get:()=>material}),tractor=photographicTractor(m);
 assert.equal(tractor.wheels.length,4);assert.equal(tractor.steering.length,2);
 assert.equal(new Set(tractor.wheels.map(w=>w.spin)).size,4);
 assert.equal(tractor.wheels.filter(w=>w.front).length,2);
 const wheel=photographicWheel(m),distances=wheel.rotor.children.map(n=>n.position.length());
 for(const a of [0,.5,2,5]){wheel.rotor.rotation.x=a;wheel.group.updateMatrixWorld(true);wheel.rotor.children.forEach((n,i)=>assert.ok(Math.abs(n.getWorldPosition(new T.Vector3()).length()-distances[i])<1e-9));}
});
