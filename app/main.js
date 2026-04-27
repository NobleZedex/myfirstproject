// ── Map Setup ──
const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: 2,
  maxZoom: 6
});

// Match these to your SVG viewBox width and height (ignore the x/y offset)
const IMG_H = 376.09;
const IMG_W  = 623.73;

// ── Seam fix ──
// If Australia is cut off or there's a gap between tiles, tweak TILE_OFFSET.
// Negative value = tiles overlap (fixes a gap), positive = pulls them apart.
// Start at 0, then try small steps like -2, -4 until the seam disappears.
const TILE_OFFSET = 0;
const EFFECTIVE_W = IMG_W + TILE_OFFSET;

// ── Horizontal-only tiling ──
const TILE_RADIUS = 3; // copies on each side of centre (3 = 7 tiles total)

for (let col = -TILE_RADIUS; col <= TILE_RADIUS; col++) {
  const tileBounds = [
    [ 0,     col * EFFECTIVE_W         ],
    [ IMG_H, col * EFFECTIVE_W + IMG_W ]
  ];
  L.imageOverlay('map.svg', tileBounds, {
    interactive: false,
    className: 'map-tile'
  }).addTo(map);
}

// Fit to the centre tile on load
const centerBounds = [[0, 0], [IMG_H, IMG_W]];
map.fitBounds(centerBounds);

// Allow panning horizontally across all tiles, locked vertically
map.setMaxBounds([
  [ -IMG_H * 0.2, -TILE_RADIUS * EFFECTIVE_W ],
  [  IMG_H * 1.2,  TILE_RADIUS * EFFECTIVE_W ]
]);

// ── NATO-Style Icons ──
const natoIcons = {
  base: L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  }),
  recon: L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149059.png',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  }),
  assault: L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  })
};

// ── Markers (row: 0–380, col: 0–628) ──
const markers = {
  Alpha:     L.marker([190, 314], { icon: natoIcons.base    }).bindPopup("FOB ALPHA"),
  Bravo:     L.marker([120, 180], { icon: natoIcons.recon   }).bindPopup("RECON TEAM BRAVO"),
  Nightfall: L.marker([260, 480], { icon: natoIcons.assault }).bindPopup("ASSAULT AO NIGHTFALL")
};

Object.values(markers).forEach(m => m.addTo(map));

// ── Mission Data ──
const missionData = {
  Alpha: {
    title: "OPERATION ALPHA",
    info:  "SECURE EASTERN SECTOR. ESTABLISH FORWARD OPERATING BASE."
  },
  Bravo: {
    title: "OPERATION BRAVO",
    info:  "RECON ENEMY MOVEMENTS. AVOID DETECTION."
  },
  Nightfall: {
    title: "OPERATION NIGHTFALL",
    info:  "FULL ASSAULT UNDER DARKNESS. HIGH RISK OPERATION."
  }
};

// ── Dynamic Grid Scaling ──
map.on('zoomend', () => {
  const zoom = map.getZoom();
  const size = 60 * Math.pow(2, -zoom);
  document.getElementById('grid').style.backgroundSize = `${size}px ${size}px`;
});

// ── Mission Selection ──
function selectMission(name) {
  const data = missionData[name];

  document.getElementById('missionTitle').innerText = data.title;
  document.getElementById('missionInfo').innerText  = data.info;

  map.setView(markers[name].getLatLng(), 2);
  markers[name].openPopup();
}