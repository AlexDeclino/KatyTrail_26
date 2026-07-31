// ---------------------------------------------------------------------------
// Drop your Google Maps API key here. It needs the "Maps JavaScript API"
// enabled on a Google Cloud project with billing turned on (Google gives a
// recurring free monthly usage allowance — a small site like this should
// stay within it, but the billing account still has to exist).
// Restrict the key to your domain in Google Cloud Console before going live.
const GOOGLE_MAPS_API_KEY = "AIzaSyAu6ZmocrNDAaTASB16nrcoPCBw0s_VQuA";
// ---------------------------------------------------------------------------

// This page uses Google's Photorealistic 3D Tiles (the "maps3d" library),
// which is a public-preview API as of writing. If Google has since renamed
// any of the properties/classes below, check:
// https://developers.google.com/maps/documentation/javascript/3d-maps-overview

const statusEl = document.getElementById("map3d-status");
const statusTextEl = document.getElementById("map3d-status-text");
const panel = document.getElementById("site-panel");
const panelTitle = document.getElementById("site-panel-title");
const panelText = document.getElementById("site-panel-text");
const panelImage = document.getElementById("site-panel-image");
const panelClose = document.getElementById("site-panel-close");

const siteContentMap = {};
(typeof SITE_CONTENT !== "undefined" ? SITE_CONTENT.sites || [] : []).forEach((s) => {
  siteContentMap[s.site] = s;
});

function showStatus(message) {
  statusTextEl.textContent = message;
  statusEl.hidden = false;
}

function showSitePanel(number) {
  const content = siteContentMap[number] || {};
  panelTitle.textContent = "SITE #" + number;
  panelText.textContent = content.description || "";

  const firstImage = (content.images || [])[0];
  if (firstImage) {
    panelImage.src = "assets/" + firstImage;
    panelImage.hidden = false;
  } else {
    panelImage.hidden = true;
  }

  panel.hidden = false;
}

panelClose.addEventListener("click", () => {
  panel.hidden = true;
});

if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_API_KEY_HERE") {
  showStatus(
    "This page needs a Google Maps API key. Open map3d.js and set " +
      "GOOGLE_MAPS_API_KEY to a key from Google Cloud Console (with the " +
      "Maps JavaScript API enabled) to see the 3D view."
  );
} else {
  loadGoogleMaps(GOOGLE_MAPS_API_KEY);
}

function loadGoogleMaps(key) {
  // Official Google Maps JS API bootstrap loader.
  ((g) => {
    var h,
      a,
      k,
      p = "The Google Maps JavaScript API",
      c = "google",
      l = "importLibrary",
      q = "__ib__",
      m = document,
      b = window;
    b = b[c] || (b[c] = {});
    var d = b.maps || (b.maps = {}),
      r = new Set(),
      e = new URLSearchParams(),
      u = () =>
        h ||
        (h = new Promise(async (f, n) => {
          await (a = m.createElement("script"));
          e.set("libraries", [...r] + "");
          for (k in g) e.set(k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()), g[k]);
          e.set("callback", c + ".maps." + q);
          a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
          d[q] = f;
          a.onerror = () => (h = n(Error(p + " could not load.")));
          a.nonce = m.querySelector("script[nonce]")?.nonce || "";
          m.head.append(a);
        }));
    d[l]
      ? console.warn(p + " only loads once. Ignoring:", g)
      : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)));
  })({ key, v: "alpha" });

  initMap3D().catch((err) => {
    console.error(err);
    showStatus(
      "Couldn't load the 3D map (" +
        (err && err.message ? err.message : "unknown error") +
        "). Check the API key, that billing is enabled, and that the Maps " +
        "JavaScript API is turned on for this key's project."
    );
  });
}

async function initMap3D() {
  const maps3d = await google.maps.importLibrary("maps3d");
  const { Map3DElement } = maps3d;
  const MarkerCtor = maps3d.Marker3DInteractiveElement || maps3d.Marker3DElement;

  // Centered roughly over the middle of the trail; adjust to taste.
  const map3D = new Map3DElement({
    center: { lat: 32.8117, lng: -96.7958, altitude: 250 },
    range: 3200,
    tilt: 65,
    heading: 15,
    mode: "HYBRID"
  });

  document.getElementById("map3d-container").appendChild(map3D);

  Object.keys(SITE_GEO || {}).forEach((key) => {
    const number = Number(key);
    const geo = SITE_GEO[number];
    if (!geo) return;

    const marker = new MarkerCtor({
      position: { lat: geo.lat, lng: geo.lng, altitude: 25 },
      altitudeMode: "RELATIVE_TO_GROUND",
      extruded: true,
      label: "SITE #" + number
    });

    marker.addEventListener("gmp-click", () => showSitePanel(number));
    map3D.appendChild(marker);
  });
}
