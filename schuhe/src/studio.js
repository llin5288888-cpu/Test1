// Virtuelles Fotostudio: Hohlkehle, Softbox-Licht, weicher Schatten.
// Wird von tools/studio.html genutzt, um die Produktfotos der Kollektion zu erzeugen.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Mesh, PlaneGeometry, MeshStandardMaterial, DirectionalLight,
  HemisphereLight, PMREMGenerator, ACESFilmicToneMapping, SRGBColorSpace, VSMShadowMap, Color, Vector3,
  ShadowMaterial, CanvasTexture,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { loadShoe } from "./shoeModel.js";

function contactShadow() {
  const c = document.createElement("canvas"); c.width = 256; c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 64, 4, 128, 64, 120);
  g.addColorStop(0, "rgba(0,0,0,0.55)"); g.addColorStop(0.5, "rgba(0,0,0,0.18)"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 128);
  return new CanvasTexture(c);
}

export async function createStudio(canvas, width, height, modelB64) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = VSMShadowMap;

  const scene = new Scene();
  scene.environment = new PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.75;

  // Hohlkehle: Boden geht weich in die Rückwand über
  const sweepGeo = new PlaneGeometry(3, 3, 1, 80);
  const p = sweepGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = (p.getY(i) + 1.5) / 3; // 0 vorne … 1 hinten
    const d = t * 1.6 - 0.35; // Tiefe
    const r = 0.35;
    let y = 0, z = -d;
    if (d > 0.25) { const a = Math.min(Math.PI / 2, (d - 0.25) / r); y = r - Math.cos(a) * r; z = -(0.25 + Math.sin(a) * r); if ((d - 0.25) / r > Math.PI / 2) { y = r + (d - 0.25 - r * Math.PI / 2); z = -(0.25 + r); } }
    p.setXYZ(i, p.getX(i), y, z);
  }
  sweepGeo.computeVertexNormals();
  const backdropMat = new MeshStandardMaterial({ color: "#e8e2d8", roughness: 0.95 });
  const sweep = new Mesh(sweepGeo, backdropMat);
  sweep.receiveShadow = true;
  scene.add(sweep);

  const contact = new Mesh(new PlaneGeometry(0.42, 0.2), new MeshStandardMaterial({ color: 0x000000, transparent: true, alphaMap: null, opacity: 1, depthWrite: false }));
  contact.material = new ShadowMaterial({ opacity: 0 });
  const cs = new Mesh(new PlaneGeometry(0.4, 0.17), new MeshStandardMaterial({ color: "#000", transparent: true, map: contactShadow(), depthWrite: false, roughness: 1 }));
  cs.rotation.x = -Math.PI / 2; cs.position.y = 0.0006;
  scene.add(cs);

  const key = new DirectionalLight(0xffffff, 2.6);
  key.position.set(-0.5, 1.2, 0.8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -0.4, right: 0.4, top: 0.4, bottom: -0.4, near: 0.1, far: 4 });
  key.shadow.radius = 16; key.shadow.blurSamples = 24; key.shadow.bias = -0.0004;
  scene.add(key);
  const fill = new DirectionalLight(0xffffff, 0.6); fill.position.set(0.8, 0.4, 0.6); scene.add(fill);
  const rim = new DirectionalLight(0xffffff, 1.4); rim.position.set(0.3, 0.6, -1); scene.add(rim);
  scene.add(new HemisphereLight(0xffffff, 0x8a8070, 0.4));

  const shoe = await loadShoe(modelB64);
  shoe.root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const root = shoe.root;
  scene.add(root);

  const camera = new PerspectiveCamera(24, width / height, 0.01, 10);

  return {
    renderer, scene, root, shoe,
    shoot({ colors, backdrop, yaw = -0.6, camPos = [0.38, 0.17, 0.58], target = [0, 0.05, 0], liftShoe = 0 }) {
      shoe.colors.upper.set(colors.upper);
      shoe.colors.sole.set(colors.sole);
      backdropMat.color.set(backdrop);
      root.rotation.set(0, yaw, 0);
      root.position.y = liftShoe;
      camera.position.set(...camPos);
      camera.lookAt(new Vector3(...target));
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      return canvas.toDataURL("image/jpeg", 0.84);
    },
  };
}
