// Mixin with shared options and methods
L.Norvegiana = {

	// Load data from Norvegiana API
	_load: function (url, callback) {
		reqwest({
			url: url,
			type: 'jsonp', 
			success: function (data) {
				if (data.result) {
					callback(data.result);
				}
			}
		});
	},

	_onLoad: function (data) {
		this._parse(data.items, this.addLayer);
	},

	// Parse Norvegiana API response
	_parse: function (items, callback) {
		for (var i = 0, len = items.length; i < len; i++) {
			var item   = items[i].item.fields,
				id     = item.delving_hubId[0],
				latlng = item.abm_latLong[0].split(','),
				marker = L.marker(latlng, {
					//item: this._stringify(item)
					item: item
				});

			// Store id not to add layer more than once
			marker._leaflet_id = id;
			callback.call(this, marker);
		}	
	},

	// Get Norvegiana API url
	_getUrl: function (params) {
		return this.options.api + L.Util.getParamString(this._getParams(params));
	},

	// Get Norvegiana API params object
	_getParams: function (params) {
		params = L.extend(L.extend(L.extend({}, this.norvegiana), this.options.params), params || {});
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
	},

	// Translate array properties to strings
	_stringify: function (item) {
		for (var key in item) {
			if (item.hasOwnProperty(key)) {
				item[key] = item[key].join(', ');
			}
		}
		return item;
	}	

};

L.Norvegiana.FeatureGroup = L.FeatureGroup.extend({
	includes: L.Norvegiana,

	options: {
		api: 'http://kulturnett2.delving.org/api/search',		
	},

	// Default Norvegiana API params
	norvegiana: {
		query: '*:*',
		format: 'jsonp',
		rows: 100
	},

	initialize: function (options) {	
		options = L.setOptions(this, options);	
		L.FeatureGroup.prototype.initialize.call(this);
	},

	onAdd: function (map) {
		this._load(this._getUrl(), L.bind(this._onLoad, this));
		L.FeatureGroup.prototype.onAdd.call(this, map);
	}

});

L.Norvegiana.GridLayer = L.GridLayer.extend({
	includes: L.Norvegiana,

	options: {
		api: 'http://kulturnett2.delving.org/api/search',
		tileSize: 512,
		layer: L.featureGroup(),
		unloadInvisibleTiles: false		
	},

	// Default Norvegiana API params
	norvegiana: {
		query: '*:*',
		format: 'jsonp',
		rows: 100,
		geoType: 'bbox'
	},	

	initialize: function (options) {
		L.Util.setOptions(this, options);
		this._tiles = {};
		this._markers = {};
	},

	onAdd: function (map) {
		this.options.layer.addTo(map);
		L.GridLayer.prototype.onAdd.call(this, map);
	},

	_onLoad: function (data) {
		var layer = this.options.layer, 
			markers = [];
		
		this._parse(data.items, function(marker) {
			var id = marker._leaflet_id;
			if (!this._markers[id]) {
				if (!layer.addLayers) { // FeatureGroup
					layer.addLayer(marker);
				} else { // MarkerClusterGroup
					markers.push(this._markers[id] = marker);
				}
			}
		});

		if (layer.addLayers) { // MarkerClusterGroup
			layer.addLayers(markers);
		}
	},

	_addTile: function (coords, container) {
		var bounds = this._tileCoordsToBounds(coords),
			center = bounds.getCenter(),
			radius = center.distanceTo([center.lat, bounds.getWest()]) / 1000,
			url    = this._getUrl({ pt: center.lat + ',' + center.lng, d: radius }),
			self   = this;

		//this._load(url, L.bind(this._onLoad, this));
		this._load(url, function(data) {
			self._onLoad(data)
			self.fire('tileload', {tile: url});
			self._tilesToLoad--;
			if (self._tilesToLoad === 0) {
				self._visibleTilesReady();
			}
		});

		// Save tile in cache
		this._tiles[this._tileCoordsToKey(coords)] = url;
		this.fire('tileloadstart', {tile: url});
	},

	_reset: function (e) {
		this._tilesToLoad = 0;
		this._tilesTotal = 0;
		this._tileNumBounds = this._getTileNumBounds();
		this._resetWrap(); // Needed?
	}	
});

L.norvegiana = function (options) {
	if (options.params && options.params.pt) {
		if (options.cluster) {
			return new L.Norvegiana.MarkerClusterGroup(options);	
		} else {  
			return new L.Norvegiana.FeatureGroup(options);	
		}	
	} else {
		return new L.Norvegiana.GridLayer(options);				
	}
};

L.norvegiana.featureGroup = function (options) {
	return new L.Norvegiana.FeatureGroup(options);	
};

L.norvegiana.gridLayer = function (options) {
	return new L.Norvegiana.GridLayer(options);	
};

if (L.MarkerClusterGroup) {
	L.Norvegiana.MarkerClusterGroup = L.MarkerClusterGroup.extend({
		includes: L.Norvegiana,

		options: {
			api: 'http://kulturnett2.delving.org/api/search'
		},

		// Default Norvegiana API params
		norvegiana: {
			query: '*:*',
			format: 'jsonp',
			rows: 100
		},

		onAdd: function (map) {
			this._load(this._getUrl(), L.bind(this._onLoad, this));
			L.MarkerClusterGroup.prototype.onAdd.call(this, map);
		},

		_onLoad: function (data) {
			var markers = [];
			this._parse(data.items, function(marker) {
				markers.push(marker);
			});
			this.addLayers(markers);
		}		

	});

	L.norvegiana.markerClusterGroup = function (options) {
		return new L.Norvegiana.MarkerClusterGroup(options);	
	};
}