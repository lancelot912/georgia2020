//First Create Variables
var attSel = 'PC_no_hs'
var yearSel = ''
var attyear = attSel+yearSel
var data = edStats;
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
		this._div.innerHTML = '<h4>'+ yearSel + ' Percentage of No Highschool Education</h4>' + '<h5>' +  (props ?
			'<b>' + props[attyear] + '%' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover over a County') +'</h5>';
	};

	info.addTo(map);

var georgiajson = L.geoJson(data, {
		style: nhstyle,
		onEachFeature: function(feature, marker) {
			marker.bindPopup('<h4>' + feature.properties.NAME10+'</h4>');
		}
	});
	
var georgiatract = new L.geoJson(data, {
		style: tractstyle,
		onEachFeature: onEachFeature
	});
	
var nhSearch = new L.Control.Search({		
		layer:georgiajson,
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
	
	map.addLayer(georgiajson);
	map.addLayer(georgiatract);
	
var legend = L.control({position: 'bottomleft'});

	legend.onAdd = function (map) {

var legdiv = L.DomUtil.create('div', 'info legend'),
			grades = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			labels = [],
			from, to;

	for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1]; //-1
			labels.push(
				'<i style="background:' + getColorHS(from + 1) + '"></i> ' +
				from + (to ? '%'+'&ndash;' + to + '%' : '%'));
		}

	legdiv.innerHTML = labels.join('<br>');
		return legdiv;
	};
	
	legend.addTo(map);
	
var attDD = L.control({position: 'topright'});
	attDD.onAdd = function (map) {
		
var attdiv = L.DomUtil.create('div', 'info attDD');
    attdiv.innerHTML = '<h4>Select Attribute</h4><select id="attOpt"><option value = "PC_no_hs">No High School Education %</option><option value = "PC_BachMore">Bachelors or Above %</option><option value = "PC_AtleastHS">Attended High School %</option></select>';
    attdiv.firstChild.onmousedown = attdiv.firstChild.ondblclick = L.DomEvent.stopPropagation;
		return attdiv;
		};
	attDD.addTo(map);
	
//var yearDD = L.control({position: 'topright'});
//		yearDD.onAdd = funct (map) {
//var yeardiv = L.DomUtil.create('div', 'info yearDD');
//	yeardiv.innerHTML = '<h4>Select Year</h4><select id="yearOpt"><option value="2010">2010</option><option value="2017">2017</option><option value = "Change">Change</option></select>';
//	yeardiv.firstChild.onmousedown = yeardiv.firstChild.ondblclick = L.DomEvent.stopPropagation;
//		return yeardiv;
//	};
//	yearDD.addTo(map);

//Create Functions
//Color functions
function getColorHS(d) {
		return  d >= 10 ? '#BF0F00' :
				d > 9  ? '#67001F' :
				d > 8  ? '#980043' :
				d > 7  ? '#CE1256' :
				d > 6  ? '#E7298A' :
				d > 5  ? '#DF65B0' :
				d > 4  ? '#C994C7' :
				d > 3  ? '#D4B9DA' :
				d > 2  ? '#E7E1EF' :
				d > 1  ? '#F7F4F0' :
				'#F9F3E0';
	}
function getColorBach(d) {
	return  d >= 100 ? '#BF0F00' :
			d > 90  ? '#BF065B' :
			d > 80  ? '#C00DBF' :
			d > 70  ? '#6413C0' :
			d > 60  ? '#1A27C1' :
			d > 50  ? '#2183C2' :
			d > 40  ? '#28C2AB' :
			d > 30  ? '#2FC35D' :
			d > 20  ? '#56C336' :
			d > 10  ? '#A4C43D' :
			'#C59E44';
}	
function getColorGreen(d) {
	return  d >= 100 ? '#00441B' : 
			d > 90   ? '#006D2C' : 
			d > 80   ? '#238B45' : 
			d > 70   ? '#41AE76' :
			d > 60   ? '#66C294' :
			d > 50   ? '#99D8C9' :
			d > 40 	 ? '#CCECE6' :
			d > 30   ? '#E5F5F9' :
			d > 20   ? '#D5E0C0' :
			d > 10   ? '#ECF1E2' : 
			'#ffffff'; 
}
	

//Styles for tracts initialized with Bachelors stats
function tractstyle(feature) {
		if(attSel == "PC_no_hs"){
			var color = getColorHS(feature.properties[attSel])
			}
		if(attSel == "PC_BachMore"){
			var color = getColorBach(feature.properties[attSel])
			}
		if(attSel == "PC_AtleastHS"){
			var color = getColorGreen(feature.properties[attyear])
			if(yearSel == 'Change'){
				var color = getColorIChange(feature.properties[attyear])}}
		return {
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 20, //.7
			fillColor: color
		};
	}
//Style for Neighborhoods
function nhstyle(feature) {
		return {
			opacity: 0
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
		georgiatract.resetStyle(e.target);
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
			if(attSel == 'PC_no_hs'){
			legend.onAdd = function (map) {
				var legdiv = L.DomUtil.create('div', 'info legend'),
					grades = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
					labels = [],
					from, to;

				for (var i = 0; i < grades.length; i++) {
					from = grades[i];
					to = grades[i + 1]; //-1
					labels.push(
						'<i style="background:' + getColorHS(from + 1) + '"></i> ' +
						 from + (to ? '%'+'&ndash;' + to + '%' : '%'));
					}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					
				var color = getColorHS(props[attyear]);
				if(yearSel == 'Change'){
						legend.onAdd = function (map) {
							var legdiv = L.DomUtil.create('div', 'info legend'),
								grades = [-10, 0, 5, 10, 15, 20, 25, 30, 35],
								labels = [],
								from, to;

							for (var i = 0; i < grades.length; i++) {
								from = grades[i];
								to = grades[i + 1]-1;
								labels.push(
								'<i style="background:' + getColorBachChange(from + 1) + '"></i> ' +
								from + (to ? '%'+'&ndash;' + to + '%' : '%'));
						}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					var color = getColorBachChange(props[attyear]);
				}}
				
				if(attSel == 'PC_BachMore'){
					legend.onAdd = function (map) {
				var legdiv = L.DomUtil.create('div', 'info legend'),
					grades = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
					labels = [],
					from, to;

				for (var i = 0; i < grades.length; i++) {
					from = grades[i];
					to = grades[i + 1]-1;
					labels.push(
						'<i style="background:' + getColorBach(from + 1) + '"></i> ' +
						 from + (to ? '%'+'&ndash;' + to + '%' : '%'));
					}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					
				var color = getColorBach(props[attyear]);
				
				if(yearSel == 'Change'){
						legend.onAdd = function (map) {
							var legdiv = L.DomUtil.create('div', 'info legend'),
								grades = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
								labels = [],
								from, to;

							for (var i = 0; i < grades.length; i++) {
								from = grades[i];
								to = grades[i + 1]-1;
								labels.push(
									'<i style="background:' + getColorHChange(from + 1) + '"></i> ' +
									from + (to ? '%'+'&ndash;' + to + '%' : '%'));
						}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					var color = getColorHChange(props[attyear]);
				}}
				
				if(attSel == 'PC_AtleastHS'){
					legend.onAdd = function (map) {
				var legdiv = L.DomUtil.create('div', 'info legend'),
					grades = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
					labels = [],
					from, to;

				for (var i = 0; i < grades.length; i++) {
					from = grades[i];
					to = grades[i + 1]-1;
					labels.push(
						'<i style="background:' + getColorGreen(from + 1) + '"></i> ' +
						 from + (to ? '%'+'&ndash;' + to + '%' : '%'));
					}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					
				var color = getColorGreen(props[attyear]);
				
				if(yearSel == 'Change'){
						legend.onAdd = function (map) {
							var legdiv = L.DomUtil.create('div', 'info legend'),
								grades = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
								labels = [],
								from, to;

							for (var i = 0; i < grades.length; i++) {
								from = grades[i];
								to = grades[i + 1]-1;
								labels.push(
									'<i style="background:' + getColorIChange(from + 1) + '"></i> ' +
									from + (to ? '%'+'&ndash;' + to + '%' : '%'));
						}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					var color = getColorIChange(props[attyear]);
				}}
				
				
				
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
		if(attSel == 'PC_no_hs'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Percentage of No High School Education</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '%' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'PC_BachMore'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Percentage of Bachelors Degree or Above</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '%' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'PC_AtleastHS'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Percentage w/ High School Education</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '%' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
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
		if(attSel == 'PC_no_hs'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Percentage of No High School Education</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '%' + '</b><br />' +  'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'PC_BachMore'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Percentage of Bachelors Degree or Above</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '%' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'PC_AtleastHS'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Percentage w/ High School Education</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '%' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		info.remove();
		info.addTo(map)
		
	})

	