// const campground = require("../../models/campground");


// const mapToken = '<%-process.env.MAPBOX_TOKEN%>';
// const campground = <% -JSON.stringify(campground) %>;
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://style/mapbox/streets-v11',
  center: campground.geometry.coordinates,
  zoom: 4
})

new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .addTo(map);