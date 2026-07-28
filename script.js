// POI coordinates are percentages of the map image's width/height,
// measured from the green markers in the reference map (map_POI.png).
const POIS = [
  {
    id: "harvard",
    label: "Harvard Crossing",
    x: 72.00,
    y: 23.21,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    images: ["assets/placeholder-1.svg", "assets/placeholder-2.svg", "assets/placeholder-3.svg"]
  },
  {
    id: "fitzhugh",
    label: "Fitzhugh Entrance",
    x: 58.58,
    y: 40.68,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    images: ["assets/placeholder-2.svg", "assets/placeholder-3.svg", "assets/placeholder-1.svg"]
  },
  {
    id: "snyders-union",
    label: "Snyder's Union",
    x: 50.71,
    y: 51.82,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    images: ["assets/placeholder-3.svg", "assets/placeholder-1.svg", "assets/placeholder-2.svg"]
  },
  {
    id: "ice-house-caboose",
    label: "Katy Trail Ice House Caboose",
    x: 38.82,
    y: 64.30,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    images: ["assets/placeholder-1.svg", "assets/placeholder-3.svg", "assets/placeholder-2.svg"]
  },
  {
    id: "victory-overlook",
    label: "Victory Overlook",
    x: 30.38,
    y: 69.68,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum.",
    images: ["assets/placeholder-2.svg", "assets/placeholder-1.svg", "assets/placeholder-3.svg"]
  }
];

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
  btn.setAttribute("aria-label", poi.label);
  btn.setAttribute("type", "button");

  const label = document.createElement("span");
  label.className = "marker-label";
  label.textContent = poi.label;
  btn.appendChild(label);

  btn.addEventListener("click", () => openOverlay(poi));
  markersEl.appendChild(btn);
});
