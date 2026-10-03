import * as T from './vendor/three.module.js';
export const box=(w,h,d)=>new T.BoxGeometry(w,h,d);
function rounded(w,h,d,r=.05){
  const shape=new T.Shape();shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  const geo=new T.ExtrudeGeometry(shape,{depth:d-r*2,bevelEnabled:true,bevelThickness:r,bevelSize:r*.4,bevelSegments:3,steps:1,curveSegments:5});geo.translate(0,0,-d/2+r);return geo;
}
export function mesh(parent,geometry,material,x=0,y=0,z=0){
  const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
export function beam(parent,a,b,width,material){
  const A=new T.Vector3(...a),B=new T.Vector3(...b),m=mesh(parent,box(width,A.distanceTo(B),width),material);
  m.position.copy(A.add(B).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...b).sub(new T.Vector3(...a)).normalize());return m;
}
function ellipsoid(parent,mat,x,y,z,sx,sy,sz){const m=mesh(parent,new T.SphereGeometry(1,16,12),mat,x,y,z);m.scale.set(sx,sy,sz);return m;}
export function makeTractor(m){
  const g=new T.Group(),chassis=mesh(g,box(.87,.18,1.95),m.dark,0,.48,0);
  mesh(g,rounded(.73,.52,1.03,.045),m.red,0,.93,.62);
  mesh(g,box(.72,.48,.055),m.dark,0,.9,1.17);
  for(let i=0;i<11;i++)mesh(g,box(.025,.38,.014),m.metal,-.29+i*.058,.9,1.204);
  for(const x of [-.29,.29]){const lamp=mesh(g,new T.SphereGeometry(.073,12,8),m.lamp,x,1.05,1.235);lamp.scale.z=.3;}
  mesh(g,box(.10,.08,.92),m.metal,0,.41,.36);
  const exhaust=mesh(g,new T.CylinderGeometry(.035,.04,.82,12),m.metal,.31,1.50,.71);
  const cab=new T.Group();g.add(cab);cab.position.set(0,1.42,-.42);
  for(const x of [-.43,.43])for(const z of [-.43,.43])mesh(cab,box(.036,.98,.036),m.red,x,.20,z);
  mesh(cab,rounded(.94,.058,1.0,.018),m.red,0,.72,0);
  mesh(cab,box(.87,.75,.012),m.glass,0,.21,.43);
  mesh(cab,box(.87,.75,.012),m.glass,0,.21,-.43);
  for(const x of [-.43,.43])mesh(cab,box(.012,.75,.84),m.glass,x,.21,0);
  mesh(g,box(.54,.10,.46),m.seat,0,1.05,-.57);
  const driver=new T.Group();g.add(driver);
  ellipsoid(driver,m.cloth,0,1.43,-.49,.16,.24,.13);ellipsoid(driver,m.skin,0,1.75,-.44,.095,.12,.095);
  mesh(driver,box(.21,.055,.23),m.dark,0,1.87,-.43);
  beam(driver,[-.12,1.51,-.43],[-.16,1.34,-.15],.07,m.cloth);beam(driver,[.12,1.51,-.43],[.16,1.34,-.15],.07,m.cloth);
  const steering=mesh(g,new T.TorusGeometry(.14,.013,8,20),m.dark,0,1.25,-.04);steering.rotation.x=.8;
  for(const x of [-.61,.61]){mesh(g,box(.34,.05,.87),m.red,x,1.11,-.64);mesh(g,box(.28,.15,.035),m.red,x,1.035,-1.05);}
  const wheels=[],frontSteer=[];
  function wheel(x,z,r,front){
    const steer=new T.Group();g.add(steer);steer.position.set(x,r,z);if(front)frontSteer.push(steer);
    const spin=new T.Group();steer.add(spin);wheels.push({spin,r,front});
    const tire=mesh(spin,new T.TorusGeometry(r*.76,r*.24,12,40),m.rubber);tire.rotation.y=Math.PI/2;
    const rim=mesh(spin,new T.CylinderGeometry(r*.48,r*.48,.22,24),m.red);rim.rotation.z=Math.PI/2;
    for(const side of [-1,1]){
      const hub=mesh(spin,new T.CylinderGeometry(r*.17,r*.17,.045,16),m.metal,side*.135,0,0);hub.rotation.z=Math.PI/2;
      for(let i=0;i<6;i++){const a=i*Math.PI/3,bolt=mesh(spin,new T.SphereGeometry(.015,6,4),m.metal,side*.155,Math.cos(a)*r*.31,Math.sin(a)*r*.31);}
    }
    for(let i=0;i<24;i++)for(const side of [-1,1]){
      const a=i*Math.PI/12,local=new T.Group();spin.add(local);local.rotation.x=a;
      const tread=mesh(local,box(.18,r*.09,r*.21),m.rubber,side*.078,r*.965,0);tread.rotation.y=side*.5;
    }
  }
  wheel(-.64,-.65,.59,false);wheel(.64,-.65,.59,false);wheel(-.55,.73,.39,true);wheel(.55,.73,.39,true);
  mesh(g,new T.CylinderGeometry(.037,.037,1.35,10),m.dark,0,.59,-.65).rotation.z=Math.PI/2;
  return {group:g,wheels,frontSteer};
}
function hipRoof(parent,w,d,height,base,mat){
  const p=[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2],[0,height,-d*.16],[0,height,d*.16]];
  const triangles=[[0,1,4],[1,2,5],[1,5,4],[2,3,5],[3,0,4],[3,4,5]];
  const positions=[],uv=[];
  for(const tri of triangles)for(const i of [...tri].reverse()){positions.push(...p[i]);uv.push((p[i][0]+w/2)/w,(p[i][2]+d/2)/d);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
  return mesh(parent,geo,mat,0,base,0);
}
export function house(m,x,z,w=3.6,d=3.9){
  const g=new T.Group();g.position.set(x,0,z);
  mesh(g,box(w,.55,d),m.stone,0,.275,0);mesh(g,box(w,1.92,d),m.plaster,0,1.5,0);
  hipRoof(g,w+.64,d+.65,1.2,2.53,m.roof);
  mesh(g,box(.75,1.3,.045),m.wood,.5,1.05,d/2+.026);
  const windows=[];
  for(const wx of [-1.05,1.03])for(const face of [-1,1]){
    mesh(g,box(.78,.81,.065),m.wood,wx,1.55,face*d/2);
    const win=mesh(g,box(.62,.64,.02),m.window,wx,1.55,face*(d/2+.05));windows.push(win);
    mesh(g,box(.025,.68,.045),m.wood,wx,1.55,face*(d/2+.06));mesh(g,box(.63,.025,.045),m.wood,wx,1.55,face*(d/2+.065));
  }
  // Covered wooden Romanian veranda.
  mesh(g,box(w,.13,1.02),m.wood,0,.38,d/2+.55);
  for(const px of [-w/2+.13,0,w/2-.13])mesh(g,box(.095,1.98,.095),m.wood,px,1.4,d/2+1);
  for(const py of [.9,1.07])mesh(g,box(w,.06,.065),m.wood,0,py,d/2+1);
  for(let i=0;i<14;i++)mesh(g,box(.035,.64,.035),m.wood,-w/2+i*w/13,.74,d/2+1);
  const canopy=mesh(g,box(w+.2,.10,1.28),m.roof,0,2.34,d/2+.6);canopy.rotation.x=-.09;
  mesh(g,box(.36,.95,.39),m.stone,-w*.25,3.17,-d*.12);
  for(let i=0;i<3;i++)mesh(g,box(w*.44,.16,.28),m.stone,.5,.09+i*.13,d/2+.87+i*.23);
  return g;
}
export function barn(m){
  const g=new T.Group();g.position.set(-.4,0,.3);const w=4.8,d=3.3;
  for(const x of [-2.3,0,2.3])for(const z of [-1.5,1.5])mesh(g,box(.16,2.7,.16),m.wood,x,1.35,z);
  mesh(g,box(w,.2,d),m.wood,0,2.7,0);hipRoof(g,w+.5,d+.6,1.2,2.8,m.roof);
  mesh(g,box(w,2.3,.12),m.wood,0,1.3,-1.58);
  for(const x of [-2.37,2.37])mesh(g,box(.12,2.3,d),m.wood,x,1.3,0);
  for(const x of [-2.3,2.3])beam(g,[x,2.55,1.5],[x>0?1.5:-1.5,1.85,1.5],.13,m.wood);
  return g;
}
export function waterwheel(m){
  const g=new T.Group(),rotor=new T.Group();g.add(rotor);
  // Cylinder axis is X; every component shares this actual 3D shaft.
  for(const x of [-.26,.26]){
    const rim=mesh(rotor,new T.TorusGeometry(1.30,.095,10,48),m.wood,x,0,0);rim.rotation.y=Math.PI/2;
    for(let i=0;i<12;i++){const a=i*Math.PI/6;beam(rotor,[x,0,0],[x,Math.cos(a)*1.29,Math.sin(a)*1.29],.085,m.wood);}
  }
  for(let i=0;i<16;i++){
    const a=i*Math.PI/8,paddle=mesh(rotor,box(.62,.17,.34),m.wood,0,Math.cos(a)*1.28,Math.sin(a)*1.28);paddle.rotation.x=a;
  }
  const hub=mesh(rotor,new T.CylinderGeometry(.16,.16,.82,16),m.metal);hub.rotation.z=Math.PI/2;
  const axle=mesh(g,new T.CylinderGeometry(.07,.07,2.25,12),m.metal,-.3,0,0);axle.rotation.z=Math.PI/2;
  return {group:g,rotor};
}
export function windmill(m){
  const g=new T.Group();g.position.set(6.0,0,-5.9);
  mesh(g,new T.CylinderGeometry(.64,.94,3.7,8),m.wood,0,1.85,0);mesh(g,new T.ConeGeometry(1.08,1.05,8),m.roof,0,4.15,0);
  const hub=new T.Group();g.add(hub);hub.position.set(0,3.35,.91);
  for(let i=0;i<4;i++){
    const b=new T.Group();hub.add(b);b.rotation.z=i*Math.PI/2;
    mesh(b,box(.10,2.05,.09),m.wood,0,1.05,0);
    for(let slat=0;slat<10;slat++)mesh(b,box(.63,.08,.045),m.wood,-.24,.63+slat*.13,.035);
    beam(b,[-.56,.60,.04],[.1,1.91,.04],.035,m.wood);
  }
  mesh(hub,new T.SphereGeometry(.14,12,8),m.metal);
  return {group:g,rotor:hub};
}
export function hen(m){
  const g=new T.Group(),body=new T.Group();g.add(body);
  ellipsoid(body,m.feather,0,.28,0,.13,.16,.21);
  const neck=ellipsoid(body,m.feather,0,.40,.12,.075,.13,.07),head=ellipsoid(body,m.feather,0,.51,.17,.065,.075,.065);
  const beak=mesh(body,new T.ConeGeometry(.025,.075,8),m.beak,0,.50,.245);beak.rotation.x=Math.PI/2;
  for(const x of [-.047,.047])ellipsoid(body,m.eye,x,.535,.19,.009,.011,.009);
  for(let i=0;i<4;i++)ellipsoid(body,m.comb,0,.585,.135+i*.025,.016,.029,.018);
  for(let i=0;i<5;i++){const feather=ellipsoid(body,m.featherDark,(i-2)*.025,.35,-.21,.023,.08,.125);feather.rotation.x=-.7;}
  for(const side of [-1,1]){
    ellipsoid(body,m.featherDark,side*.12,.28,-.015,.022,.10,.15);
    for(let j=0;j<7;j++){const f=ellipsoid(body,m.feather,side*.128,.25+j*.01,-.12+j*.031,.008,.015,.045);f.rotation.x=.55;}
  }
  const legs=[];
  for(const x of [-.065,.065]){
    const leg=new T.Group();g.add(leg);leg.position.set(x,.04,0);legs.push(leg);
    beam(leg,[0,0,0],[0,.15,.025],.013,m.beak);
    for(const toe of [-1,0,1])beam(leg,[0,0,0],[toe*.026,-.015,.056],.01,m.beak);
  }
  return {group:g,body,legs};
}
export function bird(m){
  const g=new T.Group();ellipsoid(g,m.bird,0,0,0,.095,.07,.26);ellipsoid(g,m.bird,0,.05,.22,.07,.06,.08);
  const wings=[];
  for(const side of [-1,1]){const wing=new T.Group();g.add(wing);wing.position.x=side*.075;wings.push(wing);
    const feathers=ellipsoid(wing,m.bird,side*.25,0,-.015,.31,.023,.14);feathers.rotation.y=side*.25;
    for(let i=0;i<5;i++)ellipsoid(wing,m.bird,side*(.35+i*.035),0,-.035-i*.018,.08,.014,.045);
  }
  return {group:g,wings};
}
