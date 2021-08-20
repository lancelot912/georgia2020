//First Create Variables
var attSel = 'NativeAmerican'
var yearSel = ''
var attyear = attSel+yearSel
var data = demoData;
var mapboxAtt = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    mapboxUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGFuY2VsYXphcnRlIiwiYSI6ImNrcDIyZHN4bzAzZTEydm8yc24zeHNodTcifQ.ydwAELOsAYya_MiJNar3ow';

var Light = L.tileLayer(mapboxUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mapboxAtt}),
    Dark = L.tileLayer(mapboxUrl, {id: 'mapbox/dark-v9', tileSize: 512, zoomOffset: -1, attribution: mapboxAtt}),    
    Streets = L.tileLayer(mapboxUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mapboxAtt});

var map = L.map('map', {
      zoomControl: false
  });
  
  map.setView([32.713363, -82.952016], 7);
  L.tileLayer(mapboxUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mapboxAtt}).addTo(map);
  
  //Custom zoom bar control that includes a Zoom Home function
  L.Control.zoomHome = L.Control.extend({
      options: {
          position: 'topleft',
          zoomInText: '+',
          zoomInTitle: 'Zoom In',
          zoomOutText: '-',
          zoomOutTitle: 'Zoom Out',
          zoomHomeText: ' ',
          zoomHomeTitle: 'Return Home'
      },
  
      onAdd: function (map) {
          var controlName = 'gin-control-zoom',
              container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
              options = this.options;
  
          this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
          controlName + '-in', container, this._zoomIn);
          this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
          controlName + '-out', container, this._zoomOut);
          this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
          controlName + '-home', container, this._zoomHome);
  
          this._updateDisabled();
          map.on('zoomend zoomlevelschange', this._updateDisabled, this);
  
          return container;
      },
  
      onRemove: function (map) {
          map.off('zoomend zoomlevelschange', this._updateDisabled, this);
      },
  
      _zoomIn: function (e) {
          this._map.zoomIn(e.shiftKey ? 3 : 1);
      },
  
      _zoomOut: function (e) {
          this._map.zoomOut(e.shiftKey ? 3 : 1);
      },
  
      _zoomHome: function (e) {
          map.setView([32.713363, -82.952016], 7);
      },
  
      _createButton: function (html, title, className, container, fn) {
          var link = L.DomUtil.create('a', className, container);
          link.innerHTML = html;
          link.href = '#';
          link.title = title;
  
          L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
              .on(link, 'click', L.DomEvent.stop)
              .on(link, 'click', fn, this)
              .on(link, 'click', this._refocusOnMap, this);
  
          return link;
      },
  
      _updateDisabled: function () {
          var map = this._map,
              className = 'leaflet-disabled';
  
          L.DomUtil.removeClass(this._zoomInButton, className);
          L.DomUtil.removeClass(this._zoomOutButton, className);
  
          if (map._zoom === map.getMinZoom()) {
              L.DomUtil.addClass(this._zoomOutButton, className);
          }
          if (map._zoom === map.getMaxZoom()) {
              L.DomUtil.addClass(this._zoomInButton, className);
          }
      }
  });
  // Add the new control to the map
  var zoomHome = new L.Control.zoomHome();
  zoomHome.addTo(map);

var baseLayers = {
  "Light": Light,
  "Dark": Dark,
  "Streets": Streets};

L.control.layers(baseLayers).addTo(map);

// control that shows state info on hover
var info = L.control({position:'bottomright'});

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel + 'Number of Native American Voters</h4>' + '<h5>' +  (props ?
			'<b>' + props[attyear] + '' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
	};

	info.addTo(map);

var georgiaNHjson = L.geoJson(demoData, {
		style: nhstyle,
		onEachFeature: function(feature, marker) {
			marker.bindPopup('<h4>' + feature.properties.NAME10+'</h4>');
		}
	});
	
var tractjson = new L.geoJson(demoData, {
		style: tractstyle,
		onEachFeature: onEachFeature
	});
	
var nhSearch = new L.Control.Search({		
		layer:georgiaNHjson,
		propertyName: "NAME10",
		marker: false,
		moveToLocation: function(latlng, title, map) {
			var zoom = map.getBoundsZoom(latlng.layer.getBounds());
			map.setView(latlng, zoom);
		}
	});
	
	nhSearch.on('search:locationfound', function(e) {
		e.layer.setStyle({filleColor: '#3f0', color: '#0f0'});
		if(e.layer._popup)
			e.layer.openPopup();
	}).on('search:collapsed',function(e) {
		
		georgiaNHjson.eachLayer(function(layer) {
			georgiaNHjson.resetStyle(layer);
		});
	});

	map.addControl( nhSearch );
	map.addLayer(georgiaNHjson);
	map.addLayer(tractjson);
	
var legend = L.control({position: 'bottomleft'});

	legend.onAdd = function (map) {

var legdiv = L.DomUtil.create('div', 'info legend'),
			grades = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
			labels = [],
			from, to;

	for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1]-1;
			labels.push(
				'<i style="background:' + getColorNative(from + 1) + '"></i> ' +
						 from + (to ? ''+'&ndash;' + to + '' : '+'));
		}

	legdiv.innerHTML = labels.join('<br>');
		return legdiv;
	};
	
	legend.addTo(map);
	
var attDD = L.control({position: 'topright'});
	attDD.onAdd = function (map) {
// this will create the drop down which will allow the user to select a voter demographic by race		
var attdiv = L.DomUtil.create('div', 'info attDD');
    attdiv.innerHTML = '<h4>Select Attribute</h4><select id="attOpt"><option value = "NativeAmerican">Native American Voters</option><option value = "Asian">Asian/Pacific Voters</option><option value = "Black">Black Non-Hispanic Voters</option><option value = "Hispanic">Hispanic Voters</option><option value = "White">White Non-Hispanic Voters</option><option value = "Unknown">Unknown Voters</option></select>';
    attdiv.firstChild.onmousedown = attdiv.firstChild.ondblclick = L.DomEvent.stopPropagation;
		return attdiv;
		};
	attDD.addTo(map);
	
//var yearDD = L.control({position: 'topright'});
//		yearDD.onAdd = function (map) {
//var yeardiv = L.DomUtil.create('div', 'info yearDD');
//	yeardiv.innerHTML = '<h4>Select Year</h4><select id="yearOpt"><option value="2010">2010</option><option value="2017">2017</option><option value = "Change">Change</option></select>';
//	yeardiv.firstChild.onmousedown = yeardiv.firstChild.ondblclick = L.DomEvent.stopPropagation;
//		return yeardiv;
//	};
//	yearDD.addTo(map);

//Create Functions
//Color functions
function getColorBach(d) {
		return  d >= 10000 ? '#BF0F00' :
				d > 9000  ? '#BF065B' :
				d > 8000  ? '#C00DBF' :
				d > 7000  ? '#6413C0' :
				d > 6000  ? '#1A27C1' :
				d > 5000  ? '#2183C2' :
				d > 4000  ? '#28C2AB' :
				d > 3000  ? '#2FC35D' :
				d > 2000  ? '#56C336' :
				d > 1000  ? '#A4C43D' :
				'#c4bbbb';
	}
function getColorWhBl (d) {
	return  d >= 300000 ? '#BF0F00' :
			d > 250000  ? '#BF065B' :
			d > 200000	? '#C00DBF' :
			d > 150000  ? '#6413C0' :
			d > 50000   ? '#1A27C1' :
			d > 25000   ? '#2183C2' :
			d > 15000   ? '#28C2AB' :
			d > 5000   ? '#2FC35D' :
			d > 2000    ? '#56C336' :
			d > 1000    ? '#A4C43D' :
			'#c4bbbb';
}	
	
function getColorHome (d) {
		return  d >= 10000 ? '#BF0F00' :
				d > 9000  ? '#BF065B' :
				d > 8000  ? '#C00DBF' :
				d > 7000  ? '#6413C0' :
				d > 6000  ? '#1A27C1' :
				d > 5000  ? '#2183C2' :
				d > 4000  ? '#28C2AB' :
				d > 3000  ? '#2FC35D' :
				d > 2000  ? '#56C336' :
				d > 1000  ? '#A4C43D' :
				'#c4bbbb';
	}
	
	
function getColorIncome (d) {
		return  d >= 100000 ? '#BF0F00' :
				d > 90000  ? '#BF065B' :
				d > 80000  ? '#754C00' :
				d > 70000  ? '#A36A00' :
				d > 60000  ? '#A36A00' :
				d > 50000  ? '#D18700' :
				d > 40000  ? '#FFA500' :
				d > 30000  ? '#FFB52E' :
				d > 20000  ? '#FFC55C' :
				d > 10000  ? '#FFC55C' :
				'#c4bbbb';
	}

function getColorNative(d) {
		return  d >= 1000 ? '#BF0F00' :
				d > 900  ? '#BF065B' :
				d > 800  ? '#C00DBF' :
				d > 700  ? '#6413C0' :
				d > 600  ? '#1A27C1' :
				d > 500  ? '#2183C2' :
				d > 400  ? '#28C2AB' :
				d > 300  ? '#2FC35D' :
				d > 200  ? '#56C336' :
				d > 100  ? '#A4C43D' :
				'#c4bbbb';
	}
	

//Styles for tracts initialized with Bachelors stats
function tractstyle(feature) {
		if(attSel == "NativeAmerican"){
			var color = getColorNative(feature.properties[attSel])
			}
		if(attSel == "Asian"){
			var color = getColorHome(feature.properties[attSel])
			}
		if(attSel == "Black"){
			var color = getColorWhBl(feature.properties[attyear])
			if(yearSel == 'Change'){
				var color = getColorIChange(feature.properties[attyear])}}
        if(attSel == "Hispanic"){
			var color = getColorBach(feature.properties[attyear])
			if(yearSel == 'Change'){
				var color = getColorIChange(feature.properties[attyear])}}
        if(attSel == "White"){
			var color = getColorWhBl(feature.properties[attyear])
			if(yearSel == 'Change'){
				var color = getColorIChange(feature.properties[attyear])}}
        if(attSel == "Unknown"){
                var color = getColorHome(feature.properties[attSel])
                }
		return {
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 20,//.07
			fillColor: color
		};
	}
//Style for Neighborhoods
function nhstyle(feature) {
		return {
			opacity: 20
		};
	}
	
function highlightFeature(e) {
		var layer = e.target;

		layer.setStyle({
			weight: 5,
			color: '#666',
			dashArray: '',
			fillOpacity: 0.7
		});

		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
		}

		info.update(layer.feature.properties);
	}

function resetHighlight(e) {
		tractjson.resetStyle(e.target);
		console.log(e.target);
		info.update();
	}

function zoomToFeature(e) {
		map.fitBounds(e.target.getBounds());
	}

function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: zoomToFeature
		});
	}
	
function updateMap(map,att,year){
	yearSel = year;
	attSel = att;
	attyear = attSel + yearSel;
	var findLayers = new L.layerGroup();
	map.eachLayer(function(layer){
		findLayers.addLayer(layer);
		if(layer.feature && layer.feature.properties[attyear]){
			var props = layer.feature.properties;
			if(attSel == 'NativeAmerican'){
			legend.onAdd = function (map) {
				var legdiv = L.DomUtil.create('div', 'info legend'),
					grades = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
					labels = [],
					from, to;

				for (var i = 0; i < grades.length; i++) {
					from = grades[i];
					to = grades[i + 1]-1;
					labels.push(
						'<i style="background:' + getColorNative(from + 1) + '"></i> ' +
						 from + (to ? ''+'&ndash;' + to + '' : ''));
					}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					
				var color = getColorNative(props[attyear]);

				if(yearSel == 'Change'){ ///was "asian"
						legend.onAdd = function (map) {
							var legdiv = L.DomUtil.create('div', 'info legend'),
								grades = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500],
								labels = [],
								from, to;

							for (var i = 0; i < grades.length; i++) {
								from = grades[i];
								to = grades[i + 1]-1;
								labels.push(
								'<i style="background:' + getColorBach(from + 1) + '"></i> ' +
								from + (to ? '%'+'&ndash; ' + to + '%' : '%+'));
						}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					var color = getColorBach(props[attyear]);
				}}
				
				if(attSel == 'Asian'){
					legend.onAdd = function (map) {
				var legdiv = L.DomUtil.create('div', 'info legend'),
					grades = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],
					labels = [],
					from, to;

				for (var i = 0; i < grades.length; i++) {
					from = grades[i];
					to = grades[i + 1];//-1
					labels.push(
						'<i style="background:' + getColorHome(from + 1) + '"></i> ' +
						 from + (to ? '&ndash;' + to : '+'));
					}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					
				var color = getColorHome(props[attyear]);
				
				if(yearSel == 'Change'){
						legend.onAdd = function (map) {
							var legdiv = L.DomUtil.create('div', 'info legend'),
								grades = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],
								labels = [],
								from, to;

							for (var i = 0; i < grades.length; i++) {
								from = grades[i];
								to = grades[i + 1]-1;
								labels.push(
									'<i style="background:' + getColorHChange(from + 1) + '"></i> ' +
									from + (to ? '&ndash; ' + to : '+'));
						}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					var color = getColorHChange(props[attyear]);
				}}
				
				if(attSel == 'Black'){
					legend.onAdd = function (map) {
				var legdiv = L.DomUtil.create('div', 'info legend'),
					grades = [0, 1000, 2000, 5000, 15000, 25000, 50000, 150000, 200000, 250000, 300000],
					labels = [],
					from, to;

				for (var i = 0; i < grades.length; i++) {
					from = grades[i];
					to = grades[i + 1];
					labels.push(
						'<i style="background:' + getColorWhBl(from + 1) + '"></i> ' +
						 from + (to ? '&ndash;' + to : '+'));
					}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					
				var color = getColorWhBl(props[attyear]);
				
				if(yearSel == 'Change'){
						legend.onAdd = function (map) {
							var legdiv = L.DomUtil.create('div', 'info legend'),
								grades = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],
								labels = [],
								from, to;

							for (var i = 0; i < grades.length; i++) {
								from = grades[i];
								to = grades[i + 1]-1;
								labels.push(
									'<i style="background:' + getColorIChange(from + 1) + '"></i> ' +
									from + (to ? '&ndash; ' + to : '+'));
						}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					var color = getColorIChange(props[attyear]);
				}}
                
                if(attSel == 'Hispanic'){
					legend.onAdd = function (map) {
				var legdiv = L.DomUtil.create('div', 'info legend'),
					grades = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],
					labels = [],
					from, to;

				for (var i = 0; i < grades.length; i++) {
					from = grades[i];
					to = grades[i + 1];
					labels.push(
						'<i style="background:' + getColorHome(from + 1) + '"></i> ' +
						 from + (to ? '&ndash;' + to : '+'));
					}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					
				var color = getColorHome(props[attyear]);
				
				if(yearSel == 'Change'){
						legend.onAdd = function (map) {
							var legdiv = L.DomUtil.create('div', 'info legend'),
								grades = [0, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000],
								labels = [],
								from, to;

							for (var i = 0; i < grades.length; i++) {
								from = grades[i];
								to = grades[i + 1]-1;
								labels.push(
									'<i style="background:' + getColorIChange(from + 1) + '"></i> ' +
									from + (to ? '&ndash; ' + to : '+'));
						}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					var color = getColorIChange(props[attyear]);
				}}
            
				
            if(attSel == 'White'){
					legend.onAdd = function (map) {
				var legdiv = L.DomUtil.create('div', 'info legend'),
					grades = [0, 1000, 2000, 5000, 15000, 25000, 50000, 150000, 200000, 250000, 300000],
					labels = [],
					from, to;

				for (var i = 0; i < grades.length; i++) {
					from = grades[i];
					to = grades[i + 1];
					labels.push(
						'<i style="background:' + getColorWhBl(from + 1) + '"></i> ' +
						 from + (to ? '&ndash;' + to : '+'));
					}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					
				var color = getColorWhBl(props[attyear]);
				
				}
				if(attSel == 'Unknown'){
					legend.onAdd = function (map) {
				var legdiv = L.DomUtil.create('div', 'info legend'),
					grades = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],
					labels = [],
					from, to;

				for (var i = 0; i < grades.length; i++) {
					from = grades[i];
					to = grades[i + 1];
					labels.push(
						'<i style="background:' + getColorHome(from + 1) + '"></i> ' +
						 from + (to ? '&ndash;' + to : '+'));
					}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					
				var color = getColorHome(props[attyear]);
				
				}
				
				legend.remove();
				legend.addTo(map);
			var options = {
					weight: 2,
					opacity: 1,
					color: 'white',
					dashArray: '3',
					fillOpacity: 0.7,
					fillColor: color
			};
			layer.setStyle(options);
			layer.on({
				mouseover: highlightFeature,
				mouseout: resetHighlight,
				click: zoomToFeature
			});
			layer.redraw();
			layer.addTo(map);
		};
	});
};
	
//Jquery
$('#yearOpt').change(function(){
		yearID = document.getElementById('yearOpt');
		yearVal = yearID.options[yearID.selectedIndex].value;
		updateMap(map,attSel,yearVal);
		if(attSel == 'NativeAmerican'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Number of Native American Voters</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'Asian'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Number of Asian Voters</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'Black'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Number of Black Voters</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
        if(attSel == 'Hispanic'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Number of Hispanic Voters</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel]  + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'White'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Number of White Voters</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'Unknown'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Number of Unknown Voters</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		info.remove();
		info.addTo(map);
	})

$('#attOpt').change(function(){
		attID = document.getElementById('attOpt');
		attVal = attID.options[attID.selectedIndex].value;
		updateMap(map,attVal,yearSel);
		console.log(attyear);
		if(attSel == 'NativeAmerican'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Number of Native American Voters</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '%' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'Asian'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Number of Asian Voters</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'Black'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Number of Black Voters</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
        if(attSel == 'Hispanic'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Number of Hispanic Voters</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel]  + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'White'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Number of White Voters</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'Unknown'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Number of Unknown Voters</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '</b><br />' +  'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		info.remove();
		info.addTo(map)
		
	})

	