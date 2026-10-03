import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../public/vendor/three.module.js';
import {createDrive,trackPose,henGait} from '../public/world-math.mjs';
import {makeTractor,waterwheel} from '../public/world-models.mjs';
import {weather} from '../public/world-effects.mjs';

test('3D tractor completes a continuous lap, turns with the tangent and rolls without reversal',()=>{
  const drive=createDrive();let previous=drive.step(0,1,false),yawTravel=0,wraps=0;
  for(let i=0;i<750;i++){
    const next=drive.step(.1,1,false);
    assert.ok(Math.hypot(next.x-previous.x,next.z-previous.z)<.15);
    if(next.t<previous.t)wraps++;
    const yawDelta=Math.atan2(Math.sin(next.yaw-previous.yaw),Math.cos(next.yaw-previous.yaw));
    assert.ok(Math.abs(yawDelta)<.03);yawTravel+=yawDelta;
    assert.ok(next.distance>=previous.distance);
    assert.ok(Math.abs(next.rearAngle*.59-next.distance)<1e-10);
    assert.ok(Math.abs(next.frontAngle*.39-next.distance)<1e-10);
    assert.ok(next.steering>0&&next.steering<.3);previous=next;
  }
  assert.ok(wraps>=1 && yawTravel>Math.PI*2);
  const stopped=drive.step(.1,0,false),frozen=drive.step(.1,1,true);
  assert.equal(stopped.distance,frozen.distance);
});
test('Tractor has four independently rotatable 3D wheel hubs and two steering pivots',()=>{
  const material=new T.MeshStandardMaterial(),m=new Proxy({}, {get:()=>material});
  const tractor=makeTractor(m);
  assert.equal(tractor.wheels.length,4);assert.equal(tractor.frontSteer.length,2);
  assert.equal(new Set(tractor.wheels.map(w=>w.spin)).size,4);
  for(const w of tractor.wheels){w.spin.rotation.x=1;assert.equal(w.spin.scale.x,1);assert.ok(w.spin.children.length>40);}
  for(const pivot of tractor.frontSteer)pivot.rotation.y=.15;
});
test('Waterwheel uses a single 3D shaft, so every paddle keeps its radius during rotation',()=>{
  const material=new T.MeshStandardMaterial(),m=new Proxy({}, {get:()=>material}),wheel=waterwheel(m);
  const distances=wheel.rotor.children.map(n=>n.position.length());
  for(const angle of [0,.5,1,2,4]){
    wheel.rotor.rotation.x=angle;wheel.group.updateMatrixWorld(true);
    wheel.rotor.children.forEach((n,i)=>assert.ok(Math.abs(n.getWorldPosition(new T.Vector3()).length()-distances[i])<1e-9));
  }
});
test('Rain creates 3D droplets and ground impact rings, and disables both without traffic',()=>{
  const scene=new T.Scene(),rain=weather(scene,{});
  assert.equal(rain.update(.1,1,1,false),1100);
  assert.ok(scene.children[0].isInstancedMesh && scene.children[1].isInstancedMesh);
  for(let i=0;i<25;i++)rain.update(.1,i*.1,1,false);
  const matrices=scene.children[1].instanceMatrix.array;
  assert.ok(matrices.some((v,i)=>i%16===0 && Math.abs(v)>.01));
  assert.equal(rain.update(.1,3,0,false),0);assert.equal(scene.children[1].count,0);
});
test('Hen gait alternates foot contact rather than translating fixed legs',()=>{
  for(const distance of [0,.015,.04,.08]){
    const [a,b]=henGait(distance);assert.ok(a.lift===0||b.lift===0||Math.min(a.lift,b.lift)<1e-12);
  }
  const before=henGait(.02)[0],after=henGait(.03)[0];
  assert.equal(before.lift,0);assert.equal(after.lift,0);
  assert.ok(Math.abs((.03+after.swing)-(.02+before.swing))<1e-10,'stance foot stays planted while the body advances');
});
