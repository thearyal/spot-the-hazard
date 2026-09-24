import * as THREE from 'three';

(function(){
"use strict";

/* ============================================================
   SCENE / RENDERER / CAMERA
   ============================================================ */
const wrap = document.getElementById('canvasWrap');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2830);
scene.fog = new THREE.FogExp2(0x1a2830, 0.028);

const camera = new THREE.PerspectiveCamera(68, window.innerWidth/window.innerHeight, 0.05, 200);
camera.position.set(0, 1.65, 16);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
wrap.appendChild(renderer.domElement);

window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ============================================================
   HITBOX HELPER (invisible collision/click boxes)
   ============================================================ */
function box(w,h,d,color,pos,rotY=0,opts={}){
  const mat = new THREE.MeshStandardMaterial({color, roughness:0.75, metalness:0.05, ...opts});
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  m.position.copy(pos); m.rotation.y = rotY;
  return m;
}

/* ============================================================
   CANVAS TEXTURE HELPER (signs / posters, no external assets)
   ============================================================ */
function makeCanvasTexture(draw, w=256, h=256){
  const c = document.createElement('canvas'); c.width=w; c.height=h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

/* ============================================================
   MATERIALS (flat-color, matches the reference design exactly)
   ============================================================ */
const matConcrete = new THREE.MeshStandardMaterial({color:0x7e8690, roughness:0.82, metalness:0.06});

/* ============================================================
   CORRUGATED METAL WALL TEXTURE — matches the reference photo
   (vertical ribs, light silver-grey, rows of rivets)
   ============================================================ */
const corrugatedWallTex = makeCanvasTexture((ctx,w,h)=>{
  ctx.fillStyle = "#c9cdd1"; ctx.fillRect(0,0,w,h);
  const rib = 16;
  for(let x=0; x<w; x+=rib){
    const grad = ctx.createLinearGradient(x,0,x+rib,0);
    grad.addColorStop(0.00, "rgba(255,255,255,0.05)");
    grad.addColorStop(0.22, "rgba(255,255,255,0.55)");
    grad.addColorStop(0.42, "rgba(255,255,255,0.10)");
    grad.addColorStop(0.55, "rgba(0,0,0,0.22)");
    grad.addColorStop(0.72, "rgba(0,0,0,0.08)");
    grad.addColorStop(1.00, "rgba(255,255,255,0.05)");
    ctx.fillStyle = grad;
    ctx.fillRect(x,0,rib,h);
  }
  ctx.fillStyle = "rgba(50,55,60,0.55)";
  for(let ry=h*0.28; ry<h; ry+=h*0.44){
    for(let rx=rib*0.5; rx<w; rx+=rib*3){
      ctx.beginPath(); ctx.arc(rx, ry, 2.4, 0, Math.PI*2); ctx.fill();
    }
  }
}, 512, 512);
corrugatedWallTex.wrapS = corrugatedWallTex.wrapT = THREE.RepeatWrapping;
const matCorrugated = new THREE.MeshStandardMaterial({map:corrugatedWallTex, roughness:0.5, metalness:0.25});
const matFloor    = new THREE.MeshStandardMaterial({color:0x50575f, roughness:0.72, metalness:0.12});
const matMetal    = new THREE.MeshStandardMaterial({color:0x8b929a, roughness:0.38, metalness:0.68});
const matShelf    = new THREE.MeshStandardMaterial({color:0x4a6d94, roughness:0.48, metalness:0.32});
const matWood     = new THREE.MeshStandardMaterial({color:0xa07a28, roughness:0.78, metalness:0.04});
const matCard     = new THREE.MeshStandardMaterial({color:0xc9a978, roughness:0.88, metalness:0});

/* ============================================================
   LABELED CARTON BOXES — matches the reference photo
   (tan cardboard, tape seam, "CARTON ##" label, barcode)
   ============================================================ */
function makeCartonTexture(num){
  return makeCanvasTexture((ctx,w,h)=>{
    ctx.fillStyle="#c8a978"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle="rgba(232,220,190,0.55)";
    ctx.fillRect(w*0.47, 0, w*0.06, h);
    ctx.fillStyle="rgba(90,65,35,0.22)";
    ctx.fillRect(0, h*0.87, w, h*0.13);
    const lx=w*0.12, ly=h*0.27, lw=w*0.76, lh=h*0.42;
    ctx.fillStyle="#efe8d8";
    ctx.fillRect(lx,ly,lw,lh);
    ctx.strokeStyle="rgba(0,0,0,0.18)"; ctx.lineWidth=2;
    ctx.strokeRect(lx,ly,lw,lh);
    ctx.fillStyle="#181818";
    ctx.font="bold "+Math.round(h*0.115)+"px sans-serif";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("CARTON "+num, w/2, ly+lh*0.3);
    ctx.font=Math.round(h*0.052)+"px sans-serif";
    ctx.fillText("HANDLE WITH CARE", w/2, ly+lh*0.56);
    const bx0=lx+lw*0.08, by0=ly+lh*0.72, bwMax=lw*0.84, bh=lh*0.2;
    let cx=bx0;
    while(cx < bx0+bwMax){
      const barW = 1+Math.random()*3;
      if(Math.random()>0.38){ ctx.fillStyle="#111"; ctx.fillRect(cx,by0,barW,bh); }
      cx += barW + 1 + Math.random()*2;
    }
  }, 220, 220);
}
const cartonMats = ['24','12','36','08','19'].map(n =>
  new THREE.MeshStandardMaterial({map: makeCartonTexture(n), roughness:0.85}));
const matCardTop = new THREE.MeshStandardMaterial({color:0xb89968, roughness:0.9});
let cartonIdx = 0;
function cartonBox(w,h,d){
  const sideMat = cartonMats[cartonIdx % cartonMats.length]; cartonIdx++;
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), [sideMat,sideMat,matCardTop,matCardTop,sideMat,sideMat]);
  m.castShadow = true;
  return m;
}
const matOrange   = new THREE.MeshStandardMaterial({color:0xe67e22, roughness:0.52, metalness:0.28});
const matYellow   = new THREE.MeshStandardMaterial({color:0xf1c40f, roughness:0.48, metalness:0.2});
const matRed      = new THREE.MeshStandardMaterial({color:0xc0392b, roughness:0.48, metalness:0.22});
const matGreen    = new THREE.MeshStandardMaterial({color:0x27ae60, roughness:0.52, metalness:0.2});
const matBlue     = new THREE.MeshStandardMaterial({color:0x2980b9, roughness:0.52, metalness:0.25});
const matDark     = new THREE.MeshStandardMaterial({color:0x2c3e50, roughness:0.68, metalness:0.3});
const matHiVis    = new THREE.MeshStandardMaterial({color:0xf39c12, roughness:0.52, emissive:0x553300, emissiveIntensity:0.12});
const matSkin     = new THREE.MeshStandardMaterial({color:0xe0ac69, roughness:0.78});
const matStripe   = new THREE.MeshStandardMaterial({color:0xf1c40f, roughness:0.9});
const matHelmet   = new THREE.MeshStandardMaterial({color:0xffdd00, roughness:0.28, metalness:0.18});

/* ============================================================
   HI-VIS SAFETY VEST — matches the reference photo
   (orange mesh base, silver reflective stripes edged yellow-green)
   ============================================================ */
const VEST_ORANGE = "#f4600c";
const VEST_SILVER = "#c8ccd0";
const VEST_LIME   = "#d6e64b";

function drawVestBase(ctx,w,h){
  ctx.fillStyle = VEST_ORANGE; ctx.fillRect(0,0,w,h);
  // subtle mesh weave
  ctx.strokeStyle = "rgba(0,0,0,0.07)"; ctx.lineWidth = 1;
  for(let x=0;x<w;x+=5){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for(let y=0;y<h;y+=5){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
}
// a horizontal reflective band: lime edge / silver core / lime edge
function drawHBand(ctx,w,y,bandH){
  const edge = bandH*0.26;
  ctx.fillStyle = VEST_LIME;   ctx.fillRect(0, y, w, bandH);
  ctx.fillStyle = VEST_SILVER; ctx.fillRect(0, y+edge, w, bandH-edge*2);
}
function drawVBand(ctx,h,x,bandW){
  const edge = bandW*0.26;
  ctx.fillStyle = VEST_LIME;   ctx.fillRect(x, 0, bandW, h);
  ctx.fillStyle = VEST_SILVER; ctx.fillRect(x+edge, 0, bandW-edge*2, h);
}

// FRONT: two vertical bands running over the shoulders + waist band
const vestFrontTex = makeCanvasTexture((ctx,w,h)=>{
  drawVestBase(ctx,w,h);
  drawVBand(ctx,h, w*0.17, w*0.13);
  drawVBand(ctx,h, w*0.70, w*0.13);
  drawHBand(ctx,w, h*0.62, h*0.15);
  // front zip opening
  ctx.fillStyle="rgba(120,40,0,0.35)"; ctx.fillRect(w*0.485,0,w*0.03,h);
},180,220);

// BACK: same vertical bands + waist band, no zip
const vestBackTex = makeCanvasTexture((ctx,w,h)=>{
  drawVestBase(ctx,w,h);
  drawVBand(ctx,h, w*0.17, w*0.13);
  drawVBand(ctx,h, w*0.70, w*0.13);
  drawHBand(ctx,w, h*0.62, h*0.15);
},180,220);

// SIDES: just the waist band wrapping around
const vestSideTex = makeCanvasTexture((ctx,w,h)=>{
  drawVestBase(ctx,w,h);
  drawHBand(ctx,w, h*0.62, h*0.15);
},120,220);

const matVestFront = new THREE.MeshStandardMaterial({map:vestFrontTex, roughness:0.55});
const matVestBack  = new THREE.MeshStandardMaterial({map:vestBackTex,  roughness:0.55});
const matVestSide  = new THREE.MeshStandardMaterial({map:vestSideTex,  roughness:0.55});
const matVestTop   = new THREE.MeshStandardMaterial({color:0xf4600c,   roughness:0.6});

const matReflect  = new THREE.MeshStandardMaterial({color:0xf5f5f5, roughness:0.25, metalness:0.4, emissive:0xaaaaaa, emissiveIntensity:0.2});

/* ============================================================
   ROOM SHELL — same 52 x 42 x 12 footprint as the reference
   ============================================================ */
const ROOM_W = 52, ROOM_D = 42, ROOM_H = 12;
const root = new THREE.Group();
scene.add(root);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D), matFloor);
floor.rotation.x = -Math.PI/2;
floor.receiveShadow = true;
root.add(floor);

function aisle(x,z,w,d){
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w,d), matStripe);
  m.rotation.x = -Math.PI/2;
  m.position.set(x,0.012,z);
  root.add(m);
}
aisle(0,0,4.4,ROOM_D-5); aisle(0,-11,ROOM_W-10,3); aisle(0,11,ROOM_W-10,3);

function wall(w,h,d,x,y,z){
  const mat = matCorrugated.clone();
  mat.map = corrugatedWallTex.clone();
  mat.map.needsUpdate = true;
  const mainSpan = Math.max(w,d);
  mat.map.repeat.set(mainSpan/2.4, h/2.4);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  m.position.set(x,y,z);
  m.receiveShadow = true; m.castShadow = true;
  root.add(m);
}
wall(ROOM_W,ROOM_H,0.35,0,ROOM_H/2,-ROOM_D/2);
wall(ROOM_W*0.34,ROOM_H,0.35,-ROOM_W*0.33,ROOM_H/2,ROOM_D/2);
wall(ROOM_W*0.34,ROOM_H,0.35,ROOM_W*0.33,ROOM_H/2,ROOM_D/2);
wall(0.35,ROOM_H,ROOM_D,-ROOM_W/2,ROOM_H/2,0);
wall(0.35,ROOM_H,ROOM_D,ROOM_W/2,ROOM_H/2,0);

/* ---- Big sectional warehouse door filling the front entrance gap ---- */
{
  const doorTex = makeCanvasTexture((ctx,w,h)=>{
    ctx.fillStyle="#aab2bb"; ctx.fillRect(0,0,w,h);
    const rows = 10;
    for(let i=0;i<rows;i++){
      const y = (h/rows)*i;
      ctx.fillStyle = i%2===0 ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
      ctx.fillRect(0,y,w,h/rows);
      ctx.strokeStyle="rgba(0,0,0,0.25)"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
    }
  },128,320);
  const doorPanel = new THREE.Mesh(new THREE.PlaneGeometry(16,9.4), new THREE.MeshStandardMaterial({map:doorTex, roughness:0.55, metalness:0.35}));
  doorPanel.position.set(0, 4.7, ROOM_D/2-0.08);
  doorPanel.rotation.y = Math.PI;
  root.add(doorPanel);
  // frame pillars either side + header beam
  const pillarMat = matMetal;
  const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.5,10,0.6), pillarMat);
  pillarL.position.set(-8.3,5,ROOM_D/2-0.1); root.add(pillarL);
  const pillarR = pillarL.clone(); pillarR.position.x = 8.3; root.add(pillarR);
  const header = new THREE.Mesh(new THREE.BoxGeometry(17,0.6,0.6), pillarMat);
  header.position.set(0,9.7,ROOM_D/2-0.1); root.add(header);
  const warningTex = makeCanvasTexture((ctx,w,h)=>{
    ctx.fillStyle="#1c232b"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle="#f1c40f"; ctx.font="bold 34px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("WAREHOUSE ENTRANCE", w/2, h/2);
  },520,90);
  const warnSign = new THREE.Mesh(new THREE.PlaneGeometry(4.6,0.8), new THREE.MeshStandardMaterial({map:warningTex}));
  warnSign.position.set(0,10.4,ROOM_D/2-0.1);
  warnSign.rotation.y = Math.PI;
  root.add(warnSign);
}

/* ---- Safety rule posters, placed where the player will actually see them ---- */
function safetyPoster(x,y,z,rotY,title,lines,accent){
  const tex = makeCanvasTexture((ctx,w,h)=>{
    ctx.fillStyle="#eef1f4"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle=accent; ctx.fillRect(0,0,w,44);
    ctx.fillStyle="#101418"; ctx.font="bold 30px sans-serif"; ctx.textAlign="center";
    ctx.fillText(title, w/2, 30);
    ctx.font="22px sans-serif"; ctx.textAlign="left";
    lines.forEach((line,i)=>{
      ctx.fillText("• "+line, 20, 90+i*38);
    });
    ctx.strokeStyle=accent; ctx.lineWidth=6; ctx.strokeRect(3,3,w-6,h-6);
  },380,340);
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.7), new THREE.MeshStandardMaterial({map:tex}));
  poster.position.set(x,y,z);
  poster.rotation.y = rotY;
  root.add(poster);
}
safetyPoster(-ROOM_W/2+0.05, 2.6, -10, Math.PI/2, "PPE REQUIRED",
  ["Hard hat at all times","Hi-vis vest in aisles","Steel-toe boots only"], "#e67e22");
safetyPoster(ROOM_W/2-0.05, 2.6, 6, -Math.PI/2, "FORKLIFT SAFETY",
  ["Look before you walk","Stay clear of raised loads","Obey the yellow lanes"], "#2980b9");
safetyPoster(6, 2.6, -ROOM_D/2+0.05, 0, "REPORT HAZARDS",
  ["Spills — clean immediately","Blocked exits — clear now","See something? Say something"], "#c0392b");

for(let i=-2;i<=2;i++){
  const b = new THREE.Mesh(new THREE.BoxGeometry(ROOM_W-1.5,0.32,0.32), matMetal);
  b.position.set(0,ROOM_H-0.2,i*8.5);
  root.add(b);
}
for(let i=-3;i<=3;i++){
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.25,0.25,ROOM_D-2), matMetal);
  b.position.set(i*7.5,ROOM_H-0.2,0);
  root.add(b);
}

/* ============================================================
   LIGHTING — enhanced for modern 3D look
   ============================================================ */
scene.add(new THREE.AmbientLight(0xc8d4e8,0.65));
const hemiLight = new THREE.HemisphereLight(0xe8f0ff,0x4a5568,0.5);
scene.add(hemiLight);

const lightPos = [[-16,10.2,-14],[0,10.2,-14],[16,10.2,-14],[-16,10.2,0],[0,10.2,0],[16,10.2,0],
  [-16,10.2,14],[0,10.2,14],[16,10.2,14],[-8,10.2,-7],[8,10.2,-7],[-8,10.2,7],[8,10.2,7]];
lightPos.forEach((p,i)=>{
  const l = new THREE.PointLight(0xf8fbff,2.2,38,1.3);
  l.position.set(p[0],p[1],p[2]);
  if(i%3===0){ l.castShadow = true; l.shadow.mapSize.set(512,512); l.shadow.bias = -0.001; }
  scene.add(l);
  const fix = new THREE.Mesh(new THREE.BoxGeometry(2.8,0.1,0.9), new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xb0c4de, emissiveIntensity:0.7}));
  fix.position.set(p[0],10.9,p[2]);
  root.add(fix);
});
const dirLight = new THREE.DirectionalLight(0xfff4e0,0.6);
dirLight.position.set(22,24,10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024,1024);
dirLight.shadow.camera.near = 5; dirLight.shadow.camera.far = 90;
dirLight.shadow.camera.left = -40; dirLight.shadow.camera.right = 40;
dirLight.shadow.camera.top = 40; dirLight.shadow.camera.bottom = -40;
scene.add(dirLight);

// Subtle fill light from front for better depth perception
const fillLight = new THREE.DirectionalLight(0xc0d8ff, 0.25);
fillLight.position.set(-15, 8, 20);
scene.add(fillLight);

/* ============================================================
   COLLISION HELPERS — simple explicit AABB list, matching the
   reference file's own collision approach
   ============================================================ */
const manualColliders = [];
function addCol(x,z,w,d){
  manualColliders.push({minX:x-w/2, maxX:x+w/2, minZ:z-d/2, maxZ:z+d/2});
}

/* ============================================================
   RACKING — 3x5 double row each side + 8-unit cross row
   ============================================================ */
function diagBeam(x1,y1,x2,y2,z,matUse){
  const dx = x2-x1, dy = y2-y1;
  const len = Math.sqrt(dx*dx+dy*dy);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.055,len,0.055), matUse);
  beam.position.set((x1+x2)/2, (y1+y2)/2, z);
  beam.rotation.z = Math.atan2(dx,dy);
  return beam;
}

function createShelf(x,z,rotY=0){
  const g = new THREE.Group();
  const postH = 7.9;
  for(const sx of [-1.35,1.35]) for(const sz of [-0.55,0.55]){
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.11,postH,0.11), matShelf);
    p.position.set(sx,postH/2,sz); p.castShadow = true; g.add(p);
  }
  // red diagonal cross-bracing on front and back faces, like real pallet racking
  [0.55,-0.55].forEach(sz=>{
    g.add(diagBeam(-1.35,0.35, 1.35,postH-0.35, sz, matRed));
    g.add(diagBeam(1.35,0.35, -1.35,postH-0.35, sz, matRed));
  });
  const levels = [0.05, 1.65, 3.25, 4.85, 6.45];
  levels.forEach((y, lv)=>{
    const bf = new THREE.Mesh(new THREE.BoxGeometry(2.8,0.12,0.1), matOrange);
    bf.position.set(0,y,0.6); g.add(bf);
    const bb = bf.clone(); bb.position.z = -0.6; g.add(bb);
    const plat = new THREE.Mesh(new THREE.BoxGeometry(2.7,0.07,1.2), matMetal);
    plat.position.set(0,y+0.09,0); plat.receiveShadow = true; g.add(plat);
    const count = 1 + (lv%2);
    for(let b=0; b<count; b++){
      const bx = (b-(count-1)/2)*0.95, bh = 0.5+Math.random()*0.4;
      const bx3 = cartonBox(0.8,bh,0.7);
      bx3.position.set(bx, y+0.14+bh/2, 0); bx3.castShadow = true; g.add(bx3);
    }
  });
  g.position.set(x,0,z); g.rotation.y = rotY;
  root.add(g);
  addCol(x,z,2.9,1.5);
  return g;
}
for(let r=0;r<3;r++) for(let c=0;c<5;c++){
  createShelf(-17.5+c*3.15, -15.5+r*5.4);
  createShelf(17.5-c*3.15, -15.5+r*5.4, Math.PI);
}
for(let c=0;c<8;c++) createShelf(-14+c*4, -18.8, Math.PI/2);

/* ---- HAZARD: damaged / overloaded racking (tilted bay) ---- */
const rackHazard = createShelf(10.5, 14.5);
rackHazard.rotation.z = 0.11;

/* ============================================================
   PALLETS + LOOSE BOXES (decoys)
   ============================================================ */
function pallet(x,z){
  const p = new THREE.Mesh(new THREE.BoxGeometry(1.15,0.14,0.95), matWood);
  p.position.set(x,0.07,z); p.castShadow = true; root.add(p);
  const b = cartonBox(0.95,0.75,0.75);
  b.position.set(x,0.515,z); b.castShadow = true;
  root.add(b);
  addCol(x,z,1.25,1.1);
}
[[-8,5],[-5.5,6.2],[7,4.2],[9.5,5.8],[-10,-5],[5,-8],[-3,8.5],[12,-3],[-14,8],[15,7.5],[-5,-14],[0,5.5],[-12,12],[8,12.5],[4,0]]
  .forEach(p=>pallet(p[0],p[1]));

function loose(x,z,sx,sy,sz,mat){
  const b = mat ? new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), mat) : cartonBox(sx,sy,sz);
  b.position.set(x,sy/2,z); b.castShadow = true;
  root.add(b);
  addCol(x,z,sx+0.1,sz+0.1);
}
loose(-2,4,1.05,0.85,0.85);
loose(11,2.2,0.75,0.55,0.75,matBlue);
loose(-8.5,-10,0.95,1.1,0.65,matGreen);

/* ============================================================
   FORKLIFTS — 4 total, one is the hazard (raised load, near path)
   ============================================================ */
function forklift(x,z,rotY,isHazard,id,name){
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.35,1.05,2.1), matOrange);
  body.position.y = 0.68; body.castShadow = true; g.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.15,0.95,0.95), matDark);
  cabin.position.set(0,1.55,-0.28); g.add(cabin);
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.13,2.7,0.13), matMetal);
  mast.position.set(-0.2,1.75,1.05); g.add(mast);
  const mast2 = mast.clone(); mast2.position.x = 0.45; g.add(mast2);
  const fL = new THREE.Mesh(new THREE.BoxGeometry(0.11,0.07,1.15), matMetal);
  fL.position.set(-0.22,0.38,1.65); g.add(fL);
  const fR = fL.clone(); fR.position.x = 0.22; g.add(fR);
  const wG = new THREE.CylinderGeometry(0.28,0.28,0.18,12);
  for(const wx of [-0.65,0.65]) for(const wz of [-0.75,0.75]){
    const w = new THREE.Mesh(wG, matDark);
    w.rotation.z = Math.PI/2; w.position.set(wx,0.28,wz); g.add(w);
  }
  let hasLoad = Math.random() > 0.3;
  if(isHazard) hasLoad = true;
  if(hasLoad){
    const load = cartonBox(0.95,0.65,0.85);
    load.position.set(0,0.85,1.55); g.add(load);
  }
  g.position.set(x,0,z); g.rotation.y = rotY;
  root.add(g);
  addCol(x,z,1.9,2.6);
  return g;
}
forklift(-3.5,5.5,Math.PI/4,false);
forklift(8,-6.2,-Math.PI/3,false);
forklift(0,-14.5,Math.PI,false);
{
  const fl = forklift(-10.2,10.2,Math.PI/5,true,'forklift','Forklift Near Pedestrians (Raised Load)');
  fl.children.forEach(c=>{ if(c.position.z>1.3) c.position.y += 1.15; });
  // Worker standing directly in the forklift's path (part of the hazard)
  const nearbyWorker = buildWorkerMesh(true);
  nearbyWorker.position.set(-9.0, 0, 13.2);
  nearbyWorker.rotation.y = -Math.PI/3;
  root.add(nearbyWorker);
  addCol(-9.0, 13.2, 0.65, 0.55);
}

/* ============================================================
   WORKERS — PPE hazard worker (decoy workers removed)
   ============================================================ */
function buildWorkerMesh(hasHelmet){
  const g = new THREE.Group();

  // legs: tapered cylinders (thigh wider than ankle) + small feet
  [-0.1, 0.1].forEach(lx=>{
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.075,0.095,0.62,10), matDark);
    leg.position.set(lx,0.31,0); leg.castShadow = true; g.add(leg);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.06,0.2), matDark);
    foot.position.set(lx,0.03,0.04); g.add(foot);
  });

  // hips (narrow transition between legs and torso)
  const hips = new THREE.Mesh(new THREE.CylinderGeometry(0.155,0.135,0.14,12), matDark);
  hips.position.y = 0.65; g.add(hips);

  // torso wearing the hi-vis vest (front/back/sides textured to match the reference)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42,0.56,0.25),
    [matVestSide, matVestSide, matVestTop, matVestTop, matVestFront, matVestBack]);
  torso.position.y = 1.0; torso.castShadow = true; g.add(torso);
  // rounded shoulders to soften the box's top corners
  [-0.21, 0.21].forEach(sx=>{
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.095,10,8), matVestTop);
    shoulder.position.set(sx,1.26,0); g.add(shoulder);
  });

  // neck + head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.07,0.09,10), matSkin);
  neck.position.y = 1.34; g.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.155,16,14), matSkin);
  head.position.y = 1.46; g.add(head);

  if(hasHelmet){
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.19,16,12,0,Math.PI*2,0,Math.PI/1.65), matHelmet);
    helmet.position.y = 1.565; g.add(helmet);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.205,0.205,0.03,18), matHelmet);
    brim.position.y = 1.5; g.add(brim);
  }

  // arms: tapered cylinders (bare, since the reference vest is sleeveless) + hands
  [-0.26, 0.26].forEach(ax=>{
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.07,0.46,10), matSkin);
    arm.position.set(ax,1.0,0); arm.castShadow = true; g.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.052,8,8), matSkin);
    hand.position.set(ax,0.75,0); g.add(hand);
  });

  return g;
}

function worker(x,z,rotY,isHazard,id,name){
  const g = buildWorkerMesh(!isHazard);
  g.position.set(x,0,z); g.rotation.y = rotY;
  root.add(g);
  addCol(x,z,0.65,0.55);
  return g;
}
worker(2.2,-6.2,Math.PI/6,true,'ppe','Worker Without Hard Hat / PPE');

/* ============================================================
   THE REMAINING HAZARD OBJECTS (no hitboxes — we use signs now)
   ============================================================ */

/* ---- HAZARD: oil spill / slip hazard ---- */
const spillMesh = new THREE.Mesh(new THREE.CircleGeometry(1.35,28),
  new THREE.MeshStandardMaterial({color:0x1a1a1a, roughness:0.18, metalness:0.12, transparent:true, opacity:0.88}));
spillMesh.rotation.x = -Math.PI/2;
spillMesh.position.set(-7,0.018,-3.2);
root.add(spillMesh);

/* ---- HAZARD: blocked emergency exit — flush against the west wall ---- */
{
  const g = new THREE.Group();
  const door = new THREE.Mesh(new THREE.BoxGeometry(2.1,3.1,0.14), matGreen);
  door.position.set(0,1.55,0); g.add(door);
  const b1 = cartonBox(1.4,1.15,0.95);
  b1.position.set(0.25,0.58,0.75); g.add(b1);
  const b2 = cartonBox(1.25,0.95,0.85);
  b2.position.set(-0.35,0.48,0.95); g.add(b2);
  g.position.set(-ROOM_W/2+0.2, 0, 5);
  g.rotation.y = Math.PI/2;
  root.add(g);
  addCol(-ROOM_W/2+0.2, 5, 2.4, 2.4);

  const exitSignTex = makeCanvasTexture((ctx,w,h)=>{
    ctx.fillStyle="#0e1b17"; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle="#27ae60"; ctx.lineWidth=6; ctx.strokeRect(6,6,w-12,h-12);
    ctx.fillStyle="#2ecc71"; ctx.font="bold 60px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("EXIT", w/2, h/2);
  },260,110);
  const exitSign = new THREE.Mesh(new THREE.PlaneGeometry(1.6,0.68), new THREE.MeshStandardMaterial({map:exitSignTex, emissive:0x113322, emissiveIntensity:0.4}));
  exitSign.position.set(-ROOM_W/2+0.22, 3.4, 5);
  exitSign.rotation.y = Math.PI/2;
  root.add(exitSign);
}

/* ---- HAZARD: unstable stack / falling objects ---- */
{
  const g = new THREE.Group();
  for(let i=0;i<5;i++){
    const b = cartonBox(1.05-i*0.04,0.65,0.85);
    b.position.set((i%2)*0.12, 0.33+i*0.65, (i%3)*0.08);
    b.rotation.y = i*0.07;
    g.add(b);
  }
  g.position.set(6.2,0,8.2);
  root.add(g);
  addCol(6.2,8.2,1.35,1.15);
}

/* ---- HAZARD: exposed electrical cable ---- */
{
  const g = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,0.04,0), new THREE.Vector3(1.4,0.07,0.7),
    new THREE.Vector3(2.9,0.03,-0.25), new THREE.Vector3(4.1,0.05,0.45)
  ]);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(curve,24,0.035,8,false),
    new THREE.MeshStandardMaterial({color:0x1a1a1a, roughness:0.55}));
  g.add(cable);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.07,8,8),
    new THREE.MeshStandardMaterial({color:0xffcc00, emissive:0xffaa00, emissiveIntensity:0.7}));
  spark.position.set(1.9,0.09,0.25);
  g.add(spark);
  g.position.set(4,0,-5.2);
  root.add(g);
}

/* ---- HAZARD: leaking chemical drum ---- */
{
  const g = new THREE.Group();
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,1.05,16), matBlue);
  drum.position.y = 0.53; g.add(drum);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.44,0.44,0.07,16), matMetal);
  top.position.y = 1.08; g.add(top);
  const leak = new THREE.Mesh(new THREE.CircleGeometry(0.65,16),
    new THREE.MeshStandardMaterial({color:0x2ecc71, transparent:true, opacity:0.55, roughness:0.25}));
  leak.rotation.x = -Math.PI/2; leak.position.y = 0.015; g.add(leak);
  g.position.set(-15.2,0,3.2);
  root.add(g);
  addCol(-15.2,3.2,1.15,1.15);
}

/* ---- HAZARD: blocked fire extinguisher — wall-mounted in the corner ---- */
{
  const g = new THREE.Group();
  const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.5,0.3), matMetal);
  bracket.position.set(0.05,0.95,0); g.add(bracket);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.18,0.65,12), matRed);
  body.position.y = 0.95; g.add(body);
  const noz = new THREE.Mesh(new THREE.BoxGeometry(0.07,0.07,0.22), matMetal);
  noz.position.set(-0.14,1.18,0); g.add(noz);
  const blockBox = cartonBox(0.85,0.75,0.65);
  blockBox.position.set(-0.6,0.38,0.15); g.add(blockBox);
  g.position.set(ROOM_W/2-0.3, 0, -ROOM_D/2+2.2);
  root.add(g);
  addCol(ROOM_W/2-0.3, -ROOM_D/2+2.2, 1.5, 1.2);

  const extSignTex = makeCanvasTexture((ctx,w,h)=>{
    ctx.fillStyle="#c0392b"; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle="#ffffff"; ctx.lineWidth=5; ctx.strokeRect(5,5,w-10,h-10);
    ctx.fillStyle="#ffffff"; ctx.font="bold 34px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("FIRE", w/2, h/2-22);
    ctx.fillText("EXTINGUISHER", w/2, h/2+22);
  },320,140);
  const extSign = new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.66), new THREE.MeshStandardMaterial({map:extSignTex}));
  extSign.position.set(ROOM_W/2-0.28, 1.85, -ROOM_D/2+2.2);
  extSign.rotation.y = -Math.PI/2;
  root.add(extSign);
}

/* ============================================================
   SAFETY CONES (decoys, correctly placed)
   ============================================================ */
[[-5,0.2],[3.2,-2.2],[8.2,6.2]].forEach(([x,z])=>{
  const c = new THREE.Mesh(new THREE.ConeGeometry(0.22,0.65,12), matOrange);
  c.position.set(x,0.33,z);
  root.add(c);
  addCol(x,z,0.45,0.45);
});

/* ============================================================
   3D WARNING SIGN BUILDER — yellow triangle with ! mark
   Creates a floating 3D warning sign at each hazard location
   ============================================================ */
function createWarningSign3D(x, y, z, hazardId){
  const signGroup = new THREE.Group();

  // Pole and base plate removed per request


  // Warning triangle sign — built from 3D geometry
  const triShape = new THREE.Shape();
  const s = 0.45; // half-size
  triShape.moveTo(0, s * 0.95);
  triShape.lineTo(-s * 0.85, -s * 0.55);
  triShape.lineTo(s * 0.85, -s * 0.55);
  triShape.closePath();

  // Yellow outer triangle
  const triGeo = new THREE.ExtrudeGeometry(triShape, {depth: 0.04, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3});
  const triMat = new THREE.MeshStandardMaterial({
    color: 0xFFD600, roughness: 0.3, metalness: 0.15,
    emissive: 0xFFAA00, emissiveIntensity: 0.15
  });
  const triMesh = new THREE.Mesh(triGeo, triMat);
  triMesh.position.set(0, y + 0.05, -0.02);
  triMesh.castShadow = true;
  signGroup.add(triMesh);

  // Black inner triangle border
  const innerShape = new THREE.Shape();
  const si = s * 0.7;
  innerShape.moveTo(0, si * 0.95);
  innerShape.lineTo(-si * 0.85, -si * 0.55);
  innerShape.lineTo(si * 0.85, -si * 0.55);
  innerShape.closePath();

  const borderGeo = new THREE.ExtrudeGeometry(innerShape, {depth: 0.005, bevelEnabled: false});
  const borderMat = new THREE.MeshStandardMaterial({color: 0x1a1a1a, roughness: 0.8});
  const borderMesh = new THREE.Mesh(borderGeo, borderMat);
  borderMesh.position.set(0, y + 0.05, 0.025);
  signGroup.add(borderMesh);

  // Exclamation mark — body (rectangle)
  const exclBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.065, 0.2, 0.03),
    new THREE.MeshStandardMaterial({color: 0x111111, roughness: 0.7})
  );
  exclBody.position.set(0, y + 0.12, 0.04);
  signGroup.add(exclBody);

  // Exclamation mark — dot
  const exclDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    new THREE.MeshStandardMaterial({color: 0x111111, roughness: 0.7})
  );
  exclDot.position.set(0, y - 0.08, 0.04);
  signGroup.add(exclDot);

  // Glow ring at base of sign (pulsing indicator)
  const glowRingGeo = new THREE.RingGeometry(0.25, 0.4, 24);
  const glowRingMat = new THREE.MeshBasicMaterial({
    color: 0xFFD600, transparent: true, opacity: 0.35,
    side: THREE.DoubleSide
  });
  const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
  glowRing.rotation.x = -Math.PI/2;
  glowRing.position.y = 0.02;
  signGroup.add(glowRing);

  // Point light for glow effect
  const signLight = new THREE.PointLight(0xFFD600, 0.8, 4, 2);
  signLight.position.set(0, y + 0.15, 0.1);
  signGroup.add(signLight);

  signGroup.position.set(x, 0, z);
  root.add(signGroup);

  // Invisible clickable hitbox
  const hitbox = box(0.9, y + 0.7, 0.9, 0xffffff,
    new THREE.Vector3(x, (y+0.7)/2, z), 0, {visible: false});
  hitbox.userData = {type:'warningSign', id: hazardId};
  root.add(hitbox);

  return {group: signGroup, hitbox, glowRing, signLight, triMesh, baseY: y};
}

/* ============================================================
   HAZARD DEFINITIONS + QUIZ QUESTIONS
   ============================================================ */
const HAZARD_DATA = [
  {
    id: 'spill',
    label: 'Oil Spill / Slip Hazard',
    pos: [-7, 1.5, -3.2],
    info: "An oil slick on the floor in a high-traffic aisle. Slip hazards cause thousands of workplace injuries every year.",
    question: "You spot a small oil spill in a busy aisle. What's the safest first action?",
    options: [
      "Walk around it and keep working",
      "Mark it with a cone and clean it up immediately",
      "Wait for someone else to notice it",
      "Cover it with a cardboard box"
    ],
    correct: 1,
    explain: "Slip hazards should be marked and cleaned up right away — walking around it just leaves it for the next person."
  },
  {
    id: 'exit',
    label: 'Blocked Emergency Exit',
    pos: [-ROOM_W/2+1.5, 1.5, 5],
    info: "Boxes are blocking the emergency exit door. In a fire or evacuation, a blocked exit can trap workers inside.",
    question: "A fire exit has boxes stacked in front of it. What should you do?",
    options: [
      "Leave it, it's probably a short-term delivery",
      "Move the boxes and keep the exit clear at all times",
      "Only worry about it during a fire drill",
      "Report it at the end of the week"
    ],
    correct: 1,
    explain: "Emergency exits must stay clear at all times — in a real emergency, seconds matter."
  },
  {
    id: 'stack',
    label: 'Unstable Stack / Falling Objects',
    pos: [6.2, 1.5, 8.2],
    info: "A tall pile of boxes is leaning dangerously. Falling objects from unstable stacks are a leading cause of warehouse injuries.",
    question: "What's the main danger of a tall, unstable stack of boxes?",
    options: [
      "It looks untidy",
      "Boxes can topple and fall on nearby workers",
      "It slows down stock counts",
      "It blocks the view of the clock"
    ],
    correct: 1,
    explain: "Unstable stacks can topple suddenly, causing serious injury to anyone nearby."
  },
  {
    id: 'cable',
    label: 'Exposed Electrical Cable',
    pos: [6.0, 1.2, -4.9],
    info: "A frayed electrical cord runs across the floor. Exposed wiring risks electric shock and can ignite flammable materials.",
    question: "An extension cord powering equipment looks frayed and worn. What's the risk?",
    options: [
      "No real risk if the equipment still works",
      "Electric shock or fire hazard",
      "It only affects the equipment's warranty",
      "It will just slow the equipment down"
    ],
    correct: 1,
    explain: "Damaged cords can cause electric shock or start a fire — they should be taken out of service and replaced."
  },
  {
    id: 'rack',
    label: 'Damaged / Overloaded Racking',
    pos: [10.5, 1.5, 14.5],
    info: "The racking shelf is visibly bent and overloaded with stock. Racking collapse can cause catastrophic injuries.",
    question: "What's the main danger of an overloaded or leaning racking shelf?",
    options: [
      "It looks untidy",
      "It can collapse or drop stock onto people below",
      "It slows down stock counts",
      "It voids the warehouse insurance instantly"
    ],
    correct: 1,
    explain: "Overloaded or damaged racking can fail suddenly, causing falling stock or a full collapse — a serious injury risk."
  },
  {
    id: 'forklift',
    label: 'Forklift Near Pedestrians (Raised Load)',
    pos: [-10.2, 1.5, 10.2],
    info: "A forklift is operating with a raised load near walking workers. Pedestrian-forklift collisions are often fatal.",
    question: "You see a forklift operating nearby with a raised load, close to walking workers. What's the safest behavior?",
    options: [
      "Walk underneath the load to save time",
      "Keep well clear and make eye contact with the operator before crossing its path",
      "Assume the operator has already seen you",
      "Wave and keep walking at the same pace"
    ],
    correct: 1,
    explain: "Never walk under a raised load, and always confirm the operator has seen you before crossing a forklift's path."
  },
  {
    id: 'chemical',
    label: 'Leaking Chemical Drum',
    pos: [-15.2, 1.5, 3.2],
    info: "A chemical drum has a visible leak pooling on the floor. Unknown chemicals can cause burns, toxic fumes, or fire.",
    question: "You notice a chemical drum that appears to be leaking. What's the correct response?",
    options: [
      "Wipe it up with a rag and continue",
      "Report it immediately and keep others away from the area",
      "Ignore it if it's a small amount",
      "Move the drum yourself to a different aisle"
    ],
    correct: 1,
    explain: "Leaking chemicals can be hazardous to health — report it and keep the area clear rather than handling it yourself."
  },
  {
    id: 'ppe',
    label: 'Worker Without Hard Hat / PPE',
    pos: [2.2, 1.5, -6.2],
    info: "A worker in a mandatory PPE zone has no hard hat. Falling objects from racking above make head protection essential.",
    question: "A worker on the floor isn't wearing a hard hat in a marked PPE zone. What should happen?",
    options: [
      "Nothing, hard hats are optional if you're careful",
      "They should be reminded to wear required PPE before continuing work",
      "Only visitors need to wear hard hats",
      "It's fine as long as no racking is nearby"
    ],
    correct: 1,
    explain: "PPE requirements apply to everyone in a marked zone — hard hats protect against falling objects, which is a real risk near racking."
  },
  {
    id: 'ext',
    label: 'Blocked Fire Extinguisher',
    pos: [ROOM_W/2-1.5, 1.5, -ROOM_D/2+2.2],
    info: "The fire extinguisher is buried behind stacked boxes. In a fire, every second spent reaching it lets the blaze grow.",
    question: "A fire extinguisher is blocked by stacked boxes. Why does this matter?",
    options: [
      "It doesn't — extinguishers are rarely needed",
      "In an emergency, it could cost critical time to reach and use it",
      "It only matters if the boxes are flammable",
      "Fire extinguishers don't expire so it's not urgent"
    ],
    correct: 1,
    explain: "Fire extinguishers need to be immediately accessible — a blocked one could make a small fire much worse."
  }
];

/* ============================================================
   CREATE ALL WARNING SIGNS
   ============================================================ */
const warningSigns = {};
const clickable = [];

HAZARD_DATA.forEach(h => {
  const sign = createWarningSign3D(h.pos[0], h.pos[1], h.pos[2], h.id);
  warningSigns[h.id] = sign;
  clickable.push(sign.hitbox);
});

/* ============================================================
   GAME STATE
   ============================================================ */
let score = 0, found = new Set(), wrongAnswers = 0, startTime = null, gameActive = false;
let quizOpen = false;
let currentQuizHazard = null;

// Streak multiplier
let streak = 0;

// Quiz timer
const QUIZ_TIME_LIMIT = 18; // seconds
const SPEED_BONUS_THRESHOLD = 5; // seconds for speed bonus
const SPEED_BONUS_POINTS = 3;
let quizTimerInterval = null;
let quizTimeRemaining = 0;
let quizStartedAt = 0;

// Overall game countdown (4 min 30 sec)
const GAME_TIME_LIMIT = 270; // seconds
let gameTimeRemaining = GAME_TIME_LIMIT;
let gamePausedForQuiz = false;

// Near-miss penalty
const ACTIVE_HAZARDS = ['forklift', 'cable', 'chemical'];
const NEAR_MISS_RADIUS = 1.2;
const NEAR_MISS_PENALTY = 3;
const NEAR_MISS_COOLDOWN = 3; // seconds
const nearMissCooldowns = {};

const scoreVal = document.getElementById('scoreVal');
const foundVal = document.getElementById('foundVal');
const timeVal = document.getElementById('timeVal');
const toast = document.getElementById('toast');
const scoreEl = document.getElementById('score');
const timeBadge = timeVal ? timeVal.closest('.badge') : null;

// Streak HUD
const streakBadge = document.getElementById('streakBadge');
const streakVal = document.getElementById('streakVal');

// Quiz modal elements
const quizModal = document.getElementById('quizModal');
const quizModalTitle = document.getElementById('quizModalTitle');
const quizModalQuestion = document.getElementById('quizModalQuestion');
const quizModalOptions = document.getElementById('quizModalOptions');
const quizModalFeedback = document.getElementById('quizModalFeedback');
const quizModalScoreEl = document.getElementById('quizModalScore');
const quizModalCloseBtn = document.getElementById('quizModalClose');
const quizTimerFill = document.getElementById('quizTimerFill');
const quizTimerText = document.getElementById('quizTimerText');

// Info modal elements
const infoModal = document.getElementById('infoModal');
const infoModalTitle = document.getElementById('infoModalTitle');
const infoModalDesc = document.getElementById('infoModalDesc');
const infoModalStartQuiz = document.getElementById('infoModalStartQuiz');

function fmtTime(ms){
  const s = Math.floor(ms/1000);
  const m = Math.floor(s/60);
  const ss = s%60;
  return String(m).padStart(2,'0')+':'+String(ss).padStart(2,'0');
}

function fmtCountdown(secs){
  const m = Math.floor(secs/60);
  const s = Math.floor(secs%60);
  return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}

function updateHud(){
  scoreVal.textContent = score;
  foundVal.textContent = found.size + ' / ' + HAZARD_DATA.length;
  quizModalScoreEl.textContent = score;

  // Streak badge
  if(streakBadge){
    if(streak >= 2){
      streakBadge.style.display = '';
      streakVal.textContent = '🔥 ' + streak;
      streakBadge.classList.remove('pulse');
      void streakBadge.offsetWidth;
      streakBadge.classList.add('pulse');
    } else {
      streakBadge.style.display = 'none';
    }
  }
}

function showToast(text, cls){
  toast.textContent = text;
  toast.className = 'show ' + cls;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>{ toast.className = ''; }, 900);
}

function flashScore(cls){
  scoreEl.classList.remove('flashGood','flashBad');
  void scoreEl.offsetWidth;
  scoreEl.classList.add(cls);
  setTimeout(()=>scoreEl.classList.remove(cls), 400);
}

/* ============================================================
   INFO CARD MODAL — shows hazard info before quiz starts
   ============================================================ */
let pendingQuizHazardId = null;

function openInfoCard(hazardId){
  if(quizOpen || found.has(hazardId)) return;
  quizOpen = true; // block movement/clicks
  gamePausedForQuiz = true;
  pendingQuizHazardId = hazardId;

  const hazard = HAZARD_DATA.find(h => h.id === hazardId);
  if(!hazard) return;

  infoModalTitle.textContent = '⚠️ ' + hazard.label;
  infoModalDesc.textContent = hazard.info || '';
  infoModal.classList.remove('hidden');
  wrap.style.pointerEvents = 'none';
}

function closeInfoCard(){
  infoModal.classList.add('hidden');
}

infoModalStartQuiz.addEventListener('click', () => {
  const hid = pendingQuizHazardId;
  closeInfoCard();
  // quizOpen stays true — openQuiz skips the guard since we pass force flag
  quizOpen = false; // briefly unset so openQuiz's guard passes
  openQuiz(hid);
});

/* ============================================================
   QUIZ MODAL SYSTEM (with timer + streak)
   ============================================================ */
function startQuizTimer(hazard){
  quizTimeRemaining = QUIZ_TIME_LIMIT;
  quizStartedAt = Date.now();
  if(quizTimerFill) quizTimerFill.style.width = '100%';
  if(quizTimerFill) quizTimerFill.className = '';
  if(quizTimerText) quizTimerText.textContent = QUIZ_TIME_LIMIT + 's';

  clearInterval(quizTimerInterval);
  quizTimerInterval = setInterval(() => {
    const elapsed = (Date.now() - quizStartedAt) / 1000;
    quizTimeRemaining = Math.max(0, QUIZ_TIME_LIMIT - elapsed);
    const pct = (quizTimeRemaining / QUIZ_TIME_LIMIT) * 100;

    if(quizTimerFill){
      quizTimerFill.style.width = pct + '%';
      if(quizTimeRemaining <= 5) quizTimerFill.className = 'critical';
      else if(quizTimeRemaining <= 10) quizTimerFill.className = 'warn';
      else quizTimerFill.className = '';
    }
    if(quizTimerText) quizTimerText.textContent = Math.ceil(quizTimeRemaining) + 's';

    if(quizTimeRemaining <= 0){
      clearInterval(quizTimerInterval);
      quizTimedOut(hazard);
    }
  }, 100);
}

function stopQuizTimer(){
  clearInterval(quizTimerInterval);
  quizTimerInterval = null;
}

function openQuiz(hazardId){
  if(quizOpen || found.has(hazardId)) return;
  quizOpen = true;
  gamePausedForQuiz = true;
  currentQuizHazard = hazardId;

  const hazard = HAZARD_DATA.find(h => h.id === hazardId);
  if(!hazard) return;

  quizModalTitle.textContent = '⚠️ ' + hazard.label;
  quizModalQuestion.textContent = hazard.question;
  quizModalFeedback.classList.add('hidden');
  quizModalFeedback.className = 'quizModalFeedback hidden';
  quizModalCloseBtn.classList.add('hidden');
  quizModalOptions.innerHTML = '';

  hazard.options.forEach((optText, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quizModalOpt';
    btn.textContent = optText;
    btn.addEventListener('click', () => selectQuizAnswer(idx, btn, hazard));
    quizModalOptions.appendChild(btn);
  });

  quizModal.classList.remove('hidden');
  wrap.style.pointerEvents = 'none';

  // Start the per-question timer
  startQuizTimer(hazard);
}

function selectQuizAnswer(idx, btnEl, hazard){
  stopQuizTimer();

  const allBtns = quizModalOptions.querySelectorAll('.quizModalOpt');
  allBtns.forEach(b => b.classList.add('disabledOpt'));

  const elapsed = (Date.now() - quizStartedAt) / 1000;

  if(idx === hazard.correct){
    // CORRECT — streak multiplier scoring
    streak++;
    let points = 10;
    if(streak >= 5) points = 20;
    else if(streak >= 3) points = 15;

    // Speed bonus
    let speedBonus = 0;
    if(elapsed <= SPEED_BONUS_THRESHOLD){
      speedBonus = SPEED_BONUS_POINTS;
    }

    score += points + speedBonus;
    btnEl.classList.add('correct');
    flashScore('flashGood');

    let toastMsg = '+' + points;
    if(speedBonus > 0) toastMsg += ' +' + speedBonus + '⚡';
    if(streak >= 3) toastMsg += ' 🔥x' + streak;
    toastMsg += ' · ' + hazard.label;
    showToast(toastMsg, streak >= 3 ? 'streak' : 'good');

    quizModalFeedback.className = 'quizModalFeedback good';
    quizModalFeedback.textContent = '✔ Correct — ' + hazard.explain;

    found.add(hazard.id);
    markSignResolved(hazard.id, true);
  } else {
    // WRONG
    streak = 0;
    wrongAnswers++;
    btnEl.classList.add('wrong');
    allBtns[hazard.correct].classList.add('correct');
    score -= 5;
    flashScore('flashBad');
    showToast('-5 · Wrong answer', 'bad');
    quizModalFeedback.className = 'quizModalFeedback bad';
    quizModalFeedback.textContent = '✘ Not quite — ' + hazard.explain;

    found.add(hazard.id);
    markSignResolved(hazard.id, false);
  }

  quizModalFeedback.classList.remove('hidden');
  quizModalCloseBtn.classList.remove('hidden');
  updateHud();
}

function quizTimedOut(hazard){
  // Same outcome as wrong answer
  streak = 0;
  wrongAnswers++;
  score -= 5;
  flashScore('flashBad');
  showToast('⏰ Time\'s up! −5', 'bad');

  const allBtns = quizModalOptions.querySelectorAll('.quizModalOpt');
  allBtns.forEach(b => b.classList.add('disabledOpt'));
  allBtns[hazard.correct].classList.add('correct');

  quizModalFeedback.className = 'quizModalFeedback bad';
  quizModalFeedback.textContent = '⏰ Time ran out — ' + hazard.explain;
  quizModalFeedback.classList.remove('hidden');
  quizModalCloseBtn.classList.remove('hidden');

  found.add(hazard.id);
  markSignResolved(hazard.id, false);
  updateHud();
}

function closeQuiz(){
  stopQuizTimer();
  quizModal.classList.add('hidden');
  quizOpen = false;
  gamePausedForQuiz = false;
  currentQuizHazard = null;
  wrap.style.pointerEvents = '';

  if(found.size >= HAZARD_DATA.length){
    setTimeout(()=> endGame(), 600);
  }
}

quizModalCloseBtn.addEventListener('click', closeQuiz);

/* ============================================================
   SIGN VISUAL FEEDBACK — green (correct) or red (wrong) after answer
   ============================================================ */
function markSignResolved(hazardId, wasCorrect){
  const sign = warningSigns[hazardId];
  if(!sign) return;

  const color = wasCorrect ? 0x5be89a : 0xff5d5d;

  // Change triangle color
  if(sign.triMesh && sign.triMesh.material){
    sign.triMesh.material.color.setHex(color);
    sign.triMesh.material.emissive.setHex(wasCorrect ? 0x2a7a4a : 0x7a2a2a);
    sign.triMesh.material.emissiveIntensity = 0.3;
  }

  // Change glow
  if(sign.glowRing && sign.glowRing.material){
    sign.glowRing.material.color.setHex(color);
    sign.glowRing.material.opacity = 0.5;
  }

  // Change point light
  if(sign.signLight){
    sign.signLight.color.setHex(color);
    sign.signLight.intensity = 1.2;
  }

  // Remove from clickable
  const idx = clickable.indexOf(sign.hitbox);
  if(idx >= 0) clickable.splice(idx, 1);
}

/* ============================================================
   LOOK CONTROLS (drag to rotate, mimics a 360 viewer)
   ============================================================ */
let yaw = 0, pitch = 0;
let isDragging = false, lastX=0, lastY=0;
let dragDistance = 0;

let yawTarget = 0, pitchTarget = 0;
function getSens() { return parseFloat(localStorage.getItem('hh_sens') || '1.0'); }

function onPointerDown(x,y){
  if(quizOpen) return;
  isDragging = true; lastX = x; lastY = y; dragDistance = 0;
  wrap.classList.add('dragging');
}
function onPointerMove(x,y){
  if(!isDragging || quizOpen) return;
  const dx = x - lastX, dy = y - lastY;
  dragDistance += Math.abs(dx) + Math.abs(dy);
  const sens = getSens();
  yaw -= dx * 0.0035 * sens;
  pitch -= dy * 0.0035 * sens;
  pitch = Math.max(-1.2, Math.min(1.2, pitch));
  yawTarget = yaw; pitchTarget = pitch;
  lastX = x; lastY = y;
}
function onPointerUp(x,y){
  isDragging = false;
  wrap.classList.remove('dragging');
  if(dragDistance < 6 && !quizOpen){
    handleClick(x,y);
  }
}

wrap.addEventListener('mousedown', e=>onPointerDown(e.clientX,e.clientY));
window.addEventListener('mousemove', e=>onPointerMove(e.clientX,e.clientY));
window.addEventListener('mouseup', e=>onPointerUp(e.clientX,e.clientY));
wrap.addEventListener('touchstart', e=>{const t=e.touches[0]; onPointerDown(t.clientX,t.clientY);}, {passive:true});
window.addEventListener('touchmove', e=>{const t=e.touches[0]; onPointerMove(t.clientX,t.clientY);}, {passive:true});
window.addEventListener('touchend', e=>{const t=e.changedTouches[0]; onPointerUp(t.clientX,t.clientY);});

/* Trackpad / mouse-wheel look — scroll to turn, no click needed. */
wrap.addEventListener('wheel', e=>{
  if(quizOpen) return;
  e.preventDefault();
  const sens = getSens();
  yawTarget -= e.deltaX * 0.0022 * sens;
  pitchTarget -= e.deltaY * 0.0022 * sens;
  pitchTarget = Math.max(-1.2, Math.min(1.2, pitchTarget));
}, {passive:false});

/* hover cursor feedback */
const crosshair = document.getElementById('crosshair');
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();

function handleClick(px,py){
  if(!gameActive || quizOpen) return;
  ndc.x = (px/window.innerWidth)*2 - 1;
  ndc.y = -(py/window.innerHeight)*2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(clickable, false);
  if(hits.length === 0) return;
  const obj = hits[0].object;
  const data = obj.userData;
  if(data.type === 'warningSign'){
    openInfoCard(data.id);
  }
}

/* ============================================================
   KEYBOARD MOVEMENT (WASD + Arrow keys)
   ============================================================ */
const keyState = {};
window.addEventListener('keydown', e=>{
  keyState[e.code] = true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', e=>{ keyState[e.code] = false; });

const MOVE_SPEED = 5.5;      // meters per second
const PLAYER_RADIUS = 0.32;
const WALL_MARGIN = 0.4;

// Build accurate axis-aligned bounding boxes
const collisionMeshes = [];
const obstacleBoxes = collisionMeshes.map(g=>{
  const b = new THREE.Box3().setFromObject(g);
  return { minX: b.min.x, maxX: b.max.x, minZ: b.min.z, maxZ: b.max.z };
}).concat(manualColliders);

let lastFrameTime = performance.now();

function resolveCollisions(nx, nz){
  for(const b of obstacleBoxes){
    const cx = Math.max(b.minX, Math.min(nx, b.maxX));
    const cz = Math.max(b.minZ, Math.min(nz, b.maxZ));
    const dx = nx - cx, dz = nz - cz;
    const dist = Math.hypot(dx, dz);
    if(dist < PLAYER_RADIUS){
      if(dist > 0.0001){
        const push = PLAYER_RADIUS - dist;
        nx += (dx/dist)*push;
        nz += (dz/dist)*push;
      } else {
        const toLeft = nx - b.minX, toRight = b.maxX - nx;
        const toTop = nz - b.minZ, toBottom = b.maxZ - nz;
        const minPen = Math.min(toLeft, toRight, toTop, toBottom);
        if(minPen === toLeft) nx = b.minX - PLAYER_RADIUS;
        else if(minPen === toRight) nx = b.maxX + PLAYER_RADIUS;
        else if(minPen === toTop) nz = b.minZ - PLAYER_RADIUS;
        else nz = b.maxZ + PLAYER_RADIUS;
      }
    }
  }
  return {x:nx, z:nz};
}

function updateMovement(dt){
  if(!gameActive || quizOpen) return;
  const forwardPressed = keyState['ArrowUp'] || keyState['KeyW'];
  const backPressed = keyState['ArrowDown'] || keyState['KeyS'];
  const leftPressed = keyState['ArrowLeft'] || keyState['KeyA'];
  const rightPressed = keyState['ArrowRight'] || keyState['KeyD'];
  if(!forwardPressed && !backPressed && !leftPressed && !rightPressed) return;

  const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
  const rx = Math.cos(yaw), rz = -Math.sin(yaw);

  let mx = 0, mz = 0;
  if(forwardPressed){ mx += fx; mz += fz; }
  if(backPressed){ mx -= fx; mz -= fz; }
  if(rightPressed){ mx += rx; mz += rz; }
  if(leftPressed){ mx -= rx; mz -= rz; }

  const len = Math.hypot(mx,mz);
  if(len > 0){ mx/=len; mz/=len; }

  let nx = camera.position.x + mx*MOVE_SPEED*dt;
  let nz = camera.position.z + mz*MOVE_SPEED*dt;

  const halfW = ROOM_W/2 - WALL_MARGIN, halfD = ROOM_D/2 - WALL_MARGIN;
  nx = Math.max(-halfW, Math.min(halfW, nx));
  nz = Math.max(-halfD, Math.min(halfD, nz));

  const resolved = resolveCollisions(nx, nz);
  nx = resolved.x; nz = resolved.z;

  camera.position.x = nx;
  camera.position.z = nz;
}

/* ============================================================
   NEAR-MISS PENALTY CHECK
   ============================================================ */
function checkNearMiss(dt){
  if(!gameActive || quizOpen) return;
  ACTIVE_HAZARDS.forEach(hid => {
    if(found.has(hid)) return;
    // Manage cooldowns
    if(nearMissCooldowns[hid] && nearMissCooldowns[hid] > 0){
      nearMissCooldowns[hid] -= dt;
      return;
    }
    const hazard = HAZARD_DATA.find(h => h.id === hid);
    if(!hazard) return;
    const dx = camera.position.x - hazard.pos[0];
    const dz = camera.position.z - hazard.pos[2];
    const dist = Math.hypot(dx, dz);
    if(dist < NEAR_MISS_RADIUS){
      score -= NEAR_MISS_PENALTY;
      streak = 0;
      flashScore('flashBad');
      showToast('⚠️ Too close! Report this hazard first!', 'bad');
      nearMissCooldowns[hid] = NEAR_MISS_COOLDOWN;
      updateHud();
    }
  });
}

/* ============================================================
   PATROL FORKLIFT
   ============================================================ */
const patrolFL = forklift(0, -12, 0, false);
// Remove the static collider that forklift() added — we use a dynamic one instead
manualColliders.pop();
// Remove the carton box load from the patrol forklift
patrolFL.children.forEach(c => {
  if(c.position.y > 0.7 && c.position.z > 1.2) patrolFL.remove(c);
});
const PATROL_PATH = [{x: -8, z: -12}, {x: 8, z: -12}];
const PATROL_SPEED = 2.0;
let patrolTarget = 1;
let patrolX = PATROL_PATH[0].x;
let patrolZ = PATROL_PATH[0].z;
const patrolCollider = {minX: patrolX - 1.2, maxX: patrolX + 1.2, minZ: patrolZ - 0.8, maxZ: patrolZ + 0.8};
obstacleBoxes.push(patrolCollider);
let patrolHitCooldown = 0;

function updatePatrol(dt){
  if(!gameActive) return;
  const target = PATROL_PATH[patrolTarget];
  const dx = target.x - patrolX;
  const dz = target.z - patrolZ;
  const dist = Math.hypot(dx, dz);

  if(dist < 0.2){
    patrolTarget = patrolTarget === 0 ? 1 : 0;
  } else {
    const nx = dx / dist, nz = dz / dist;
    patrolX += nx * PATROL_SPEED * dt;
    patrolZ += nz * PATROL_SPEED * dt;
  }

  // Update mesh position
  patrolFL.position.x = patrolX;
  patrolFL.position.z = patrolZ;
  patrolFL.rotation.y = Math.atan2(dx, dz);

  // Update collider
  patrolCollider.minX = patrolX - 1.2;
  patrolCollider.maxX = patrolX + 1.2;
  patrolCollider.minZ = patrolZ - 0.8;
  patrolCollider.maxZ = patrolZ + 0.8;

  // Near-miss check for patrol forklift
  if(patrolHitCooldown > 0){
    patrolHitCooldown -= dt;
  } else {
    const pdx = camera.position.x - patrolX;
    const pdz = camera.position.z - patrolZ;
    if(Math.hypot(pdx, pdz) < 1.5){
      score -= 5;
      streak = 0;
      flashScore('flashBad');
      showToast('🚨 Hit by forklift! −5', 'bad');
      patrolHitCooldown = 5;
      updateHud();
    }
  }
}

/* ============================================================
   RENDER LOOP — with sign animation, game countdown, near-miss
   ============================================================ */
let animTime = 0;

function animate(){
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastFrameTime)/1000);
  lastFrameTime = now;
  animTime += dt;

  camera.rotation.order = 'YXZ';
  yaw += (yawTarget - yaw) * Math.min(1, dt*10);
  pitch += (pitchTarget - pitch) * Math.min(1, dt*10);
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  updateMovement(dt);

  // Overall game countdown (pause during quiz and settings)
  if(gameActive && !gamePausedForQuiz){
    gameTimeRemaining -= dt;
    if(gameTimeRemaining <= 0){
      gameTimeRemaining = 0;
      sessionStorage.setItem('hh_timeout', '1');
      endGame();
      return;
    }
  }

  // Update time display (countdown)
  if(gameActive){
    timeVal.textContent = fmtCountdown(gameTimeRemaining);

    // Time urgency visuals
    if(timeBadge){
      timeBadge.classList.remove('timeWarn', 'timeCritical');
      if(gameTimeRemaining < 30) timeBadge.classList.add('timeCritical');
      else if(gameTimeRemaining < 60) timeBadge.classList.add('timeWarn');
    }
  }

  // Near-miss penalty checks
  checkNearMiss(dt);

  // Patrol forklift
  updatePatrol(dt);

  // Animate warning signs — bob + glow pulse
  Object.keys(warningSigns).forEach(id => {
    if(found.has(id)) return;
    const sign = warningSigns[id];
    sign.group.position.y = Math.sin(animTime * 2 + id.length) * 0.08;

    if(sign.glowRing){
      sign.glowRing.material.opacity = 0.2 + Math.sin(animTime * 3 + id.length * 0.5) * 0.15;
      sign.glowRing.scale.setScalar(1 + Math.sin(animTime * 2.5) * 0.15);
    }

    if(sign.signLight){
      sign.signLight.intensity = 0.6 + Math.sin(animTime * 3) * 0.3;
    }

    const dx = camera.position.x - sign.group.position.x;
    const dz = camera.position.z - sign.group.position.z;
    sign.group.rotation.y = Math.atan2(dx, dz);
  });

  // hover highlight for crosshair
  if(!quizOpen){
    ndc.x = 0; ndc.y = 0;
    raycaster.setFromCamera(ndc, camera);
    const hoverHits = raycaster.intersectObjects(clickable, false);
    crosshair.classList.toggle('hover', hoverHits.length>0);
  }

  renderer.render(scene, camera);
}

/* ============================================================
   GAME FLOW
   ============================================================ */
const hud = document.getElementById('hud');

function startGame(){
  hud.classList.remove('hidden');
  score = 0; found = new Set(); wrongAnswers = 0;
  streak = 0;
  gameTimeRemaining = GAME_TIME_LIMIT;
  gamePausedForQuiz = false;
  Object.keys(nearMissCooldowns).forEach(k => delete nearMissCooldowns[k]);
  sessionStorage.removeItem('hh_timeout');
  updateHud();
  camera.position.set(0, 1.65, 16);
  yaw = 0; pitch = 0;
  startTime = Date.now();
  gameActive = true;
}

function endGame(){
  gameActive = false;
  stopQuizTimer();
  const finalTime = fmtTime(Date.now()-startTime);
  sessionStorage.setItem('hh_score', String(score));
  sessionStorage.setItem('hh_time', finalTime);
  sessionStorage.setItem('hh_wrong', String(wrongAnswers));
  sessionStorage.setItem('hh_found', String(found.size));
  if(!sessionStorage.getItem('hh_timeout')){
    sessionStorage.setItem('hh_timeout', '0');
  }
  setTimeout(()=>{ window.location.href = 'end.html'; }, 900);
}

/* ============================================================
   SETTINGS MODAL
   ============================================================ */
const settingsModal = document.getElementById('settingsModal');
const settingsBtnGame = document.getElementById('settingsBtnGame');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const quitBtnGame = document.getElementById('quitBtnGame');
const sensSlider = document.getElementById('sensSlider');
let wasGameActiveBeforeSettings = false;

if(settingsBtnGame) {
  settingsBtnGame.addEventListener('click', () => {
    wasGameActiveBeforeSettings = gameActive;
    gameActive = false; // pause game movement
    gamePausedForQuiz = true; // pause game countdown
    sensSlider.value = localStorage.getItem('hh_sens') || '1.0';
    settingsModal.classList.remove('hidden');
    wrap.style.pointerEvents = 'none';
  });
}

if(closeSettingsBtn) {
  closeSettingsBtn.addEventListener('click', () => {
    localStorage.setItem('hh_sens', sensSlider.value);
    settingsModal.classList.add('hidden');
    wrap.style.pointerEvents = '';
    gamePausedForQuiz = false;
    if(wasGameActiveBeforeSettings) gameActive = true;
  });
}

if(quitBtnGame) {
  quitBtnGame.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

/* ============================================================
   BOOT
   ============================================================ */
window.addEventListener('load', ()=>{
  setTimeout(()=>{
    document.getElementById('loading').classList.add('hidden');
    startGame();
  }, 300);
});
animate();

})();
