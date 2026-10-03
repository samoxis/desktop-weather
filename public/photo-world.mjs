import * as T from './vendor/three.module.js';
import {HDRLoader} from './vendor/HDRLoader.mjs';
import {mergeGeometries} from './geometry-utils.mjs';
import {ART,groundAt,imageAt,createPhotoDrive} from './photo-course.mjs';
import {photographicTractor,photographicWheel,photographicSails} from './photo-machinery.mjs';
import {createWater,polygon} from './photo-water.mjs';
import {createLife} from './photo-life.mjs';
import {createRain} from './photo-rain.mjs';

async function load(name){const i=new Image();i.src=new URL('./assets/'+name,import.meta.url).href;await i.decode();return i;}
function batch(group,skip=new Set()){
 group.updateMatrixWorld(true);const inv=new T.Matrix4().copy(group.matrixWorld).invert(),maps=new Map(),remove=[];
 group.traverse(n=>{if(!n.isMesh)return;let p=n;while(p&&p!==group){if(skip.has(p))return;p=p.parent;}const key=n.material;if(!maps.has(key))maps.set(key,[]);let g=n.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inv,n.matrixWorld));if(g.index)g=g.toNonIndexed();maps.get(key).push(g);remove.push(n);});
 // Keep UVs for textured surfaces. Standard primitive geometries all supply them;
 // custom fenders get a stable planar mapping before merging.
 for(const gs of maps.values())for(const g of gs){if(g.attributes.uv)continue;const p=g.attributes.position,uv=[];for(let i=0;i<p.count;i++)uv.push(p.getX(i),p.getY(i));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));}
 for(const n of remove)n.removeFromParent();
 for(const [material,gs] of maps){const geo=mergeGeometries(gs,false);if(!geo)throw new Error('Machinery geometry could not merge');const n=new T.Mesh(geo,material);n.castShadow=n.receiveShadow=true;group.add(n);for(const g of gs)g.dispose();}
}
function materials(atlas){
 function tile(i){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.drawImage(atlas,i%3*atlas.width/3,Math.floor(i/3)*atlas.height/2,atlas.width/3,atlas.height/2,0,0,512,512);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t;}
 const paint=tile(0),rubber=tile(1),iron=tile(2),wood=tile(3),steel=tile(4);
 const make=(color,map,roughness=.8,metalness=0,bumpScale=.015)=>new T.MeshStandardMaterial({color,map,roughness,metalness,bumpMap:map,bumpScale});
 const m={paint:make('#ddddcc',paint,.52,.24,.006),rubber:make('#9b9a8c',rubber,.94,0,.022),iron:make('#c0b8a7',iron,.68,.40),wood:make('#c0a889',wood,.9,0,.035),steel:make('#a8a394',steel,.5,.68),black:make('#242622',null,.9),lamp:make('#b9b299',null,.18,.38),glass:new T.MeshPhysicalMaterial({color:'#aeb8b1',roughness:.08,metalness:.1,transparent:true,opacity:.19,depthWrite:false,side:T.DoubleSide}),seat:make('#27291f',null),cloth:make('#4b5948',null),skin:make('#a18c74',null),tailLamp:make('#5c271c',null,.4)};
 m.fender=m.paint.clone();m.fender.side=T.DoubleSide;m.rim=m.paint.clone();m.rim.color.set('#d2baa7');return m;
}
// This foreground matte follows the inhabited terrace. It masks the far side of
// the road, so the tractor passes behind houses, fences and trees instead of on them.
const TERRACE=[[.223,.546],[.215,.493],[.226,.440],[.245,.428],[.228,.380],[.258,.339],[.258,.307],[.30,.284],[.325,.210],[.366,.179],[.397,.164],[.417,.168],[.427,.198],[.46,.178],[.482,.202],[.505,.220],[.513,.245],[.551,.249],[.573,.235],[.592,.224],[.612,.209],[.631,.23],[.647,.230],[.67,.244],[.708,.307],[.749,.288],[.777,.267],[.789,.264],[.796,.248],[.809,.264],[.834,.287],[.828,.402],[.874,.470],[.865,.54],[.82,.589],[.762,.64],[.716,.701],[.653,.725],[.57,.709],[.48,.675],[.38,.632],[.295,.584]];
const FRONT_FENCE=[[.153,.649],[.159,.656],[.297,.747],[.422,.818],[.555,.858],[.665,.901],[.665,.849],[.546,.803],[.428,.763],[.292,.700]];
const MILL=[[.718,.542],[.75,.533],[.79,.522],[.835,.515],[.867,.585],[.855,.683],[.820,.730],[.782,.740],[.750,.697]];
const WEST_TREES=[[.179,.327],[.197,.307],[.241,.268],[.291,.241],[.326,.267],[.333,.351],[.321,.407],[.306,.447],[.274,.446],[.237,.447],[.205,.434],[.189,.410],[.179,.383]];
export async function createPhotoWorld(canvas){
 const [day,night,atlas,life]=await Promise.all([load('romanian-live-plate.webp'),load('romanian-live-night.webp'),load('machinery-materials.webp'),createLife()]);
 const c=canvas.getContext('2d',{alpha:false});if(!c)throw new Error('Canvas 2D unavailable');
 const surface=document.createElement('canvas'),renderer=new T.WebGLRenderer({canvas:surface,alpha:true,antialias:true,powerPreference:'low-power',premultipliedAlpha:true});
 renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.38;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
 renderer.info.autoReset=false;
 const scene=new T.Scene(),environment=await new HDRLoader().loadAsync(new URL('./assets/rural-landscape-1k.hdr',import.meta.url).href);environment.mapping=T.EquirectangularReflectionMapping;scene.environment=environment;scene.environmentIntensity=.52;
 const camera=new T.OrthographicCamera(-ART.width/80,ART.width/80,ART.height/80,-ART.height/80,.1,200);camera.position.set(0,Math.sin(ART.elevation)*65,Math.cos(ART.elevation)*65);camera.lookAt(0,0,0);
 const sun=new T.DirectionalLight('#ffefcd',2.2);sun.position.set(-30,40,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-24,right:24,top:28,bottom:-28,near:1,far:130});sun.shadow.normalBias=.025;sun.shadow.bias=-.0002;sun.shadow.radius=3;scene.add(sun,sun.target);
 const ambient=new T.HemisphereLight('#dde6e9','#6e6947',.68);scene.add(ambient);
 const floor=new T.Mesh(new T.PlaneGeometry(70,80),new T.ShadowMaterial({color:'#28271c',opacity:.27}));floor.rotation.x=-Math.PI/2;floor.position.y=-.006;floor.receiveShadow=true;scene.add(floor);
 const m=materials(atlas),tractor=photographicTractor(m),wheel=photographicWheel(m),sails=photographicSails(m);
 for(const w of tractor.wheels)batch(w.spin);batch(tractor.group,new Set(tractor.wheels.map(w=>w.spin)));batch(wheel.rotor);batch(sails);
 scene.add(tractor.group,wheel.group,sails);
 // Position by the photographed shaft centres, not by an approximate ground centre.
 function anchor(group,x,y,height){group.position.copy(groundAt(x,y+height*Math.cos(ART.elevation)*40/ART.height));group.position.y=height;}
 anchor(wheel.group,.854,.676,1.76);wheel.group.rotation.y=-.48;
 anchor(sails,.797,.327,3.8);sails.rotation.y=-.22;
 const drive=createPhotoDrive(),water=createWater(day,night),rain=createRain();
 const artwork=document.createElement('canvas');artwork.width=ART.width;artwork.height=ART.height;const a=artwork.getContext('2d');
 const backdrop=document.createElement('canvas'),b=backdrop.getContext('2d'),nightBackdrop=document.createElement('canvas'),nb=nightBackdrop.getContext('2d');
 let width=1,height=1,ratio=1,frames=0,lastNight=null,lastDusk=null,dirty=true,waterwheel=0,mill=0,nightBlend=0,pose=drive.step(0,0,true),bales=0,drops=0;
 function prepareBackground(){const cover=Math.max(backdrop.width/ART.width,backdrop.height/ART.height);for(const [ctx,photo] of [[b,day],[nb,night]]){ctx.clearRect(0,0,backdrop.width,backdrop.height);ctx.filter='blur(18px)';ctx.drawImage(photo,(backdrop.width-ART.width*cover)/2,(backdrop.height-ART.height*cover)/2,ART.width*cover,ART.height*cover);ctx.filter='none';}}
 function resize(w,h,quality){width=w;height=h;ratio=Math.min(devicePixelRatio||1,quality==='eco'?1:1.5);canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);backdrop.width=nightBackdrop.width=canvas.width;backdrop.height=nightBackdrop.height=canvas.height;renderer.setSize(quality==='eco'?1003:ART.width,quality==='eco'?565:ART.height,false);prepareBackground();dirty=true;}
 function matte(photo,points){a.save();polygon(a,points);a.clip();a.drawImage(photo,0,0,ART.width,ART.height);if(nightBlend>0&&nightBlend<1){a.globalAlpha=nightBlend;a.drawImage(night,0,0,ART.width,ART.height);}a.restore();}
 return {resize,get stats(){return {engine:'photographic-live',frames,rendered:frames>0,tractorProgress:pose.u,tractorTravel:pose.traveled,tractorSpeed:pose.speed,tractorYaw:pose.yaw,steering:pose.steering,rearWheelAngle:pose.rearAngle,frontWheelAngle:pose.frontAngle,tractorPosition:imageAt(pose.point),waterwheelAngle:waterwheel,waterPhase:water.phase,millAngle:mill,animalTime:life.time,hayBales:bales,rainDrops:drops,drawCalls:renderer.info.render.calls};},render({activity,dt,still,night:isNight,dusk,quality}){
  if(still&&!dirty&&lastNight===isNight&&lastDusk===dusk&&bales===Math.round(activity.glow*15)&&drops===Math.round(activity.rain*260))return;
  pose=drive.step(dt,activity.wind,still);tractor.group.position.copy(pose.point);tractor.group.rotation.y=pose.yaw;tractor.group.scale.setScalar(pose.scale);
  for(const w of tractor.wheels)w.spin.rotation.x=w.front?pose.frontAngle:pose.rearAngle;
  for(const pivot of tractor.steering)pivot.rotation.y=pose.steering;
  if(!still){waterwheel-=dt*(activity.ripples>0?.40+activity.ripples*1.8:0)/wheel.radius;mill-=dt*activity.fireflies*1.35;}
  wheel.rotor.rotation.x=waterwheel;sails.rotation.z=mill;
  const target=isNight?1:0;nightBlend=still?target:nightBlend+(target-nightBlend)*(1-Math.exp(-dt*2.2));if(Math.abs(nightBlend-target)<.001)nightBlend=target;
  scene.environmentIntensity=.85*(1-nightBlend)+.24*nightBlend;sun.intensity=3.0*(1-nightBlend)+.60*nightBlend;sun.color.set(isNight?'#b5c4dc':dusk?'#ffd3a0':'#ffefcd');ambient.intensity=1.1*(1-nightBlend)+.38*nightBlend;
  renderer.info.reset();wheel.group.visible=sails.visible=false;tractor.group.visible=true;renderer.render(scene,camera);
  a.clearRect(0,0,ART.width,ART.height);a.drawImage(day,0,0,ART.width,ART.height);if(nightBlend>0){a.globalAlpha=nightBlend;a.drawImage(night,0,0,ART.width,ART.height);a.globalAlpha=1;}
  water.draw(a,dt,activity,still,nightBlend>.5);
  // A short soft contact shadow anchors the wheels even at narrow road bends.
  const contact=imageAt(pose.point);a.save();a.translate(contact.x,contact.y);a.rotate(-.18);a.filter='blur(2px)';a.fillStyle='rgba(35,33,23,.16)';a.beginPath();a.ellipse(2,0,48*pose.scale,12*pose.scale,0,0,Math.PI*2);a.fill();a.restore();
  a.drawImage(surface,0,0,ART.width,ART.height);
  // Machinery on the far circuit is occluded by the photographic foreground.
  const foot=imageAt(pose.point),footY=foot.y/ART.height;
  if(footY<.725)matte(nightBlend===1?night:day,TERRACE);
  if(footY<.475)matte(nightBlend===1?night:day,WEST_TREES);
  if(footY<.65)matte(nightBlend===1?night:day,MILL);
  matte(nightBlend===1?night:day,FRONT_FENCE);
  tractor.group.visible=false;wheel.group.visible=sails.visible=true;renderer.render(scene,camera);a.drawImage(surface,0,0,ART.width,ART.height);
  bales=life.draw(a,dt,activity,still,nightBlend>.5);
  drops=rain.draw(a,dt,activity,still,nightBlend>.5);
  if(dusk&&!isNight){a.fillStyle='rgba(157,88,30,.05)';a.fillRect(0,0,ART.width,ART.height);}
  c.setTransform(1,0,0,1,0,0);c.drawImage(backdrop,0,0);if(nightBlend>0){c.globalAlpha=nightBlend;c.drawImage(nightBackdrop,0,0);c.globalAlpha=1;}const scale=Math.min(canvas.width/ART.width,canvas.height/ART.height);c.drawImage(artwork,(canvas.width-ART.width*scale)/2,(canvas.height-ART.height*scale)/2,ART.width*scale,ART.height*scale);
  lastNight=isNight;lastDusk=dusk;dirty=false;frames++;
 }};
}
