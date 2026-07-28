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
