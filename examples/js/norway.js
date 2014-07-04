var map = L.map('map', {
	minZoom: 5,
	maxZoom: 16
}).fitBounds([[60.5, 6.4], [60.87, 8]]);
		
L.tileLayer('http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo2&zoom={z}&x={x}&y={y}', {
	attribution: '&copy; <a href="http://kartverket.no/">Kartverket</a>'
}).addTo(map);

var norvegiana = L.norvegiana().addTo(map);


map.on('click', function(evt, b,c) {
	console.log('click', evt.latlng);

	norvegiana.load({ 
		latlng: evt.latlng,
		//pt: '59.936,10.76', 
		d: 10, 
		rows: 500
	});

});