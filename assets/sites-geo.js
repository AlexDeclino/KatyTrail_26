// Real-world coordinates for each numbered site, used only by the 3D map view
// (map3d.html). These points are snapped onto the actual Katy Trail path —
// traced from OpenStreetMap's real trail geometry (way name="Katy Trail"),
// not just guessed at nearby streets — with each site placed proportionally
// along that path based on its position on the illustrated map. Still an
// ESTIMATE, not an exact GPS drop: verify/adjust individual pins as needed.
const SITE_GEO = {
  1: { lat: 32.791888, lng: -96.810411 },
  2: { lat: 32.793524, lng: -96.811611 },
  3: { lat: 32.793364, lng: -96.811869 },
  4: { lat: 32.794583, lng: -96.812740 },
  5: { lat: 32.797575, lng: -96.813172 },
  6: { lat: 32.803559, lng: -96.803832 },
  7: { lat: 32.819065, lng: -96.794683 },
  8: { lat: 32.823037, lng: -96.792308 },
  9: { lat: 32.823703, lng: -96.791609 },
  10: { lat: 32.824823, lng: -96.790302 },
  11: { lat: 32.825619, lng: -96.789365 },
  12: { lat: 32.829399, lng: -96.784938 },
  13: { lat: 32.832189, lng: -96.781655 }
};
