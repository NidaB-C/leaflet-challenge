// Initialize the map on the "map" div with a given center and zoom level
let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5
  });

// Add a tile layer to the map using OpenStreetMap
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '© OpenStreetMap contributors, © CartoDB',
	maxZoom: 19
}).addTo(myMap);

// Function to determine marker size based on earthquake magnitude
function markerSize(magnitude) {
  return magnitude * 30000;  // Scale factor for magnitude
}

// Function to determine marker color based on earthquake depth
function markerColor(depth) {
  // Select color based on depth range
  return depth > 90 ? "#ff3333" :
         depth > 70 ? "#ff6633" :
         depth > 50 ? "#ff9933" :
         depth > 30 ? "#ffcc33" :
         depth > 10 ? "#ffff33" :
                      "#ccff33";
}

// Function to create popups for each earthquake marker
function onEachFeature(feature, layer) {
  layer.bindPopup("<h3>" + feature.properties.place +
    "</h3><hr><p>Magnitude: " + feature.properties.mag + "<br>Depth: " + feature.geometry.coordinates[2] + "</p>");
}

// Load GeoJSON data from USGS and add it to the map
const geojson = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
d3.json(geojson).then(function(data) {
  console.log(data);  // Log the data for debugging
  
  L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      return L.circle(latlng, {
        radius: markerSize(feature.properties.mag),
        color: markerColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.7
      });
    },
    onEachFeature: onEachFeature
  }).addTo(myMap);
});

// Add a legend to the map
let legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend'),
        depths = [-10, 10, 30, 50, 70, 90],
        labels = [];

    // Loop through our intervals and generate a label with a colored square for each interval
    for (let i = 0; i < depths.length; i++) {
        let from = depths[i];
        let to = depths[i + 1];

        labels.push(
            '<i style="background:' + markerColor(from + 1) + '"></i> ' +
            from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(myMap);