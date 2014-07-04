var map = L.map('map', {
	minZoom: 5,
	maxZoom: 18,
	keyboard: false
}).setView([59.936, 10.76], 16);

L.tileLayer('http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=norges_grunnkart&zoom={z}&x={x}&y={y}', {
	attribution: '&copy; <a href="http://kartverket.no/">Kartverket</a>'
}).addTo(map);

var fancyboxOptions = {
	helpers: { title: { type: 'inside' } }
};

var cluster = new L.MarkerClusterGroup({
    maxClusterRadius: 100,		
	showCoverageOnHover: false,
	zoomToBoundsOnClick: false,
	spiderfyOnMaxZoom: false,
	iconCreateFunction: function(cluster) {
		var iconUrl = cluster.getAllChildMarkers()[0].data.delving_thumbnail[0].replace(/=400/g, '=40');
		return new L.DivIcon({
			className: 'leaflet-marker-cluster',  
			html: '<img src="' + iconUrl + '"><b>' + cluster.getChildCount() + '</b>' 
		});
   	}
}).on('click', function (evt) {
	var data = evt.layer.data;
	$.fancybox(getPhoto(data), fancyboxOptions);	
}).on('clusterclick', function (evt) {
	var photos = evt.layer.getAllChildMarkers(),
		gallery = [];

	for (var i = 0; i < photos.length; i++) {
		var data = photos[i].data;
		gallery.push(getPhoto(data));		
	}

	$.fancybox(gallery, fancyboxOptions);	
});

L.norvegiana({
	params: {
		pt: '59.936,10.76',
		d: 1,
		qf: {
			abm_contentProvider_text: 'DigitaltMuseum'
		}
	},
	iconCreateFunction: function (data) {
		var iconUrl = data.delving_thumbnail[0];	
		return L.icon({
			iconUrl: iconUrl.replace(/=400/g, '=40'),
			iconRetinaUrl: iconUrl.replace(/=400/g, '=80'),
			iconSize: [40, 40],
			className: 'leaflet-marker-image'
		});
	}		
}).load().on('load', function() {
	cluster.addLayer(this);
	map.addLayer(cluster);
});

function getPhoto(data) {
	return {
		type: 'image',
		href: data.delving_thumbnail[0].replace(/=400/g, '=800'),
		title: (data.delving_description ? data.delving_description[0] : '') + ' - Kilde: <a href="' + data.delving_landingPage + '">' + data.delving_collection + '</a>'
	}
}