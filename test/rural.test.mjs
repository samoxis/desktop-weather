import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuralRenderer } from '../public/rural.mjs';
import { sceneActivity, demoSnapshot } from '../public/model.mjs';
import { drawTractor } from '../public/tractor.mjs';
import {createTractorMotion,roadLength} from '../public/motion.mjs';
import {wheelProjection} from '../public/mechanics.mjs';

// Exercise the actual render loop with a no-op drawing surface.
function renderer(){
  const gradient={addColorStop(){}};
  const context=new Proxy({}, {get:(_,key)=>key==='createLinearGradient'||key==='createRadialGradient'?()=>gradient:()=>{},set:()=>true});
  return createRuralRenderer(context,(x,y)=>[x*1672,y*941],()=>1);
}
test('Telemetry animates machinery and fills the barn; still mode freezes positions',()=>{
  const world=renderer(), activity=sceneActivity(demoSnapshot('render'));
  world.render({activity,dt:.1,time:1,still:false,night:false,width:1672,height:941});
  const first=world.stats;
  world.render({activity,dt:.1,time:2,still:false,night:true,width:1672,height:941});
  const second=world.stats;
  assert.ok(second.tractorProgress>first.tractorProgress);
  assert.ok(second.millAngle>first.millAngle);
  assert.ok(second.wheelAngle>first.wheelAngle);
  assert.ok(second.hayBales>0);
  world.render({activity,dt:.1,time:0,still:true,night:false,width:1672,height:941});
  assert.deepEqual(world.stats,second);
});
test('Missing telemetry stops machinery and removes sensor-derived bales and rain',()=>{
  const world=renderer(), activity=sceneActivity(null);
  const frame={activity,dt:.1,time:1,still:false,night:false,width:1672,height:941};
  world.render(frame);const before=world.stats;
  world.render({...frame,time:2});
  assert.deepEqual(world.stats,before);
  assert.equal(before.hayBales,0);assert.equal(before.rainDrops,0);
});
test('Tractor waits for a decoded sprite and draws it with the night lighting',()=>{
  let draws=0, appliedFilter;
  const context=new Proxy({}, {get:(_,key)=>key==='createRadialGradient'?()=>({addColorStop(){}}):key==='drawImage'?()=>draws++:()=>{},set:(_,key,value)=>{if(key==='filter')appliedFilter=value;return true;}});
  const frame={x:50,y:50,scale:1,phase:0,load:0,reverse:false,night:true,moving:false};
  assert.equal(drawTractor(context,null,frame),false);
  assert.equal(draws,0);
  assert.equal(drawTractor(context,{complete:true,naturalWidth:1536},frame),true);
  assert.equal(draws,4);assert.match(appliedFilter,/brightness/);
});
test('Tractor accelerates, spins tires by distance and stops before changing direction',()=>{
  const motion=createTractorMotion();
  const start=motion.step(0,1,false),first=motion.step(.1,1,false),second=motion.step(.1,1,false);
  assert.ok(first.speed>0 && second.speed>first.speed);
  assert.ok(first.speed<58);
  assert.ok(Math.abs((second.tireAngle-start.tireAngle)-(second.distance-start.distance)/21)<1e-9);
  let previous=second,turned=false;
  for(let i=0;i<1000;i++){
    const next=motion.step(.1,1,false);
    assert.ok(next.distance>=0 && next.distance<=roadLength);
    if(next.direction!==previous.direction){assert.equal(previous.speed,0);assert.equal(next.speed,0);turned=true;break;}
    previous=next;
  }
  assert.equal(turned,true);
  const stopped=motion.step(.1,0,false),rest=motion.step(.1,0,false);
  assert.equal(stopped.distance,rest.distance);assert.equal(stopped.tireAngle,rest.tireAngle);
});
test('River and wheel share one phase, including when animation is frozen',()=>{
  const world=renderer(),activity=sceneActivity(demoSnapshot('render'));
  world.render({activity,dt:.1,time:1,still:false,night:false,width:1672,height:941});
  const before=world.stats;
  assert.ok(before.waterPhase>0);assert.equal(before.waterPhase,before.wheelAngle);
  world.render({activity,dt:.1,time:100,still:true,night:false,width:1672,height:941});
  assert.equal(world.stats.waterPhase,before.waterPhase);assert.equal(world.stats.tireAngle,before.tireAngle);
});
test('The waterwheel projection keeps its axle and projected radius fixed during rotation',()=>{
  function bounds(angle){
    const ring=Array.from({length:720},(_,i)=>wheelProjection(40*Math.cos(i*Math.PI/360+angle),40*Math.sin(i*Math.PI/360+angle),5));
    return [Math.min(...ring.map(p=>p[0])),Math.max(...ring.map(p=>p[0])),Math.min(...ring.map(p=>p[1])),Math.max(...ring.map(p=>p[1]))];
  }
  const initial=bounds(0);
  for(const angle of [.2,1,2,3,5]){
    bounds(angle).forEach((edge,i)=>assert.ok(Math.abs(edge-initial[i])<.002));
    assert.deepEqual(wheelProjection(0,0,5),[4.25,1]);
  }
});

