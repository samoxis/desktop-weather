import * as T from './vendor/three.module.js';
import {mergeGeometries} from './geometry-utils.mjs';
import {box,mesh,beam,makeTractor,house,barn,waterwheel,windmill,hen,bird} from './world-models.mjs';
import {stream,ribbon,water,weather} from './world-effects.mjs';
import {createDrive,henGait,trackPose} from './world-math.mjs';

function mergeStatic(group,skip=new Set()){
  group.updateMatrixWorld(true);const inv=new T.Matrix4().copy(group.matrixWorld).invert(),batches=new Map(),remove=[];
  group.traverse(node=>{if(node.isMesh&&!node.isInstancedMesh){let p=node;while(p&&p!==group){if(skip.has(p))return;p=p.parent;}const key=node.material;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(node.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inv,node.matrixWorld)));remove.push(node);}});
  for(const n of remove)n.removeFromParent();
  for(const [material,geometries] of batches){const geo=mergeGeometries(geometries.map(g=>g.index?g.toNonIndexed():g),false);if(geo){const n=mesh(group,geo,material);}}
}
async function materials(){
  const image=new Image();image.src=new URL('./assets/terrain-materials.webp',import.meta.url).href;await image.decode();
  function tile(i,repeat=1){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.drawImage(image,(i%3)*image.width/3,Math.floor(i/3)*image.height/2,image.width/3,image.height/2,0,0,512,512);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=4;return t;}
  const make=(color,map=null,roughness=.82,metalness=0)=>new T.MeshStandardMaterial({color,map,roughness,metalness});
  const m={grass:make('#829467',tile(0,18)),road:make('#d8c29a',tile(1,6)),stone:make('#acaaa1',tile(2,4)),wood:make('#a79a81',tile(3,2)),roof:make('#b6a18c',tile(4,2)),plaster:make('#ede9da',tile(5,2)),dark:make('#252622',null,.63),metal:make('#8b8880',null,.43,.62),rubber:make('#242624',null,.98),red:make('#9c3527',null,.45,.24),seat:make('#2e2b26'),cloth:make('#4b6252'),skin:make('#b99879'),lamp:make('#ddd5bc',null,.18,.2),feather:make('#7c5730'),featherDark:make('#362f25'),comb:make('#963d2d'),beak:make('#b09043'),eye:make('#121914'),bird:make('#343b3b'),hay:make('#a18b50',tile(0,1)),window:new T.MeshStandardMaterial({color:'#536877',roughness:.26,metalness:.25,emissive:'#f1aa50',emissiveIntensity:0}),glass:new T.MeshPhysicalMaterial({color:'#9caeaf',transparent:true,opacity:.25,roughness:.13,metalness:.12,depthWrite:false,side:T.DoubleSide})};
  m.road.map.repeat.set(1,40);m.stone.map.repeat.set(14,2);
  for(const [key,depth] of [['grass',.035],['road',.015],['stone',.065],['wood',.032],['roof',.045],['plaster',.014]]){m[key].bumpMap=m[key].map;m[key].bumpScale=depth;}
  m.road.color.set('#b9ae9a');m.stone.color.set('#eee9e0');m.wood.color.set('#d2c5b4');
  const grass=tile(0,60);m.surround=make('#b4b996',grass);m.surround.bumpMap=grass;m.surround.bumpScale=.025;return m;
}
function tree(parent,m,x,z,h,seed){
  const g=new T.Group();g.position.set(x,0,z);parent.add(g);
  mesh(g,new T.CylinderGeometry(.11,.20,h*.65,7),m.wood,0,h*.32,0);
  for(let i=0;i<4;i++){const a=i*1.83+seed;beam(g,[0,h*.35,0],[Math.sin(a)*h*.20,h*.75,Math.cos(a)*h*.20],.085,m.wood);}
  // Finely textured, alpha-cut leaves rather than solid spherical canopies.
  return {x,z,h,seed};
}
function foliage(parent,trees){
  const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
  for(let i=0;i<650;i++){const x=((i*47)%127),y=((i*73)%127);ctx.fillStyle=['#526c35','#657b41','#83945b','#3e582d'][i%4];ctx.beginPath();ctx.ellipse(x,y,5.5,2.5,i*.8,0,Math.PI*2);ctx.fill();}
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
  const leaves=new T.InstancedMesh(new T.PlaneGeometry(1,1),new T.MeshStandardMaterial({map:texture,transparent:false,alphaTest:.40,side:T.DoubleSide,roughness:1}),trees.length*110),o=new T.Object3D();
  let n=0;for(const tree of trees)for(let i=0;i<110;i++){
    const a=i*2.399+tree.seed,v=(i+.5)/110,r=Math.sqrt(1-Math.pow(v*2-1,2))*tree.h*.31;
    o.position.set(tree.x+Math.cos(a)*r,tree.h*.7+(v-.5)*tree.h*.5,tree.z+Math.sin(a)*r);
    o.rotation.set(i*.71,i*1.6,i*.3);o.scale.setScalar(tree.h*.32);o.updateMatrix();leaves.setMatrixAt(n++,o.matrix);
  }leaves.castShadow=true;leaves.receiveShadow=true;parent.add(leaves);
}
function sheep(parent,m,x,z){
  const g=new T.Group();g.position.set(x,0,z);parent.add(g);const wool=new T.MeshStandardMaterial({color:'#cbc5b3',roughness:1});
  const body=mesh(g,new T.SphereGeometry(1,18,12),wool,0,.50,0);body.scale.set(.27,.29,.50);
  for(let i=0;i<48;i++){const a=i*2.399,v=i/48,p=mesh(g,new T.SphereGeometry(.075,6,4),wool,Math.cos(a)*.245, .5+Math.sin(a)*.23,(v-.5)*.85);}
  for(const lx of [-.16,.16])for(const lz of [-.31,.31])mesh(g,new T.CylinderGeometry(.035,.028,.35,8),m.dark,lx,.175,lz);
  const head=new T.Group();g.add(head);head.position.set(0,.51,.46);const face=mesh(head,new T.SphereGeometry(1,12,8),m.dark,0,0,.06);face.scale.set(.09,.10,.17);
  for(const side of [-1,1]){const ear=mesh(head,new T.SphereGeometry(1,8,6),wool,side*.12,.04,0);ear.scale.set(.08,.025,.03);}
  mergeStatic(g);return {group:g};
}
export async function createWorldRenderer(canvas){
  const m=await materials();
  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.10;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
  const scene=new T.Scene();scene.background=new T.Color('#a8bcc3');scene.fog=new T.FogExp2('#b2bec0',.008);
  const camera=new T.PerspectiveCamera(39,1,.1,240);camera.position.set(24,21,28);camera.lookAt(0,1.1,0);
  const ambient=new T.HemisphereLight('#c8d9e4','#7b7258',2.0);scene.add(ambient);
  const sun=new T.DirectionalLight('#fff0cf',3.5);sun.position.set(-19,32,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-20;sun.shadow.camera.right=20;sun.shadow.camera.top=20;sun.shadow.camera.bottom=-20;sun.shadow.camera.near=1;sun.shadow.camera.far=90;sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;sun.shadow.radius=3;scene.add(sun);scene.add(sun.target);
  const staticScene=new T.Group();scene.add(staticScene);
  const skyUniforms={night:{value:0},rain:{value:0},time:{value:0}};
  const skyMat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:skyUniforms,
    vertexShader:`varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`precision highp float;varying vec3 direction;uniform float night;uniform float rain;uniform float time;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 a=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(a),hash(a+vec2(1.,0.)),f.x),mix(hash(a+vec2(0.,1.)),hash(a+1.),f.x),f.y);}
    void main(){vec3 d=normalize(direction);float h=max(0.,d.y);vec3 base=mix(vec3(.70,.78,.82),vec3(.30,.51,.69),pow(h,.42));
    vec2 p=d.xz/(max(.15,d.y)+.22)*2.7+vec2(time*.005,0.);float n=noise(p)*.56+noise(p*2.)*.28+noise(p*4.)*.13+noise(p*8.)*.06;float clouds=smoothstep(.47-rain*.14,.72-rain*.08,n);
    vec3 cloud=mix(vec3(.94,.91,.85),vec3(.52,.58,.59),rain);base=mix(base,cloud,clouds*.85);base=mix(base,base*vec3(.12,.16,.27),night);gl_FragColor=vec4(base,1.);}`});
  const sky=new T.Mesh(new T.SphereGeometry(150,32,20),skyMat);sky.frustumCulled=false;scene.add(sky);
  // Real surrounding terrain, with restrained distant hills and actual depth.
  const terrain=new T.PlaneGeometry(170,170,90,90);terrain.rotateX(-Math.PI/2);const pos=terrain.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),r=Math.hypot(x,z);const hill=Math.max(0,r-21)*.07*(1+Math.sin(x*.12)*Math.cos(z*.09))+.9*Math.sin(x*.12+z*.04)*Math.cos(z*.1);pos.setY(i,r<19?-1.8:hill-1.2);}
  terrain.computeVertexNormals();mesh(staticScene,terrain,m.surround);
  mesh(staticScene,new T.CylinderGeometry(15,15.3,1.5,96),m.stone,0,-.78,0);
  const grassGeo=new T.CircleGeometry(15,96);grassGeo.rotateX(-Math.PI/2);mesh(staticScene,grassGeo,m.grass,0,-.006,0);
  const track=new T.CatmullRomCurve3(Array.from({length:80},(_,i)=>{const p=trackPose(i*Math.PI/40);return new T.Vector3(p.x,.025,p.z);}),true);
  mesh(staticScene,ribbon(track,1.85),m.road);
  const grassBlade=new T.BufferGeometry();grassBlade.setAttribute('position',new T.Float32BufferAttribute([-.04,0,0,.04,0,0,.008,.23,0],3));grassBlade.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,.5,1],2));grassBlade.computeVertexNormals();
  const meadow=new T.InstancedMesh(grassBlade,new T.MeshStandardMaterial({color:'#687644',roughness:1,side:T.DoubleSide}),2200),grassDummy=new T.Object3D();
  let blades=0;for(let i=0;i<8500&&blades<2200;i++){
    const a=i*2.399,r=14.7*Math.sqrt(((i*47)%8497)/8497),x=Math.sin(a)*r,z=Math.cos(a)*r;
    const ring=Math.sqrt(x*x/144+z*z/100);if(Math.abs(ring-1)<.10||Math.abs(x-9.5)<1.9||Math.abs(x)<3&&Math.abs(z)<2||z<-2&&x>-7&&x<5)continue;
    grassDummy.position.set(x,.007,z);grassDummy.rotation.set(0,i*.87,0);grassDummy.scale.setScalar(.55+(i%6)*.18);grassDummy.updateMatrix();meadow.setMatrixAt(blades++,grassDummy.matrix);
  }meadow.count=blades;meadow.receiveShadow=true;staticScene.add(meadow);
  const rut=m.road.clone();rut.color.set('#9b866c');
  for(const offset of [-.34,.34]){
    const line=new T.CatmullRomCurve3(Array.from({length:80},(_,i)=>{const a=i*Math.PI/40;return new T.Vector3((12+offset)*Math.sin(a),.027,(10+offset)*Math.cos(a));}),true);
    mesh(staticScene,ribbon(line,.12),rut);
  }
  for(const [x,z,w,d] of [[-5.3,-3.7,3.6,3.9],[-3,-8.2,3.5,3.8],[3,-7.8,3.8,4.1]])staticScene.add(house(m,x,z,w,d));
  const shed=barn(m);staticScene.add(shed);
  // Fence with believable posts/rails, orchard, gate and bridge.
  for(let i=0;i<34;i++){
    const a=-.2+i*Math.PI*1.50/34,x=7.8*Math.sin(a),z=6.5*Math.cos(a),b=a+.11;
    mesh(staticScene,box(.075,.74,.075),m.wood,x,.37,z);
    for(const y of [.30,.59])beam(staticScene,[x,y,z],[7.8*Math.sin(b),y,6.5*Math.cos(b)],.04,m.wood);
  }
  for(const x of [-1.15,1.15])mesh(staticScene,box(.20,2.3,.20),m.wood,x-6,1.15,5.1);
  mesh(staticScene,box(2.65,.22,.34),m.wood,-6,2.2,5.1);
  const cap=mesh(staticScene,box(2.95,.10,.84),m.roof,-6,2.43,5.1);cap.rotation.x=.09;
  const bridges=[];
  for(const angle of [.92,2.13]){
    const p=trackPose(angle),bridge=new T.Group();bridge.position.set(p.x,0,p.z);bridge.rotation.y=p.yaw;staticScene.add(bridge);bridges.push(p);
    for(let i=0;i<21;i++)mesh(bridge,box(2.05,.095,.18),m.wood,0,.08,-1.9+i*.19);
    for(const x of [-1.05,1.05]){for(const z of [-1.85,0,1.85])mesh(bridge,box(.095,.75,.095),m.wood,x,.42,z);beam(bridge,[x,.76,-1.9],[x,.76,1.9],.065,m.wood);mesh(bridge,box(.15,.17,3.95),m.wood,x,-.025,0);}
  }
  // Riverbed edge rocks mask the water/soil transition.
  const bed=ribbon(stream,2.9);mesh(staticScene,bed,m.stone,0,-.01,0);
  for(let i=0;i<120;i++){const p=stream.getPoint(i/119),side=i%2?1:-1,x=p.x+side*1.27,y=Math.hypot(x,p.z)>15?-1.57:.11,rock=mesh(staticScene,new T.DodecahedronGeometry(.15+(i%5)*.025,0),m.stone,x,y,p.z);rock.scale.y=.65;rock.rotation.set(i*.7,i*.37,i*.11);}
  const trees=[];
  for(const [x,z,h] of [[-8,-5,4.7],[-8,1,3.9],[-1,-5,4],[5,-3,4.4],[3,3,3.8],[-4,3.4,3.7],[-9,3.8,3.4]])trees.push(tree(staticScene,m,x,z,h,x*2+z));
  for(let i=0;i<28;i++){const a=i*2.399,r=24+(i%5)*7;trees.push(tree(staticScene,m,Math.sin(a)*r,Math.cos(a)*r,3.8+(i%4)*1.1,i));}
  foliage(staticScene,trees);
  const wheel=waterwheel(m);wheel.group.position.set(9.26,1.42,3.8);scene.add(wheel.group);
  const millHouse=house(m,6.65,3.8,2.45,2.8);staticScene.add(millHouse);
  const wind=windmill(m);scene.add(wind.group);mergeStatic(wind.rotor);mergeStatic(wheel.rotor);
  const car=makeTractor(m);scene.add(car.group);for(const w of car.wheels)mergeStatic(w.spin);
  mergeStatic(car.group,new Set(car.wheels.map(w=>w.spin)));
  // Merge stationary meshes while preserving wheels, steering pivots and wings.
  const hens=Array.from({length:5},(_,i)=>{const h=hen(m);h.group.position.set(-2.4+i*.55,0,3.4+(i%2)*.6);scene.add(h.group);mergeStatic(h.body);return h;});
  const birds=Array.from({length:3},()=>{const b=bird(m);scene.add(b.group);return b;});
  for(let i=0;i<4;i++)sheep(staticScene,m,4.2+(i%2)*.85,-1.8+Math.floor(i/2)*.8);
  const bales=[];for(let i=0;i<18;i++){const bale=new T.Group();bale.position.set(-2.2+(i%6)*.64,.38+Math.floor(i/6)*.65,.9);const hay=mesh(bale,new T.CylinderGeometry(.31,.31,.48,20),m.hay);hay.rotation.x=Math.PI/2;for(const z of [-.17,.17]){const ring=mesh(bale,new T.TorusGeometry(.312,.014,5,24),m.dark,0,0,z);}scene.add(bale);bales.push(bale);}
  mergeStatic(staticScene);
  const river=water(scene),rain=weather(scene,m),drive=createDrive();let waterPhase=0,millPhase=0,animalTime=0,nightBlend=0,lastStats={},frames=0;
  const localLight=new T.PointLight('#edac59',0,16,2);localLight.position.set(-.5,2,3);scene.add(localLight);
  function resize(width,height,quality){
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,quality==='eco'?1:1.5));renderer.setSize(width,height,false);camera.aspect=width/height;
    sun.shadow.mapSize.set(quality==='eco'?1024:2048,quality==='eco'?1024:2048);
    camera.position.set(24,21,28);if(camera.aspect<1.1)camera.position.multiplyScalar(1.1/camera.aspect);camera.lookAt(0,1.1,0);camera.updateProjectionMatrix();
  }
  return {resize,get stats(){return {...lastStats};},render({activity,dt,time,still,night,dusk=false,quality='smooth'}){
    const v=drive.step(dt,activity.wind,still);const bridgeDistance=Math.min(...bridges.map(p=>Math.hypot(p.x-v.x,p.z-v.z)));
    const elevation=.13*Math.max(0,Math.min(1,(2.65-bridgeDistance)/.65));car.group.position.set(v.x,elevation,v.z);car.group.rotation.y=v.yaw;
    for(const w of car.wheels)w.spin.rotation.x=w.front?v.frontAngle:v.rearAngle;
    for(const s of car.frontSteer)s.rotation.y=v.steering;
    if(!still){waterPhase+=dt*(activity.ripples>0?.15+activity.ripples*.95:0);millPhase+=dt*(activity.fireflies>0?.12+activity.fireflies*.85:0);animalTime+=dt;}
    wheel.rotor.rotation.x=-waterPhase;wind.rotor.rotation.z=millPhase;
    river.uniforms.time.value=waterPhase;river.uniforms.flow.value=activity.ripples;river.uniforms.rain.value=activity.rain;
    for(let i=0;i<hens.length;i++){
      const h=hens[i],cycle=(animalTime+i*3.7)%23,lap=Math.floor((animalTime+i*3.7)/23),walk=cycle<5,d=walk?cycle*.045:.225,dir=lap%2? -1:1;
      h.group.position.x=-2.4+i*.55+(dir>0?d:.225-d);h.group.rotation.y=dir>0?Math.PI/2:-Math.PI/2;
      const gait=henGait(d);h.legs.forEach((leg,k)=>{leg.position.z=gait[k].swing;leg.position.y=.04+gait[k].lift;});
      h.body.rotation.x=walk?0:cycle>12?.40*(.5+.5*Math.sin(animalTime*1.2+i)):0;
    }
    for(let i=0;i<birds.length;i++){
      const b=birds[i],a=animalTime*.15+i*2.1;b.group.position.set(Math.sin(a)*(10+i),7+i*.5,Math.cos(a)*(8+i));b.group.rotation.y=Math.atan2(Math.cos(a)*(10+i),-Math.sin(a)*(8+i));b.group.rotation.z=-.13;
      b.wings[0].rotation.z=Math.sin(animalTime*6+i)*.37;b.wings[1].rotation.z=-Math.sin(animalTime*6+i)*.37;
    }
    bales.forEach((b,i)=>b.visible=i<Math.round(activity.glow*18));
    const desired=night?1:0;nightBlend+= (desired-nightBlend)*(still?1:1-Math.exp(-dt*1.4));
    ambient.intensity=2-nightBlend*.6;sun.intensity=(3.5-nightBlend*2.2)*(1-activity.rain*.55)*(dusk?.78:1);sun.color.set(nightBlend>.5?'#9cb1d3':dusk?'#ffc07a':'#fff0cf');renderer.toneMappingExposure=1.10+nightBlend*.2;
    scene.background.setRGB(.66-nightBlend*.56,.74-nightBlend*.58,.77-nightBlend*.50);scene.fog.color.copy(scene.background);
    m.window.emissiveIntensity=nightBlend*1.5;localLight.intensity=nightBlend*8;
    river.uniforms.night.value=nightBlend;m.road.roughness=.96-activity.rain*.48;m.roof.roughness=.86-activity.rain*.3;
    skyUniforms.night.value=nightBlend;skyUniforms.rain.value=activity.rain;skyUniforms.time.value=animalTime;
    const rainDrops=rain.update(dt,animalTime,activity.rain,still);
    // Render dynamic shadows at the actual animation frame rate.
    renderer.render(scene,camera);frames++;
    lastStats={engine:'webgl-3d',frames,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,tractorProgress:v.t/(Math.PI*2),tractorSpeed:v.speed,tractorYaw:v.yaw,tireAngle:v.rearAngle,frontTireAngle:v.frontAngle,steering:v.steering,millAngle:millPhase,wheelAngle:waterPhase,waterPhase,hayBales:Math.round(activity.glow*18),rainDrops,tractorLoaded:true,waterwheelLoaded:true,farmLoaded:true};
  }};
}
