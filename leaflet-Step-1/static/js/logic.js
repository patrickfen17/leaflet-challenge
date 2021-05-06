// Store our API endpoint as queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson"
console.log(queryUrl);

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  console.log(data.features);
  
  // Using the features array sent back in the API data, create a GeoJSON layer and add it to the map
  function onEachFeature(feature, layer) {
    layer.bindPopup(`${feature.properties.place}<hr>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}`);
  }

  function getColor(depth) {

    //Use if/else if etc on mag to change colors
    if (depth > 9)
        return "#990000"
    else if (depth > 6)
        return "#FF0000"
    else if (depth > 3)
        return "#FF9900"
    else
        return "#FFFF00";
  }

  var earthquakes = L.geoJSON(data.features, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: function(feature) {
      return {
        "color": "white",
        "fillOpacity": 1,
        "fillColor": getColor(feature.geometry.coordinates[2]),
        "weight": 5,
        "radius": feature.properties.mag * 5,
        "opacity": 0.75    
      }
    }  
  })

  // Define streetmap layer
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });
 
  // Define darkmap layer
  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });
 
  // Define satellitemap
  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Satellite": satellitemap
  };

  var overlayMaps = {
    "Earthquakes": earthquakes
  }

  // Create a new map
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control containing our baseMaps
  // Be sure to add an overlay Layer containing the earthquake GeoJSON
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

   // Set up the legend
   var legend = L.control({position: 'bottomright'});

   legend.onAdd = function (map) {
   
     var div = L.DomUtil.create('div', 'info legend'),
         labels = [`<strong>Depth</strong>`]
         depths = [0, 3, 6, 9],
         colors = ["#FFFF00","#FF9900","#FF0000","#990000"];
 
     // loop through our density intervals and generate a label with a colored square for each interval
     for (var i = 0; i < depths.length; i++) {
         div.innerHTML +=
         labels.push(
             '<i style="background:' + colors[i] + '"></i> ' +
             depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+'));
     }
     div.innerHTML = labels.join(`<br>`);
     return div;
   };
  
    // Adding legend to the map
    legend.addTo(myMap);

});