/* jshint loopfunc: true */
var map;

var markers = [];
// function to appear the map.
function initMap() {
    //Map Stylish
    var styles = [{
            "featureType": "landscape",
            "stylers": [{
                    "hue": "#FFBB00"
                },
                {
                    "saturation": 43.400000000000006
                },
                {
                    "lightness": 37.599999999999994
                },
                {
                    "gamma": 1
                }
            ]
        },
        {
            "featureType": "road.highway",
            "stylers": [{
                    "hue": "#FFC200"
                },
                {
                    "saturation": -61.8
                },
                {
                    "lightness": 45.599999999999994
                },
                {
                    "gamma": 1
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "stylers": [{
                    "hue": "#FF0300"
                },
                {
                    "saturation": -100
                },
                {
                    "lightness": 51.19999999999999
                },
                {
                    "gamma": 1
                }
            ]
        },
        {
            "featureType": "road.local",
            "stylers": [{
                    "hue": "#FF0300"
                },
                {
                    "saturation": -100
                },
                {
                    "lightness": 52
                },
                {
                    "gamma": 1
                }
            ]
        },
        {
            "featureType": "water",
            "stylers": [{
                    "hue": "#0078FF"
                },
                {
                    "saturation": -13.200000000000003
                },
                {
                    "lightness": 2.4000000000000057
                },
                {
                    "gamma": 1
                }
            ]
        },
        {
            "featureType": "poi",
            "stylers": [{
                    "hue": "#00FF6A"
                },
                {
                    "saturation": -1.0989010989011234
                },
                {
                    "lightness": 11.200000000000017
                },
                {
                    "gamma": 1
                }
            ]
        }
    ];
    // Constructor creates a new map - only center and zoom are required.
    // Egypt country.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 30.118470,
            lng: 31.605118
        },
        zoom: 13,
        styles: styles,
        mapTypeControl: true
    });
    ko.applyBindings(new viewModel());
}

////////// markers& info window
// here are the locations to be the markers
//array of locations.
var locations = [{
        title: 'BUE',
        location: {
            lat: 30.118262,
            lng: 31.607959
        }
    },
    {
        title: 'Future City',
        location: {
            lat: 30.165261,
            lng: 31.551141
        }
    },
    {
        title: 'El Shorouk Academy',
        location: {
            lat: 30.136634,
            lng: 31.605140
        }
    },
    {
        title: 'International medical center(Egypt)',
        location: {
            lat: 30.195807,
            lng: 31.654267
        }
    },
    {
        title: 'Almazah',
        location: {
            lat: 30.104853,
            lng: 31.330033
        }
    },
    {
        title: 'St. Fatima',
        location: {
            lat: 30.058556,
            lng: 31.333690
        }
    },
    {
        title: 'Heliopolis Sporting Club',
        location: {
            lat: 30.087413,
            lng: 31.317832
        }
    }
];

// View Model
var viewModel = function() {
    var self = this;
    self.location = ko.observableArray();
    self.marker = ko.observable();
    self.markerTrigger = ko.observable();
    self.search = ko.observable('');
    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds(); //Fit everything that appear on the page 

    // appear all markers in their positions 
    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        self.marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP
        });
        // Push the marker to our array of markers.
        markers.push(self.marker);
        // Store id & title to each marker in the location array.
        self.location.push({
            id: i,
            title: locations[i].title
        });
        // Create an onclick event to open an infowindow at each marker.
        self.marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
            toggleBounce(this); // Apply marker bouncing function.

        }, self);
        //extend the bounds to include each marker's position
        bounds.extend(markers[i].position);
    }
    // The Filter function using the amazing subscribe function.
    self.search.subscribe(function(search) {
        // Make the location array empty at first.
        self.location.removeAll();
        for (var i in locations) {
            // Do the comparing.        
            if (locations[i].title.toLowerCase().includes(search.toLowerCase())) {
                // When write the title in the text box see if the stored title found 
                // push its id & title to the location array .
                self.location.push({
                    id: i,
                    title: locations[i].title
                });
                // Appear only markers as the search result.
                markers[i].setMap(map);
            } else
                markers[i].setMap(null);
        }
    });
    // When click on a location from the list 
    //Display the same marker clicked job.
    self.markerTrigger = function(marker) {
        google.maps.event.trigger(markers[marker.id], 'click');
    };
    // The map fit itself
    map.fitBounds(bounds);
};


// Marker bouncing
function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        // Stop marker bouncing animation after about 5 sec.
        setTimeout(function() {
            marker.setAnimation(null);
        }, 5000);
    }
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.setMarker = null;
        });

        // Wikipedia API
        var $wikiElem = $('#wikipedia-links');
        // clear out old data before new request
        $wikiElem.text("");

        // load wikipedia data
        var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title +
            '&format=json&callback=wikiCallback';
        // this var will stop the request if it runs for more than 1.5 seconds (Error Handling with Json P).
        var wikiRequestTimeout = setTimeout(function() {
            alert("failed to get wikipedia resources");
        }, 1500);

        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
            jsonp: "callback",
            success: function(response) {
                var articleList = response[1];

                for (var i = 0; i < 1; i++) {
                    articleStr = articleList[i];
                    var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                    infowindow.setContent('<div><strong>' + marker.title + '</strong></div>' + '<li><a href="' + url + '">' + articleStr + '</a></li>');
                    console.log(response);
                }
                // stop timeout from happening 
                clearTimeout(wikiRequestTimeout);
            },
        });
        return false;
    }
}
// If the map not loading
function mapError() {
    alert("Oops! unfortunately map is not loading check your connection then try again.");
}


