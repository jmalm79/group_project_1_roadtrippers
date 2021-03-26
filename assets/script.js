/* eslint-disable no-alert */

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

// const apiKey = prompt("Enter the API key: ");

// Create the script tag, set the appropriate attributes
// This initializes the google maps API thing
var script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
script.async = true;

// Append the 'script' element to 'head'
document.head.appendChild(script);


// Global Services
let directServ;
let dirRenderServ;

// Attach your callback function to the `window` object
function initMap() {
  // Create map
  mapOG = new google.maps.Map(mapDiv[0], {
    center: { lat: 44.977753, lng: -93.2650108 },
    zoom: 8,
  });

  // Options
  let autoCompOpt = {
    fields: ["formatted_address", "geometry", "name", "photos", "place_id", "website"],
    origin: mapOG.getCenter(),
    strictBounds: false,
  };

  // Services
  const autoCompServ = new google.maps.places.Autocomplete(searchInp[0], autoCompOpt);
  directServ = new google.maps.DirectionsService();
  dirRenderServ = new google.maps.DirectionsRenderer()
  autoCompServ.bindTo("bounds", mapOG);


  // Event listeners
  autoCompServ.addListener("place_changed", () => {
    const place = autoCompServ.getPlace();

    // Make sure it's an actual place
    if (!place.geometry || !place.geometry.location) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert(`No details available for input: '${place.name}'`);
      return;
    }
    searchInp.val("");
    addDestination(place, mapOG);
  });
}


function addDestination(placeInp, mapInp) {
  // If the place has a geometry, then present it on a map.
  if (placeInp.geometry.viewport) {
    mapInp.fitBounds(placeInp.geometry.viewport);
  } else {
    mapInp.setCenter(placeInp.geometry.location);
    mapInp.setZoom(17);
  }

  // Create marker
  let placeMark = new google.maps.Marker({
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
  let destination = {
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


function geocodePlaceId(geocoder, map, placeid) {
  geocoder.geocode({ placeId: placeid }, (results, status) => {
    if (status === "OK") {
      if (results[0]) {
        map.setZoom(11);
        map.setCenter(results[0].geometry.location);
        const marker = new google.maps.Marker({
          map,
          position: results[0].geometry.location,
        });
      } else {
        window.alert("No results found");
      }
    } else {
      window.alert(`Geocoder failed due to: ${status}`);
      console.log(results, status);
    }
  });
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

  console.log(routeReq);

  dirRenderServ.setMap(mapOG);
  dirRenderServ.setPanel(directDiv[0]);

  directServ.route(routeReq, (result, status) => {
    dirRenderServ.setDirections(result);
  });

  const gMapUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originObj.place.name)}&origin_place_id=${encodeURIComponent(originPID)}&destination=${encodeURIComponent(destinObj.place.name)}&destination_place_id=${encodeURIComponent(destinPID)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(gMapUrl)}&size=200x200`;
  console.log(qrUrl);
  qrPic.attr("src", qrUrl);
  console.log(qrUrl);
});


/**

https://api.qrserver.com/v1/create-qr-code/?data=https://www.google.com/maps/dir/?api=1&origin=minneapolis&origin_place_id=ChIJvbt3k5Azs1IRB-56L4TJn5M&destination=duluth&destination_place_id=ChIJ_zcueH5SrlIRcgxY63a__ZA&size=200x200
 */

/*
let routeReq = {
  origin: { placeId: "" },
  destination: { placeId: "" },
  travelMode: google.maps.TravelMode.DRIVING
};
const geocoder = new google.maps.Geocoder();
const placeServ = new google.maps.places.PlacesService(mapOG);
const directServ = new google.maps.DirectionsService();
const dirRenderServ = new google.maps.DirectionsRenderer();

dirRenderServ.setMap(mapOG);
dirRenderServ.setPanel($("#panel")[0]);

// const placesServ = new google.maps.Place;
// console.log(placesServ);

const minneapolisSearch = {
  query: "Minneapolis",
  fields: ["name", "place_id"]
};
const duluthSearch = {
  query: "Duluth",
  fields: ["name", "place_id"]
};

placeServ.findPlaceFromQuery(minneapolisSearch, (results, status) => {
  if (status === "OK") {
    if (results[0]) {
      let minneapolisId = results[0].place_id;
      routeReq.origin.placeId = minneapolisId;
      geocodePlaceId(geocoder, mapOG, results[0].place_id,);
    } else {
      window.alert("No results found");
    }
  } else {
    window.alert("PlaceSearch failed due to: " + status);
  }
});
placeServ.findPlaceFromQuery(duluthSearch, (results, status) => {
  if (status === "OK") {
    if (results[0]) {
      let duluthId = results[0].place_id;
      routeReq.destination.placeId = duluthId;
      geocodePlaceId(geocoder, mapOG, results[0].place_id,);
    } else {
      window.alert("No results found");
    }
  } else {
    window.alert("PlaceSearch failed due to: " + status);
  }
});
$("#route").on("click", (event) => {
  directServ.route(routeReq, (result, status) => {
    console.log(result);
    dirRenderServ.setDirections(result);
  });
});
*/


// const userCity = prompt("Enter your city: ");
// const searchRequest = {
//   query: userCity,
//   fields: ["name", "place_id"]
// };
// placeServ.findPlaceFromQuery(searchRequest, (results, status) => {
//   if (status === "OK") {
//     if (results[0]) {
//       console.log(results);
//       geocodePlaceId(geocoder, mapOG, results[0].place_id,);
//     } else {
//       window.alert("No results found");
//     }
//   } else {
//     window.alert("PlaceSearch failed due to: " + status);
//   }
// });
//  Search -> display markers
// let userCity = prompt("Enter your city: ");
// const searchFrom = new google.maps.LatLng(41.863825656627604, -87.80338149007245);
// const searchRequest = {
//   keyword: userCity,
//   location: searchFrom,
//   radius: 200000
// };
// placeServ.nearbySearch(searchRequest, (results, status) => {
//   if (status === "OK") {
//     if (results[0]) {
//       console.log(results);
//       for (let i = 0; i < results.length; i++) {
//         geocodePlaceId(geocoder, mapOG, results[i].place_id);
//       }
//     } else {
//       window.alert("No results found");
//     }
//   } else {
//     window.alert("PlaceSearch failed due to: " + status);
//   }
// });


// This function is called when the user clicks the UI button requesting
// a geocode of a place ID.


/*
google.maps.event.addDomListener(window, 'load', function () {
  var places = new google.maps.places.Autocomplete(document.getElementById('txtFrom'));
  google.maps.event.addListener(places, 'place_changed', function () {
    var place = places.getPlace();
  });
  var places1 = new google.maps.places.Autocomplete(document.getElementById('txtTo'));
  google.maps.event.addListener(places1, 'place_changed', function () {
    var place1 = places1.getPlace();
  });
});

function calculateRoute(rootfrom, rootto) {
  // Center initialized to Naples, Italy
  var myOptions = {
    zoom: 10,
    center: new google.maps.LatLng(40.84, 14.25),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  // Draw the map
  var mapObject = new google.maps.Map(document.getElementById("DivMap"), myOptions);

  var directionsService = new google.maps.DirectionsService();
  var directionsRequest = {
    origin: rootfrom,
    destination: rootto,
    travelMode: google.maps.DirectionsTravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.METRIC
  };
  directionsService.route(
    directionsRequest,
    function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        new google.maps.DirectionsRenderer({
          map: mapObject,
          directions: response
        });
      }
      else
        $("#lblError").append("Unable To Find Root");
    }
  );
}

$(document).ready(function () {
  // If the browser supports the Geolocation API
  if (typeof navigator.geolocation == "undefined") {
    $("#lblError").text("Your browser doesn't support the Geolocation API");
    return;
  }
  $("#calculate-route").submit(function (event) {
    event.preventDefault();
    calculateRoute($("#txtFrom").val(), $("#txtTo").val());
  });
});

*/
