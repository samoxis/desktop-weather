import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuralRenderer } from '../public/rural.mjs';
import { sceneActivity, demoSnapshot } from '../public/model.mjs';

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
