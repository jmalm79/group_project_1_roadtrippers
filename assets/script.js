
// Create the script tag, set the appropriate attributes
// This initializes the google maps API thing
var script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
script.async = true;

document.head.appendChild(script);

// Global Variables
var mapOG;


// Append the 'script' element to 'head'


// Attach your callback function to the `window` object
function initMap() {
  let routeReq = {
    origin: { placeId: "" },
    destination: { placeId: "" },
    travelMode: google.maps.TravelMode.DRIVING
  };
  mapOG = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 44.977753, lng: -93.2650108 },
    zoom: 8,
  });
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
}

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
