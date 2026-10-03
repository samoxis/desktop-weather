import * as T from './vendor/three.module.js';
import {mesh,box} from './world-models.mjs';
export const stream=new T.CatmullRomCurve3([new T.Vector3(9,.07,-32),new T.Vector3(8.5,.07,-16),new T.Vector3(9.8,.07,-8),new T.Vector3(10,.07,0),new T.Vector3(8.8,.07,7),new T.Vector3(9.7,.07,17),new T.Vector3(8,.07,32)]);
export function ribbon(curve,width,steps=180){
  const p=[],uv=[],ix=[];
  for(let i=0;i<=steps;i++){
    const t=i/steps,v=curve.getPoint(t),tan=curve.getTangent(t),side=new T.Vector3(-tan.z,0,tan.x).normalize();
    for(const sign of [-1,1]){const q=v.clone().addScaledVector(side,sign*width/2);if(curve===stream)q.y=Math.hypot(q.x,q.z)>15?-1.70:.07;p.push(q.x,q.y,q.z);uv.push((sign+1)/2,t);}
    if(i<steps){const a=i*2;ix.push(a,a+1,a+2,a+1,a+3,a+2);}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
}
export function water(scene){
  const uniforms={time:{value:0},flow:{value:.3},rain:{value:0},night:{value:0}};
  const material=new T.ShaderMaterial({uniforms,side:T.DoubleSide,transparent:true,
    vertexShader:`varying vec2 vUv;varying vec3 vWorld;uniform float time;void main(){vUv=uv;vec3 p=position;p.y+=sin(uv.y*170.-time*1.8)*.009+sin(uv.x*21.+uv.y*60.-time)*.006;vWorld=p;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader:`precision highp float;varying vec2 vUv;varying vec3 vWorld;uniform float time;uniform float flow;uniform float rain;uniform float night;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
      void main(){float travel=time*(.07+flow*.18);vec2 q=vec2(vUv.x*13.,vUv.y*130.-travel*13.);
      float n=noise(q)*.6+noise(q*2.7)*.25+noise(q*6.3)*.15;float wave=sin(vUv.y*380.-travel*48.+n*7.);
      float edges=smoothstep(.18,.0,vUv.x)+smoothstep(.82,1.,vUv.x);float foam=smoothstep(.72,.94,n+edges*.19)*.37;
      float sparkle=pow(max(0.,wave),22.)*.15*(.3+n);float rings=0.;
      vec2 cell=vec2(vUv.x*9.,vUv.y*90.);vec2 id=floor(cell);vec2 local=fract(cell)-.5;
      float age=fract(time*1.1+hash(id));float ripple=1.-smoothstep(.017,.055,abs(length(local)-age*.52));rings=ripple*(1.-age)*rain*.2;
      vec3 base=mix(vec3(.16,.29,.28),vec3(.37,.47,.41),n);base+=vec3(.66,.72,.68)*(foam+sparkle+rings);
      base=mix(base,base*vec3(.27,.39,.56),night);gl_FragColor=vec4(base,.94);}`});
  const river=mesh(scene,ribbon(stream,2.25),material);river.castShadow=false;river.receiveShadow=false;
  return {uniforms,mesh:river};
}
export function weather(scene,m){
  const count=1100,dummy=new T.Object3D();
  const drops=new T.InstancedMesh(new T.SphereGeometry(1,5,4),new T.MeshPhysicalMaterial({color:0xd3e1e5,roughness:.1,metalness:.0,transparent:true,opacity:.48}),count);
  drops.instanceMatrix.setUsage(T.DynamicDrawUsage);drops.frustumCulled=false;scene.add(drops);
  const splashes=new T.InstancedMesh(new T.RingGeometry(.06,.072,20),new T.MeshBasicMaterial({color:0xd3e1d9,transparent:true,opacity:.23,side:T.DoubleSide,depthWrite:false}),100);
  splashes.instanceMatrix.setUsage(T.DynamicDrawUsage);splashes.frustumCulled=false;scene.add(splashes);
  const impacts=Array.from({length:100},()=>({x:0,y:0,z:0,age:2}));let cursor=0;
  const particles=Array.from({length:count},(_,i)=>{const r=14.2*Math.sqrt(((i*43)%1099)/1099),a=i*2.399;return {x:Math.sin(a)*r,z:Math.cos(a)*r,y:2+(i*.173)%17,velocity:8+(i%9)*.4};});
  function ground(x,z){for(const h of [[-5.3,-3.7,4.24,4.55],[-3,-8.2,4.14,4.45],[3,-7.8,4.44,4.75],[-.4,.3,5.3,3.9],[6.65,3.8,3.09,3.45]])if(Math.abs(x-h[0])<h[2]/2&&Math.abs(z-h[1])<h[3]/2)return 2.54+1.2*(1-Math.max(Math.abs(x-h[0])/(h[2]/2),Math.abs(z-h[1])/(h[3]/2)));return .08;}
  return {update(dt,time,intensity,still){
    const active=Math.round(intensity*count);drops.count=active;
    for(let i=0;i<active;i++){
      const p=particles[i];if(!still){p.y-=p.velocity*dt;p.x+=dt*.25;
        const floor=ground(p.x,p.z);if(p.y<floor){impacts[cursor++%100]={x:p.x,z:p.z,y:floor,age:0};p.y=14+(i%7)*.6;const r=14.2*Math.sqrt(((i*43)%1099)/1099);p.x=Math.sin(i*2.399)*r;}
      }
      dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,0,-.023);dummy.scale.set(.009,.042+p.velocity*.003,.009);dummy.updateMatrix();drops.setMatrixAt(i,dummy.matrix);
    }drops.instanceMatrix.needsUpdate=true;
    splashes.count=intensity>0?100:0;
    for(let i=0;i<100;i++){
      const p=impacts[i];if(!still)p.age+=dt;
      const radius=p.age<.75?.18+p.age*.65:0;dummy.position.set(p.x,p.y+.006,p.z);dummy.rotation.set(-Math.PI/2,0,0);dummy.scale.setScalar(radius*(1-p.age/.75));if(p.age>=.75)dummy.scale.setScalar(0);dummy.updateMatrix();splashes.setMatrixAt(i,dummy.matrix);
    }splashes.instanceMatrix.needsUpdate=true;
    return active;
  }};
}
