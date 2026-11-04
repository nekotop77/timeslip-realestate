import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const size = 620;
const canvas = document.getElementById('house3d');
const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
r.setPixelRatio(2); r.setSize(size, size, false);
r.setClearColor(0x000000, 0);
r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
r.toneMapping = THREE.LinearToneMapping; r.toneMappingExposure = .78;
r.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(24, 1, .1, 100);
cam.position.set(11.6, 8.2, 13.8); cam.lookAt(0, 1.7, 0);

const mat = (color, roughness = .75, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
const wall = mat(0xf1f3f1, .85), trim = mat(0xffffff, .6), roofM = mat(0x12c653, .5), roofDark = mat(0x0b8a39, .6);
const glass = mat(0xffd9a0, .35, { emissive: 0xffb45e, emissiveIntensity: 1.1 });
const doorM = mat(0x17331f, .5), base = mat(0x2a2d2b, .9), chim = mat(0xd9dcda, .85);
const add = (geo, m, x = 0, y = 0, z = 0, parent = scene) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
const box = (w, h, d, m, x, y, z, parent) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, parent);

const W = 4, D = 3.4, H = 2.3, R = 1.55;
// 기단
box(W + .55, .18, D + .55, base, 0, .09, 0);
// 벽체: 오각형 단면을 깊이 방향으로 돌출
const s = new THREE.Shape();
s.moveTo(-W / 2, 0); s.lineTo(W / 2, 0); s.lineTo(W / 2, H); s.lineTo(0, H + R); s.lineTo(-W / 2, H); s.closePath();
const body = add(new THREE.ExtrudeGeometry(s, { depth: D, bevelEnabled: false }), wall, 0, .18, -D / 2);
// 지붕
const ang = Math.atan2(R, W / 2), len = Math.hypot(W / 2, R) + .42, th = .17, rd = D + .62;
for (const side of [-1, 1]) {
  const g = new THREE.Group(); g.position.set(side * W / 4, .18 + H + R / 2, 0); g.rotation.z = -side * ang; scene.add(g);
  const off = .12;
  box(len, th, rd, roofM, side * (.21 - .0), off, 0, g);
  box(len, .05, rd + .04, roofDark, side * .21, off - th / 2 - .02, 0, g);
}
box(.24, .16, rd + .02, roofDark, 0, .18 + H + R + .13, 0);
// 굴뚝
box(.46, 1.05, .46, chim, 1.05, 3.65, -.65);
box(.56, .12, .56, trim, 1.05, 4.2, -.65);
// 앞면 현관
const fz = D / 2 + .012;
box(.92, 1.55, .08, trim, -.72, .95, fz);
box(.76, 1.42, .1, doorM, -.72, .91, fz + .012);
add(new THREE.SphereGeometry(.045, 16, 12), mat(0xe8c26a, .3), -.47, .92, fz + .08);
box(1.2, .1, .5, base, -.72, .23, fz + .28);
// 창문
const win = (x, y, z, w, h, axis) => {
  const fw = axis === 'z' ? [w + .16, h + .16, .07] : [.07, h + .16, w + .16];
  const pw = axis === 'z' ? [w, h, .09] : [.09, w === 0 ? h : h, w];
  box(...fw, trim, x, y, z);
  box(axis === 'z' ? w : .09, h, axis === 'z' ? .09 : w, glass, x, y, z);
  box(axis === 'z' ? .045 : .11, h, axis === 'z' ? .11 : .045, trim, x, y, z);
  box(axis === 'z' ? w : .11, .045, axis === 'z' ? .11 : w, trim, x, y, z);
};
win(.8, 1.4, fz, .95, .95, 'z');
const fx = W / 2 + .012;
win(fx, 1.4, -.8, .85, .95, 'x');
win(fx, 1.4, .8, .85, .95, 'x');
// 박공 원형 창
const rg = add(new THREE.CylinderGeometry(.27, .27, .07, 40), trim, 0, 3.1, fz); rg.rotation.x = Math.PI / 2;
const rp = add(new THREE.CylinderGeometry(.2, .2, .09, 40), glass, 0, 3.1, fz + .005); rp.rotation.x = Math.PI / 2;
// 나무
const tree = (x, z, h) => {
  add(new THREE.CylinderGeometry(.07, .09, h * .4, 14), mat(0x6b4a2f, .9), x, .18 + h * .2, z);
  add(new THREE.SphereGeometry(h * .36, 28, 22), mat(0x15a84b, .8), x, .18 + h * .62, z);
  add(new THREE.SphereGeometry(h * .25, 24, 18), mat(0x24c95f, .8), x + h * .1, .18 + h * .82, z + h * .08);
};
tree(-3.05, .95, 1.55); tree(2.95, 2.2, 1.15);
// 그림자 받는 바닥(투명)
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: .62 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
// 조명
scene.add(new THREE.HemisphereLight(0xf2f5f3, 0x20241f, 1.25));
const sun = new THREE.DirectionalLight(0xfff6e8, 2.3); sun.position.set(-7, 12, 8); sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 9; sun.shadow.bias = -.0004;
Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: .5, far: 40 }); scene.add(sun);
const rim = new THREE.DirectionalLight(0xa8ffc8, .45); rim.position.set(8, 5, -8); scene.add(rim);
const fill = new THREE.PointLight(0xffb45e, 5, 6); fill.position.set(.8, 1.2, D / 2 + 1.2); scene.add(fill);
r.render(scene, cam);
document.body.dataset.done = '1';
