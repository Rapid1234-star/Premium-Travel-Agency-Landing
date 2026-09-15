import * as THREE from 'three';

const shape = new THREE.Shape();
shape.moveTo( 1.15,  0);      // Root Leading Edge
shape.lineTo(-1.05,  0);      // Root Trailing Edge
shape.lineTo(-2.65,  5.8);    // Tip Trailing Edge  (swept back)
shape.lineTo(-0.70,  5.8);    // Tip Leading Edge
shape.closePath();

const mainWingGeo = new THREE.ExtrudeGeometry(shape, {
  depth: 0.055,
  bevelEnabled: true,
  bevelThickness: 0.020,
  bevelSize:      0.012,
  bevelSegments:  4,
});

const mesh = new THREE.Mesh(mainWingGeo);
mesh.rotation.set(-Math.PI / 2, 0, 0);
mesh.position.set(-0.05, -0.22, 0.48);
mesh.updateMatrixWorld();

const box = new THREE.Box3().setFromObject(mesh);
console.log('Bounding Box:', box);
