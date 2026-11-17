// Farbzuordnung: Farbvariante (src/themes.js) → Materialien des Sneakers
export function shoeColors(c) {
  return {
    base: c.base,
    overlay: c.overlay,
    collar: c.collar || c.overlay,
    tongue: c.tongue || c.base,
    lace: c.lace || c.base,
    lining: c.lining || "#e9e5dd",
    liningFront: c.lining || "#e9e5dd",
    sole: c.sole || "#f3f1ec",
    outsole: c.outsole || c.overlay,
    stitch: c.stitch || "#ece8e0",
  };
}

export function paintSneaker(mats, c) {
  for (const [k, v] of Object.entries(shoeColors(c))) mats[k].color.set(v);
}
