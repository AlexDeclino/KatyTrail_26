// POI coordinates are percentages of the map image's width/height,
// measured from the green markers in the reference map (map_POI_B.png).
const PLACEHOLDER_TEXTS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum."
];

const PLACEHOLDER_IMAGE_SETS = [
  ["assets/placeholder-1.svg", "assets/placeholder-2.svg", "assets/placeholder-3.svg"],
  ["assets/placeholder-2.svg", "assets/placeholder-3.svg", "assets/placeholder-1.svg"],
  ["assets/placeholder-3.svg", "assets/placeholder-1.svg", "assets/placeholder-2.svg"]
];

const RAW_POIS = [
  { id: "dedos-place",        label: "Dedo's Place",                        x: 79.81, y: 16.82 },
  { id: "harvard",             label: "Harvard",                             x: 74.72, y: 21.06 },
  { id: "knox-street",         label: "Knox Street",                         x: 67.53, y: 26.79 },
  { id: "davids-way",          label: "David's Way",                         x: 66.73, y: 28.00 },
  { id: "tao-of-warren",       label: "The Tao of Warren",                   x: 65.15, y: 29.70 },
  { id: "tao-of-warren-2",     label: "Trail Point (near The Tao of Warren)",x: 64.33, y: 30.66 },
  { id: "travis-st",           label: "Trail Point (Travis St.)",            x: 61.35, y: 35.48 },
  { id: "snyders-union",       label: "Snyder's Union",                      x: 50.00, y: 54.31 },
  { id: "ice-house-caboose",   label: "Katy Trail Ice House Caboose",        x: 37.51, y: 65.10 },
  { id: "thomsen-overlook",    label: "Thomsen Overlook",                    x: 31.74, y: 68.56 },
  { id: "thomsen-overlook-2",  label: "Trail Point (near Thomsen Overlook)", x: 30.10, y: 70.09 },
  { id: "thomsen-overlook-3",  label: "Trail Point (near Thomsen Overlook)", x: 31.46, y: 70.09 },
  { id: "victory-overlook",    label: "Victory Overlook",                    x: 30.35, y: 72.17 }
];

const POIS = RAW_POIS.map((poi, i) => ({
  ...poi,
  number: i + 1,
  text: PLACEHOLDER_TEXTS[i % PLACEHOLDER_TEXTS.length],
  images: PLACEHOLDER_IMAGE_SETS[i % PLACEHOLDER_IMAGE_SETS.length]
}));

const markersEl = document.getElementById("markers");
const overlay = document.getElementById("overlay");
const overlayCard = overlay.querySelector(".overlay-card");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const overlayGallery = document.getElementById("overlay-gallery");
const overlayClose = document.getElementById("overlay-close");

let lastFocused = null;

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

  lastFocused = document.activeElement;
  overlay.hidden = false;
  overlayClose.focus();
}

function closeOverlay() {
  overlay.hidden = true;
  if (lastFocused) lastFocused.focus();
}

overlayClose.addEventListener("click", closeOverlay);

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeOverlay();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !overlay.hidden) closeOverlay();
});

POIS.forEach((poi) => {
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
});

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
