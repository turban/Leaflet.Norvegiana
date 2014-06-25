L.Norvegiana = L.FeatureGroup.extend({
	options: {
		api: 'http://kulturnett2.delving.org/api/search',
		markerOptions: {}	
	},

	// Default Norvegiana API params
	norvegiana: {
		query: '*:*',
		format: 'jsonp',
		rows: 500
	},

	initialize: function (options) {	
		options = L.setOptions(this, options);
		L.FeatureGroup.prototype.initialize.call(this);
	},

	onAdd: function (map) {
		this._load(this._getUrl(), L.bind(this._onLoad, this));
		L.FeatureGroup.prototype.onAdd.call(this, map);
	},

	load: function () {
		this._load(this._getUrl(), L.bind(this._onLoad, this));
		return this;
	},

	// Load data from Norvegiana API
	_load: function (url, callback) {
		reqwest({
			url: url,
			type: 'jsonp', 
			success: callback
		});
	},

	_onLoad: function (data) {
		if (data.result && data.result.items) {
			this._parse(data.result.items);
		}
		this.fire('load');
	},

	// Parse Norvegiana API response
	_parse: function (items) {
		var options = this.options;

		for (var i = 0, len = items.length; i < len; i++) {
			var data = items[i].item.fields;
			
			// Check if item is geolocated
			if (data.abm_latLong) {
				var latlng = data.abm_latLong[0].split(','),
					id     = data.delving_hubId[0],
					marker;

				if (options.iconCreateFunction) {
					marker =  L.marker(latlng, L.extend({
						icon: options.iconCreateFunction(data)
					}, this.options.markerOptions));
				} else {
					marker = L.marker(latlng, this.options.markerOptions);
				}

				// Store id not to add layer more than once
				marker._leaflet_id = id;
				marker.data = data;
				this.addLayer(marker);
			}
		}	
	},

	// Get Norvegiana API url
	_getUrl: function (params) {
		return this.options.api + L.Util.getParamString(this._getParams(params));
	},

	// Get Norvegiana API params object
	_getParams: function (params) {
		params = L.extend({}, this.norvegiana, this.options.params, params || {});
		if (params.qf && typeof params.qf !== 'string') {
			params.qf = this._getFilterString(params.qf);
		}		
		return params;
	},

	// Translate params filter object to string
	_getFilterString: function (obj) {
		var qf = [];
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				qf.push('qf=' + key + ':' + obj[key]);
			}
		}
		return qf.join('&').slice(3);
	}

});

L.norvegiana = function (options) {
	return new L.Norvegiana(options);
}; 