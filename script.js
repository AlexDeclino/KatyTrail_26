// POI coordinates are percentages of the map image's width/height,
// measured from the green markers in the reference map (map_POI_B.png).
const PLACEHOLDER_TEXTS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum."
];

// Ordered south to north (bottom to top of the map) so marker numbers run bottom-up.
const RAW_POIS = [
  { id: "victory-overlook",    label: "Victory Overlook",                    x: 30.35, y: 72.17, images: ["assets/13.png"] },
  { id: "thomsen-overlook-3",  label: "Trail Point (near Thomsen Overlook)", x: 31.46, y: 70.09, images: ["assets/12.png"] },
  { id: "thomsen-overlook-2",  label: "Trail Point (near Thomsen Overlook)", x: 30.10, y: 70.09, images: ["assets/11.png"] },
  { id: "thomsen-overlook",    label: "Thomsen Overlook",                    x: 31.74, y: 68.56, images: ["assets/10.png"] },
  { id: "ice-house-caboose",   label: "Katy Trail Ice House Caboose",        x: 37.51, y: 65.10, images: ["assets/9.png"] },
  { id: "snyders-union",       label: "Snyder's Union",                      x: 50.00, y: 54.31, images: ["assets/8.png"] },
  { id: "travis-st",           label: "Trail Point (Travis St.)",            x: 61.35, y: 35.48, images: ["assets/7.png"] },
  { id: "tao-of-warren-2",     label: "Trail Point (near The Tao of Warren)",x: 64.33, y: 30.66, images: ["assets/6_A.png", "assets/6_B.png", "assets/6_C.png"] },
  { id: "tao-of-warren",       label: "The Tao of Warren",                   x: 65.15, y: 29.70, images: ["assets/5.png"] },
  { id: "davids-way",          label: "David's Way",                         x: 66.73, y: 28.00, images: ["assets/4.png"] },
  { id: "knox-street",         label: "Knox Street",                         x: 67.53, y: 26.79, images: ["assets/3.png"] },
  { id: "harvard",             label: "Harvard",                             x: 74.72, y: 21.06, images: ["assets/2.png"] },
  { id: "dedos-place",        label: "Dedo's Place",                        x: 79.81, y: 16.82, images: ["assets/1.png"] }
];

const POIS = RAW_POIS.map((poi, i) => ({
  ...poi,
  number: i + 1,
  text: PLACEHOLDER_TEXTS[i % PLACEHOLDER_TEXTS.length]
}));

const markersEl = document.getElementById("markers");
const overlay = document.getElementById("overlay");
const overlayCard = overlay.querySelector(".overlay-card");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const overlayGallery = document.getElementById("overlay-gallery");
const overlayClose = document.getElementById("overlay-close");

let lastFocused = null;
const defaultTitle = document.title;

function openOverlay(poi) {
  overlayTitle.textContent = poi.label;
  overlayText.textContent = poi.text;
  overlayGallery.innerHTML = "";
  poi.images.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = poi.label + " photo";
    overlayGallery.appendChild(img);
  });

  document.title = "#" + poi.number + " " + poi.label;

  lastFocused = document.activeElement;
  overlay.hidden = false;
  overlayClose.focus();
}

function closeOverlay() {
  overlay.hidden = true;
  document.title = defaultTitle;
  if (lastFocused) lastFocused.focus();
}

overlayClose.addEventListener("click", closeOverlay);

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeOverlay();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !overlay.hidden) closeOverlay();
});

const markerEls = POIS.map((poi) => {
  const btn = document.createElement("button");
  btn.className = "marker";
  btn.style.left = poi.x + "%";
  btn.style.top = poi.y + "%";
  btn.setAttribute("aria-label", poi.number + ". " + poi.label);
  btn.setAttribute("type", "button");

  const number = document.createElement("span");
  number.className = "marker-number";
  number.textContent = poi.number;
  btn.appendChild(number);

  const label = document.createElement("span");
  label.className = "marker-label";
  label.textContent = poi.label;
  btn.appendChild(label);

  btn.addEventListener("click", () => openOverlay(poi));
  markersEl.appendChild(btn);
  return btn;
});

// Spread out markers that sit close enough to overlap, so each stays clickable.
function layoutMarkers() {
  const wrap = document.getElementById("map-wrap");
  const w = wrap.offsetWidth;
  const h = wrap.offsetHeight;
  if (!w || !h) return;

  const size = markerEls[0] ? markerEls[0].offsetWidth : 26;

  const nodes = POIS.map((poi) => ({
    x: (poi.x / 100) * w,
    y: (poi.y / 100) * h
  }));

  const parent = nodes.map((_, i) => i);
  function find(i) {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  }
  function union(a, b) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < size) {
        union(i, j);
      }
    }
  }

  const clusters = new Map();
  nodes.forEach((_, i) => {
    const root = find(i);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root).push(i);
  });

  const offsets = new Array(nodes.length).fill(0);
  clusters.forEach((idxs) => {
    if (idxs.length < 2) return;
    idxs.sort((a, b) => nodes[a].x - nodes[b].x);
    const centerX = idxs.reduce((sum, i) => sum + nodes[i].x, 0) / idxs.length;
    const spacing = size + 4;
    const startX = centerX - (spacing * (idxs.length - 1)) / 2;
    idxs.forEach((i, k) => {
      offsets[i] = startX + k * spacing - nodes[i].x;
    });
  });

  markerEls.forEach((el, i) => {
    el.style.setProperty("--scatter-x", offsets[i].toFixed(1) + "px");
  });
}

layoutMarkers();
window.addEventListener("resize", layoutMarkers);

// --- Pan & zoom ---
(() => {
  const stage = document.getElementById("map-stage");
  const wrap = document.getElementById("map-wrap");
  const zoomInBtn = document.getElementById("zoom-in");
  const zoomOutBtn = document.getElementById("zoom-out");
  const zoomResetBtn = document.getElementById("zoom-reset");

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;
  const BUTTON_FACTOR = 1.6;
  const WHEEL_FACTOR = 1.15;

  let scale = 1;
  let panX = 0;
  let panY = 0;

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function clampPan() {
    const stageRect = stage.getBoundingClientRect();
    const w = wrap.offsetWidth * scale;
    const h = wrap.offsetHeight * scale;

    if (w <= stageRect.width) {
      panX = 0;
    } else {
      const limit = (w - stageRect.width) / 2;
      panX = clamp(panX, -limit, limit);
    }

    if (h <= stageRect.height) {
      panY = 0;
    } else {
      const limit = (h - stageRect.height) / 2;
      panY = clamp(panY, -limit, limit);
    }
  }

  function apply() {
    wrap.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  }

  // Keep a point under (clientX, clientY) visually fixed while changing scale.
  function zoomTo(newScale, clientX, clientY) {
    newScale = clamp(newScale, MIN_SCALE, MAX_SCALE);
    const stageRect = stage.getBoundingClientRect();
    const stageCenterX = stageRect.left + stageRect.width / 2;
    const stageCenterY = stageRect.top + stageRect.height / 2;

    const qx = clientX - stageCenterX;
    const qy = clientY - stageCenterY;
    const ratio = newScale / scale;

    panX = qx - (qx - panX) * ratio;
    panY = qy - (qy - panY) * ratio;
    scale = newScale;

    clampPan();
    apply();
  }

  function stageCenterPoint() {
    const r = stage.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  zoomInBtn.addEventListener("click", () => {
    const c = stageCenterPoint();
    wrap.classList.remove("is-interacting");
    zoomTo(scale * BUTTON_FACTOR, c.x, c.y);
  });

  zoomOutBtn.addEventListener("click", () => {
    const c = stageCenterPoint();
    wrap.classList.remove("is-interacting");
    zoomTo(scale / BUTTON_FACTOR, c.x, c.y);
  });

  zoomResetBtn.addEventListener("click", () => {
    wrap.classList.remove("is-interacting");
    scale = 1;
    panX = 0;
    panY = 0;
    apply();
  });

  stage.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      wrap.classList.add("is-interacting");
      const factor = e.deltaY < 0 ? WHEEL_FACTOR : 1 / WHEEL_FACTOR;
      zoomTo(scale * factor, e.clientX, e.clientY);
    },
    { passive: false }
  );

  // Unified pointer-based drag-to-pan and pinch-to-zoom.
  const pointers = new Map();
  let dragMoved = false;
  let dragStart = null; // { x, y, panX, panY }
  let pinchStart = null; // { dist, midX, midY, scale, panX, panY }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function midpoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function suppressNextClick() {
    const onClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener("click", onClick, { capture: true, once: true });
  }

  stage.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".zoom-btn")) return;

    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    wrap.classList.add("is-interacting");

    if (pointers.size === 1) {
      dragMoved = false;
      dragStart = { x: e.clientX, y: e.clientY, panX, panY };
      wrap.classList.add("is-panning");
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchStart = {
        dist: distance(a, b),
        mid: midpoint(a, b),
        scale,
        panX,
        panY
      };
      dragStart = null;
    }
  });

  stage.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2 && pinchStart) {
      const [a, b] = [...pointers.values()];
      const newDist = distance(a, b);
      const mid = midpoint(a, b);
      const newScale = clamp(
        pinchStart.scale * (newDist / pinchStart.dist),
        MIN_SCALE,
        MAX_SCALE
      );

      const stageRect = stage.getBoundingClientRect();
      const stageCenterX = stageRect.left + stageRect.width / 2;
      const stageCenterY = stageRect.top + stageRect.height / 2;
      const qx = mid.x - stageCenterX;
      const qy = mid.y - stageCenterY;
      const ratio = newScale / pinchStart.scale;

      panX = qx - (qx - pinchStart.panX) * ratio;
      panY = qy - (qy - pinchStart.panY) * ratio;
      scale = newScale;

      clampPan();
      apply();
      dragMoved = true;
    } else if (pointers.size === 1 && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved = true;

      panX = dragStart.panX + dx;
      panY = dragStart.panY + dy;
      clampPan();
      apply();
    }
  });

  function endPointer(e) {
    pointers.delete(e.pointerId);
    wrap.classList.remove("is-panning");

    if (pointers.size < 2) pinchStart = null;

    if (pointers.size === 1) {
      const [p] = [...pointers.values()];
      dragStart = { x: p.x, y: p.y, panX, panY };
    } else if (pointers.size === 0) {
      dragStart = null;
      wrap.classList.remove("is-interacting");
      if (dragMoved) suppressNextClick();
      dragMoved = false;
    }
  }

  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);

  window.addEventListener("resize", () => {
    clampPan();
    apply();
  });
})();
