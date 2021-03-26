
// Global Variables
var mapDiv = $("#map");
var searchInp = $("#search-input");
var destBtnCont = $("#destination-btn-container");
var destPic = $("#dest-img");
var destName = $("#dest-name");
var destAddr = $("#dest-addr");
var destSite = $("#dest-site");
var calcRoute = $("#calc-route");
var directDiv = $("#directions");
var qrPic = $("#qr-pic");

var mapOG;
var destList = {};

var originRoute;
var destinationRoute;

// Global Services
let directServ;
let dirRenderServ;

var apiKey = localStorage.getItem("apiKey");
if (apiKey === null) {
  apiKey = prompt("Enter the API key: ");
  localStorage.setItem("apiKey", apiKey);
}

// Create the script tag, set the appropriate attributes
// This initializes the google maps API thing
var script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
script.async = true;

// Append the 'script' element to 'head'
document.head.appendChild(script);


// Callback to run after google maps API runs; intialize map
function initMap() {
  // Create map
  mapOG = new google.maps.Map(mapDiv[0], {
    center: { lat: 44.977753, lng: -93.2650108 },
    zoom: 8,
  });

  // Autocomplete search options
  const autoCompOpt = {
    fields: ["formatted_address", "geometry", "name", "photos", "place_id", "website"],
    origin: mapOG.getCenter(),
    strictBounds: false,
  };

  // Create services
  const autoCompServ = new google.maps.places.Autocomplete(searchInp[0], autoCompOpt);
  directServ = new google.maps.DirectionsService();
  dirRenderServ = new google.maps.DirectionsRenderer();
  autoCompServ.bindTo("bounds", mapOG);


  // Event listener for search
  autoCompServ.addListener("place_changed", () => {
    // Get the place object for what was searached
    const place = autoCompServ.getPlace();

    // Make sure it's an actual place
    if (!place.geometry || !place.geometry.location) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.

      // TODO: replace with modal
      window.alert(`No details available for input: '${place.name}'`);
      return;
    }
    // Clear search input value
    searchInp.val("");
    // Add destination to variables and handle things with it
    addDestination(place, mapOG);
  });
}

// Handle place data
function addDestination(placeInp, mapInp) {
  // If the place has a geometry, then present it on a map.
  if (placeInp.geometry.viewport) {
    mapInp.fitBounds(placeInp.geometry.viewport);
  } else {
    mapInp.setCenter(placeInp.geometry.location);
    mapInp.setZoom(17);
  }

  // Create marker
  const placeMark = new google.maps.Marker({
    position: placeInp.geometry.location
  });
  placeMark.setMap(mapOG);

  // Create new button for this destination
  const newBtn = $("<button>")
    .addClass("btn btn-primary d-block my-3")
    .text(placeInp.name)
    .attr("data-placeid", placeInp.place_id);

  destBtnCont.append(newBtn);

  // Build destination object
  const destination = {
    place: placeInp,
    marker: placeMark,
    button: newBtn
  };
  if (originRoute === undefined) {
    originRoute = destination;
  }
  destinationRoute = destination;
  destList[placeInp.place_id] = destination;
}


destBtnCont.on("click", "button", (event) => {
  const clickedPlaceId = event.currentTarget.dataset.placeid;
  const clickedDest = destList[clickedPlaceId];
  const clickedDestPlace = destList[clickedPlaceId].place;
  mapOG.panTo(clickedDestPlace.geometry.location);

  // Eventually check if attributes exist
  if (clickedDestPlace.photos) {
    destPic.attr("src", clickedDestPlace.photos[0].getUrl());
  } else {
    destPic.attr("src", "https://via.placeholder.com/200x200");
  }
  destName.text(clickedDestPlace.name);
  destAddr.text(clickedDestPlace.formatted_address);
  if (clickedDestPlace.website) {
    destSite.removeClass("disabled");
    destSite.attr("href", clickedDestPlace.website);
  } else {
    destSite.attr("href", "#");
    destSite.addClass("disabled");
  }
});

calcRoute.on("click", (event) => {
  let routeReq = {
    origin: { placeId: originRoute.place.place_id },
    destination: { placeId: destinationRoute.place.place_id },
    travelMode: google.maps.TravelMode.DRIVING,
    optimizeWaypoints: true,
    waypoints: []
  };

  const originPID = routeReq.origin.placeId;
  const originObj = destList[originPID];

  const destinPID = routeReq.destination.placeId;
  const destinObj = destList[destinPID];

  Object.keys(destList).forEach((pId) => {
    if ((pId !== routeReq.origin.placeId) && (pId !== routeReq.destination.placeId)) {
      routeReq.waypoints.push({ location: { placeId: pId } });
    }
  });


  dirRenderServ.setMap(mapOG);
  dirRenderServ.setPanel(directDiv[0]);

  directServ.route(routeReq, (result, status) => {
    dirRenderServ.setDirections(result);
  });

  const gMapUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originObj.place.name)}&origin_place_id=${encodeURIComponent(originPID)}&destination=${encodeURIComponent(destinObj.place.name)}&destination_place_id=${encodeURIComponent(destinPID)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(gMapUrl)}&size=200x200`;
  qrPic.attr("src", qrUrl);
});
