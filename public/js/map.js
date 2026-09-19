// maptilersdk.config.apiKey = mapToken;
// const map = new maptilersdk.Map({
//   container: "map", // container's id or the HTML element to render the map
//   style: maptilersdk.MapStyle.STREETS,
//   // center: [77.209, 28.6139], //starting pos [lng, lat]
//   // zoom: 9,
// });

maptilersdk.config.apiKey = mapKey;

const coordinates = listing.geometry.coordinates;

const map = new maptilersdk.Map({
  container: "map",
  style: maptilersdk.MapStyle.STREETS, //`https://api.maptiler.com/maps/streets-v2/style.json?key=${mapKey}`,
  center: coordinates,
  zoom: 9,
});

// Controls
map.addControl(new maptilersdk.NavigationControl(), "top-right");

// Marker + Popup

const marker = new maptilersdk.Marker({ color: "#fe424d" })
  .setLngLat(coordinates)
  .setPopup(
    new maptilersdk.Popup({ offset: 25 })
      .setHTML(
        `<h5>${listing.title}</h5><p>Exact location will be provided after booking</p>`,
      )
      .setMaxWidth("300px"),
  )
  .addTo(map);

// const popup = new maptilersdk.Popup({ offset: 25 }).setHTML(
//   `<h4>${listing.title}</h4>
//    <p>Exact location will be provided after booking</p>`,
// );

// new maptilersdk.Marker({ color: "#fe424d" })
//   .setLngLat(coordinates)
//   .setPopup(popup)
//   .addTo(map);
