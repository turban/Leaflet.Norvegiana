var map = L.map('map', {
	minZoom: 5,
	maxZoom: 16
}).fitBounds([[60.5, 6.4], [60.87, 8]]);
		
var sidebar = L.control.sidebar('sidebar', {
	closeButton: true,
	position: 'left'
});
map.addControl(sidebar);

L.tileLayer('http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo2&zoom={z}&x={x}&y={y}', {
	attribution: '&copy; <a href="http://kartverket.no/">Kartverket</a>'
}).addTo(map);

var template = '<h2>{delving_title}</h2><img src="{delving_thumbnail}" width="100%"><p>{delving_description}</p><p>Kilde: <a href="{delving_landingPage}">{delving_collection}</a>';

var cluster = new L.MarkerClusterGroup({
    maxClusterRadius: 55,		
	showCoverageOnHover: false
}).on('click', function (evt) {
	sidebar.setContent(L.Util.template(template, evt.layer.data)).show();
}).on('clusterclick', function (evt) {
   	sidebar.hide();
});

L.norvegiana({
	params: {
		qf: {
			abm_classification_text: 'Rallarvegen'
		}
	}
}).load().on('load', function() {
	cluster.addLayer(this);
	map.addLayer(cluster);
});