//First Create Variables
var attSel = "results" //change this to results
var yearSel = ''
var attyear = attSel+yearSel
var data = results;
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
		this._div.innerHTML = '<h4>'+ yearSel + ' Margin of Victory</h4>' + '<h5>' +  (props ?
			'<b>' + props.win_margin +  '</b><br/>' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10 +'<br>' 
			: 'Hover On A County') +'</h5>';
	};

	info.addTo(map);

var georgiajson = L.geoJson(results, {
		style: nhstyle,
		onEachFeature: function(feature, marker) {
			marker.bindPopup('<h4>' + feature.properties.NAME10+'</h4>');
		}
	});
	
var tractjson = new L.geoJson(data, {
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
		
		georgiajson.eachLayer(function(layer) {
			georgiajson.resetStyle(layer);
		});
	});

	map.addControl( nhSearch );
	map.addLayer(georgiajson);
	map.addLayer(tractjson);
	
var legend = L.control({position: 'bottomleft'});

	legend.onAdd = function (map) {

		//Initial Load
var legdiv = L.DomUtil.create('div', 'info legend'),
			grades = ["Republican","Democrat"],
			labels = [],
			from, to;

	for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1]-1;
			//Changed getColorResults(from)
			labels.push(
				'<i style="background:' + getColorResults(from, to) + '"></i> ' +
				from + (to ? '%'+'&ndash;' + to + ' ' : ' '));
		}

	legdiv.innerHTML = labels.join('<br>');
		return legdiv;
	};
	
	legend.addTo(map);
	
var attDD = L.control({position: 'topright'});
	attDD.onAdd = function (map) {
		
var attdiv = L.DomUtil.create('div', 'info attDD');
    attdiv.innerHTML = '<h4>Select Attribute</h4><select id="attOpt"><option value = "results">Final Results</option><option value = "PC_blue">Democrat</option><option value = "PC_red">Republican</option><option value = "PC_lib">Libertarian</option></select>';
    attdiv.firstChild.onmousedown = attdiv.firstChild.ondblclick = L.DomEvent.stopPropagation;
		return attdiv;
		};
	attDD.addTo(map);
	


//Color functions

function getColorResults (d){
		return  d == "Republican" ? '#BF0F00' : //.js file was edited to change "red" to "Republican"
				d == "Democrat" ? '#00008B':
				'#28C2AB';
}
	
function getColorBlue(d) {
	return  d >= 100 ? '#00003f' :
			d > 90  ? '#191970' :
			d > 80  ? '#000080' :
			d > 70  ? '#00008B' :
			d > 60  ? '#1434A4' :
			d > 50  ? '#08519c' :
			d > 40  ? '#3182bd' :
			d > 30  ? '#6baed6' :
			d > 20  ? '#9ecae1' :
			d > 10  ? '#c6dbef' :
			'#eff3ff';
}


function getColorRed (d) {
	return  d >= 100 ? '#BF0F00' :
			d > 90  ? '#BF065B' :
			d > 80  ? '#8B0000' :
			d > 70  ? '#C41E3A' :
			d > 60  ? '#FF0000' :
			d > 50  ? '#E34234' :
			d > 40  ? '#e34a33' :
			d > 30  ? '#fc8d59' :
			d > 20  ? '#fdbb84' :
			d > 10  ? '#fdd49e' :
			'#fef0d9';
}


function getColorLib (d) {
	return  d > 1.0  ? '#C29512' :
			d > .8   ? '#D9A714' :
			d > .6   ? '#DFBB33' :
			d > .4   ? '#F2D272' :
			d > .2   ? '#F4DE9A' :
			'#F9F3E0';
}


		//Styles for tracts initialized with Vote Results
function tractstyle(feature) {
        if(attSel == "results"){
        var color = getColorResults(feature.properties[attSel])
        	}
		if(attSel == "PC_blue"){
			var color = getColorBlue(feature.properties[attSel])
			}
		if(attSel == "PC_red"){
			var color = getColorRed(feature.properties[attSel])
			}
		if(attSel == "PC_lib"){
			var color = getColorLib(feature.properties[attSel])
			}
		return {
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 20, //0.7
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
			color: '#fff',
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
			
			/*-----------------------------*/
			if(attSel == "results"){
				legend.onAdd = function (map) {
					var legdiv = L.DomUtil.create('div', 'info legend'),
						grades = ["Republican","Democrat"],
						labels = [],
						from, to;

					for (var i = 0; i < grades.length; i++) {
						from = grades[i];
						to = grades[i +1]-1;  //-1
						labels.push(
							'<i style="background:' + getColorResults(from,to) + '"></i> ' +
								from + (to ? ' '+'&ndash;' + to + ' ' : ' '));
						}

						legdiv.innerHTML = labels.join('<br>');
						return legdiv;
						};
						
					var color = getColorResults(props[attyear]);
					if(yearSel == 'Change'){
							legend.onAdd = function (map) {
								var legdiv = L.DomUtil.create('div', 'info legend'),
									grades = ["Republican","Democrat"],
									labels = [],
									from, to;

								for (var i = 0; i < grades.length; i++) {
									from = grades[i];
									to = grades[i + 1]-1;
									labels.push(
									'<i style="background:' + getColorResults(from, to) + '"></i> ' +
									from + (to ? '%'+'&ndash; ' + to + ' ' : ' '));
							}

						legdiv.innerHTML = labels.join('<br>');
						return legdiv;
						};
						var color = getColorResults(props[attyear]);
					}} 
					/*-----------------------------------*/
			if(attSel == 'PC_blue'){
			legend.onAdd = function (map) {
				var legdiv = L.DomUtil.create('div', 'info legend'),
					grades = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
					labels = [],
					from, to;

				for (var i = 0; i < grades.length; i++) {
					from = grades[i];
					to = grades[i + 1]-1;
					labels.push(
						'<i style="background:' + getColorBlue(from + 1) + '"></i> ' +
						 from + (to ? '%'+'&ndash;' + to + '%' : '%'));
					}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					
				var color = getColorBlue(props[attyear]);
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
								from + (to ? '%'+'&ndash; ' + to + '%' : '%+'));
						}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					var color = getColorBachChange(props[attyear]);
				}}
				
				if(attSel == 'PC_red'){
					legend.onAdd = function (map) {
				var legdiv = L.DomUtil.create('div', 'info legend'),
					grades = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
					labels = [],
					from, to;

				for (var i = 0; i < grades.length; i++) {
					from = grades[i];
					to = grades[i + 1]-1;
					labels.push(
						'<i style="background:' + getColorRed(from + 1) + '"></i> ' +
						 from + (to ? '%'+'&ndash;' + to + '%' : '%'));
					}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					
				var color = getColorRed(props[attyear]);
				
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
									from + (to ? '&ndash; ' + to : '+'));
						}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					var color = getColorHChange(props[attyear]);
				}}
				
				if(attSel == 'PC_lib'){
					legend.onAdd = function (map) {
						var legdiv = L.DomUtil.create('div', 'info legend'),
						grades = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
						labels = [],
						from, to;
	
					for (var i = 0; i < grades.length; i++) {
						from = grades[i];
						to = grades[i + 1];
						labels.push(
							'<i style="background:' + getColorLib(from) + '"></i> ' +  //was(from +1)
							 from + (to ? '%' + '&ndash;' + to + '%' : '+'));
						}

					legdiv.innerHTML = labels.join('<br>');
					return legdiv;
					};
					
				var color = getColorLib(props[attyear]);
				
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
									from + (to ? '&ndash; ' + to : '+'));
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
		if(attSel == 'PC_blue'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel + ' Percent of Vote</h4>' + '<h5>' +  (props ?
			'<b>' + props[attyear] + '%' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10 +'<br>' +'In 2020, ' + props.NAME10 + ' was a '+ props.results + ' county with a margin of victory of : ' + props.win_margin +'</br>'
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'PC_red'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel + ' Percent of Vote</h4>' + '<h5>' +  (props ?
			'<b>' + props[attyear] + '%' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10 +'<br>' +'In 2020, ' + props.NAME10 + ' was a '+ props.results + ' county with a margin of victory of : ' + props.win_margin +'</br>'
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'PC_lib'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel + ' Percent of Vote</h4>' + '<h5>' +  (props ?
			'<b>' + props[attyear] + '%' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10 +'<br>' +'In 2020, ' + props.NAME10 + ' was a '+ props.results + ' county with a margin of victory of : ' + props.win_margin +'</br>'
			: 'Hover On A County') +'</h5>';
		};}

		if(attSel == 'results'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel + ' Winning Margin</h4>' + '<h5>' +  (props ?
			'<b>' + props.win_margin +  '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10 +'<br>' 
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
		if(attSel == 'PC_blue'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel + ' Percent of Vote</h4>' + '<h5>' +  (props ?
			'<b>' + props[attyear] + '%' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10 +'<br>' +'In 2020, ' + props.NAME10 + ' was a '+ props.results + ' county with a margin of victory of : ' + props.win_margin +'</br>'
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'PC_red'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel + ' Percent of Vote</h4>' + '<h5>' +  (props ?
			'<b>' + props[attyear] + '%' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10 +'<br>' +'In 2020, ' + props.NAME10 + ' was a '+ props.results + ' county with a margin of victory of : ' + props.win_margin +'</br>'
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'PC_lib'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel + ' Percent of Vote</h4>' + '<h5>' +  (props ?
			'<b>' + props[attyear] + '%' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10 +'<br>' +'In 2020, ' + props.NAME10 + ' was a '+ props.results + ' county with a margin of victory of : ' + props.win_margin +'</br>'
			: 'Hover On A County') +'</h5>';
		};}

		if(attSel == 'results'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel + ' Winning Margin</h4>' + '<h5>' +  (props ?
			'<b>' + props.win_margin +  '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10 +'<br>' 
			: 'Hover On A County') +'</h5>';
		};}
		info.remove();
		info.addTo(map)
		
	})

	