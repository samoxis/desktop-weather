import * as T from './vendor/three.module.js';
import {box,mesh,beam} from './world-models.mjs';
import {VEHICLE} from './photo-course.mjs';
function cylinder(parent,material,r,h,x,y,z,axis='y'){
 const n=mesh(parent,new T.CylinderGeometry(r,r,h,24),material,x,y,z);if(axis==='x')n.rotation.z=Math.PI/2;if(axis==='z')n.rotation.x=Math.PI/2;return n;
}
function panel(parent,m,w,h,d,x,y,z){
 const s=new T.Shape(),r=.035;s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
 const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,steps:1,curveSegments:8});g.translate(0,0,-d/2);return mesh(parent,g,m,x,y,z);
}
export function photographicTractor(m){
 const g=new T.Group(),wheels=[],steering=[];
 g.scale.setScalar(VEHICLE.scale);
 // Correctly proportioned separate chassis, exposed engine, long bonnet and cab.
 mesh(g,box(.69,.18,2.8),m.iron,0,.52,.08);
 mesh(g,box(.64,.52,1.35),m.iron,0,.85,.55);
 panel(g,m.paint,.82,.45,1.45,0,1.25,.88);
 panel(g,m.paint,.82,.52,.075,0,1.13,1.63);
 mesh(g,box(.66,.36,.085),m.black,0,1.13,1.68);
 for(let i=0;i<19;i++)mesh(g,box(.013,.32,.026),m.steel,-.29+i*.032,1.13,1.735);
 mesh(g,box(1.06,.09,.14),m.iron,0,.69,1.81);
 for(const side of [-1,1]){
  cylinder(g,m.iron,.115,.13,side*.34,1.30,1.70,'z');cylinder(g,m.lamp,.088,.018,side*.34,1.30,1.775,'z');
  // Vented engine cover, oil filter, starter, fuel pipes, steps and side rails.
  for(let i=0;i<9;i++)mesh(g,box(.012,.024,.11),m.black,side*.419,1.24,.38+i*.12);
  cylinder(g,m.iron,.095,.30,side*.37,.81,.94);
  cylinder(g,m.steel,.065,.22,side*.39,.72,.25,'z');
  for(let i=0;i<4;i++)cylinder(g,m.iron,.035,.34,side*.31,.85,.12+i*.18);
  beam(g,[side*.39,.72,.01],[side*.4,1.10,.38],.024,m.steel);
  for(let i=0;i<3;i++)mesh(g,box(.24,.04,.28),m.iron,side*.58,.32+i*.20,-.22-i*.12);
  beam(g,[side*.49,1.07,-.35],[side*.49,1.38,-.22],.025,m.steel);
 }
 cylinder(g,m.iron,.041,1.04,.32,1.85,.67);cylinder(g,m.steel,.057,.30,.32,1.75,.67);
 cylinder(g,m.black,.048,.04,.32,2.38,.67);
 cylinder(g,m.iron,.054,.58,-.32,1.82,1.00);cylinder(g,m.black,.091,.06,-.32,2.13,1.00);
 // Glass is genuinely transparent; driver, seat, wheel and gauges remain visible.
 const cab=new T.Group();g.add(cab);cab.position.set(0,1.73,-.67);
 for(const x of [-.49,.49])for(const z of [-.58,.58])beam(cab,[x,-.55,z],[x,.73,z*.91],.038,m.paint);
 panel(cab,m.paint,1.13,.065,1.30,0,.77,-.035);
 for(const z of [-.55,.55])mesh(cab,box(1,.97,.009),m.glass,0,.16,z);
 for(const x of [-.49,.49]){
  mesh(cab,box(.009,.98,1.08),m.glass,x,.16,0);
  beam(cab,[x,-.12,-.54],[x,-.12,.54],.023,m.paint);
  mesh(cab,box(.028,.018,.11),m.steel,x,.08,.12);
 }
 beam(cab,[.08,.55,.57],[.32,-.04,.57],.016,m.black);
 panel(g,m.seat,.55,.11,.48,0,1.22,-.70);panel(g,m.seat,.55,.40,.11,0,1.44,-.94);
 const torso=mesh(g,new T.SphereGeometry(1,20,12),m.cloth,0,1.60,-.73);torso.scale.set(.18,.26,.14);
 const head=mesh(g,new T.SphereGeometry(1,20,16),m.skin,0,1.94,-.70);head.scale.set(.10,.13,.105);
 cylinder(g,m.cloth,.12,.055,0,2.06,-.70);
 for(const side of [-1,1]){beam(g,[side*.15,1.73,-.61],[side*.21,1.47,-.32],.073,m.cloth);beam(g,[side*.09,1.31,-.63],[side*.18,.98,-.28],.075,m.cloth);}
 const wheel=mesh(g,new T.TorusGeometry(.18,.017,10,32),m.black,0,1.44,-.28);wheel.rotation.x=.9;
 cylinder(g,m.iron,.045,.42,0,1.25,-.17);
 for(const x of [-.73,.73]){
  // Curved rear mudguard follows the tire envelope, rather than a flat toy slab.
  const curve=new T.EllipseCurve(0,0,.78,.78,.10,Math.PI-.10,false,0),p=curve.getPoints(32),positions=[],indices=[];
  for(const v of p)for(const sx of [-.22,.22])positions.push(x+sx,.74+v.y,-1.01+v.x);
  for(let i=0;i<32;i++){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();const f=mesh(g,geo,m.fender);f.material.side=T.DoubleSide;
  mesh(g,box(.07,.055,.17),m.tailLamp,x,1.03,-1.67);
 }
 function tire(x,z,r,front){
  const pivot=new T.Group();pivot.position.set(x,r,z);g.add(pivot);if(front)steering.push(pivot);
  const spin=new T.Group();pivot.add(spin);wheels.push({spin,front,r});
  // Lathed sidewall/tread profile, with a real wheel-axis X.
  const width=front?.25:.39,profile=[[-width*.52,r*.48],[-width*.58,r*.67],[-width*.50,r*.88],[-width*.36,r*.97],[0,r],[width*.36,r*.97],[width*.50,r*.88],[width*.58,r*.67],[width*.52,r*.48]];
  const geo=new T.LatheGeometry(profile.map(([ax,rad])=>new T.Vector2(rad,ax)),72);geo.rotateZ(-Math.PI/2);mesh(spin,geo,m.rubber);
  cylinder(spin,m.rim,r*.50,width*.99,0,0,0,'x');
  for(const side of [-1,1]){
   const face=new T.Group();face.position.x=side*width*.52;spin.add(face);
   cylinder(face,m.paint,r*.29,.035,0,0,0,'x');cylinder(face,m.steel,r*.135,.075,side*.026,0,0,'x');
   for(let k=0;k<8;k++){const a=k*Math.PI/4;cylinder(face,m.steel,.016,.035,side*.037,Math.cos(a)*r*.32,Math.sin(a)*r*.32,'x');}
  }
  for(let i=0;i<(front?26:32);i++)for(const side of [-1,1]){
   const angle=i*Math.PI*2/(front?26:32),lug=new T.Group();lug.rotation.x=angle;spin.add(lug);
   const tread=panel(lug,m.rubber,width*.60,r*.065,r*.17,side*width*.25,r*.992,0);tread.rotation.y=side*.58;
  }
 }
 tire(-.81,-1.02,.73,false);tire(.81,-1.02,.73,false);tire(-.68,1.02,.46,true);tire(.68,1.02,.46,true);
 cylinder(g,m.iron,.055,1.68,0,.73,-1.02,'x');
 const axle=cylinder(g,m.iron,.045,1.42,0,.46,1.02,'x');
 for(const side of [-1,1])beam(g,[side*.58,.50,.12],[side*.66,.48,1.02],.025,m.iron);
 return {group:g,wheels,steering};
}
export function photographicWheel(m){
 const group=new T.Group(),rotor=new T.Group();group.add(rotor);const r=1.76;
 for(const x of [-.25,.25]){
  const rim=mesh(rotor,new T.TorusGeometry(r,.085,12,80),m.wood,x,0,0);rim.rotation.y=Math.PI/2;
  for(let i=0;i<12;i++){const a=i*Math.PI/6;beam(rotor,[x,0,0],[x,r*Math.cos(a),r*Math.sin(a)],.075,m.wood);}
  const band=mesh(rotor,new T.TorusGeometry(r+.01,.026,8,80),m.iron,x,0,0);band.rotation.y=Math.PI/2;
 }
 for(let i=0;i<24;i++){const a=i*Math.PI/12,p=mesh(rotor,box(.61,.13,.35),m.wood,0,r*Math.cos(a),r*Math.sin(a));p.rotation.x=a;}
 cylinder(rotor,m.iron,.15,.87,0,0,0,'x');cylinder(group,m.wood,.08,1.02,-.33,0,0,'x');
 return {group,rotor,radius:r};
}
export function photographicSails(m){
 const g=new T.Group();
 for(let i=0;i<4;i++){const b=new T.Group();b.rotation.z=i*Math.PI/2;g.add(b);mesh(b,box(.075,2.0,.055),m.wood,0,1.0,0);for(let j=0;j<10;j++)mesh(b,box(.48,.073,.03),m.wood,.18,.70+j*.115,.02);beam(b,[-.05,.65,.02],[.44,1.82,.02],.024,m.wood);}
 cylinder(g,m.iron,.12,.14,0,0,0,'z');return g;
}
