// Der Sneaker der Startseite und der Produktfotos:
// 3D-Modell "boing01白" von yihsuanchen13 (Sketchfab, CC BY 4.0), über die paprika3d-Bibliothek, für das Web optimiert.
// Das Modell ist komplett weiß. Obermaterial und Sohle werden im Shader getrennt eingefärbt:
// Jeder Punkt kennt seine Höhe am Schuh (aH, 0 = Boden … 1 = Oberkante); unterhalb der Sohlenkante gilt die Sohlenfarbe.
import { Box3, Vector3, Group, Color, Float32BufferAttribute } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export const SHOE_LENGTH = 0.29;
export const SOLE_TOP = 0.405; // Anteil der Schuhhöhe, an dem die Plateau-Sohle endet (am Modell ausgemessen)

export async function loadShoe(b64) {
  const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bin.buffer, "");
  const model = gltf.scene;

  // Ausrichten: Länge entlang x (Ferse → Spitze), Boden auf y = 0, Länge 29 cm
  let box = new Box3().setFromObject(model), size = box.getSize(new Vector3());
  if (size.z > size.x) model.rotation.y = Math.PI / 2;
  box = new Box3().setFromObject(model); size = box.getSize(new Vector3());
  model.scale.multiplyScalar(SHOE_LENGTH / Math.max(size.x, size.z));
  box = new Box3().setFromObject(model);
  const c = box.getCenter(new Vector3());
  model.position.sub(new Vector3(c.x, box.min.y, c.z));
  const root = new Group();
  root.add(model);
  root.updateMatrixWorld(true);
  box = new Box3().setFromObject(root);
  const h = box.max.y - box.min.y;

  const uniforms = {
    uUpper: { value: new Color("#ffffff") },
    uSole: { value: new Color("#ffffff") },
    uSoleTop: { value: SOLE_TOP },
  };
  const v = new Vector3();
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    // Höhe jedes Punkts im ausgerichteten Schuh als eigenes Attribut
    const pos = o.geometry.attributes.position, hs = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      hs[i] = (v.y - box.min.y) / h;
    }
    o.geometry.setAttribute("aH", new Float32BufferAttribute(hs, 1));
    const m = o.material;
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nattribute float aH;\nvarying float vH;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvH = aH;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying float vH;\nuniform vec3 uUpper, uSole;\nuniform float uSoleTop;")
        .replace("#include <map_fragment>", `#include <map_fragment>
          float soleW = 1.0 - smoothstep( uSoleTop - 0.006, uSoleTop + 0.006, vH );
          diffuseColor.rgb *= mix( uUpper, uSole, soleW );`);
    };
    m.customProgramCacheKey = () => "nordlauf-shoe";
    m.needsUpdate = true;
  });

  return {
    root,
    height: h,
    colors: { upper: uniforms.uUpper.value, sole: uniforms.uSole.value },
    setSoleTop: (t) => { uniforms.uSoleTop.value = t; },
  };
}
