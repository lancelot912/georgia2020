
//VARIABLES
//First Create Variables
var attSel = 'Labor_Force'
var yearSel = ''
var attyear = attSel+yearSel
var data = laborStat;
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

//INFO WINDOW
// control that displays in info window on hover
var info = L.control({position:'bottomright'});

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};
	//I took out the (props ? ) and broke the code
	info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel + 'Labor Force Number' + '</h4>' + '<h5>' + (props ?
			'<b>' + props[attyear] + '' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
	};

	info.addTo(map);

var laborjson = L.geoJson(laborStat, {
	style: nhstyle,
	onEachFeature: function(feature, marker) {
		marker.bindPopup('<h4>' + feature.properties.NAME10 + '</h4>');
	}
});

var labortract = new L.geoJson(laborStat, {
	style: tractstyle,
	onEachFeature: onEachFeature
});

//SEARCH OPTION 
var nhSearch = new L.Control.Search({		
		layer:laborjson, 
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
	
	laborjson.eachLayer(function(layer) { 
		laborjson.resetStyle(layer);
	});
});

map.addControl(nhSearch);

map.addLayer(laborjson);
map.addLayer(labortract);

//LEGEND
//create legend Layer control
var legend = L.control({position: 'bottomleft'});

	legend.onAdd = function (map) {

var legdiv = L.DomUtil.create('div', 'info legend'),
			//grades = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
			grades= [1000,5000,10000,20000,30000,50000,75000,100000,300000,600000],
			labels = [],
			from, to;

	for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1];  //-1 after]
			labels.push(
				'<i style="background:' + getColorOnLoad(from + 1) + '"></i> ' +
				from + (to ? ''+'&ndash;' + '' + to + ' ' : '+')); 
				
				/*	labels.push(
				'<i style="background:' + getColorBach(from + 1) + '"></i> ' +
				from + (to ? '%'+'&ndash;' + to + '%' : '%')) */
		}

	legdiv.innerHTML = labels.join('<br>');
		return legdiv;
	};
	
	legend.addTo(map);
	
var attDD = L.control({position: 'topright'});
	attDD.onAdd = function (map) {
		
var attdiv = L.DomUtil.create('div', 'info attDD');
	attdiv.innerHTML = '<h4>Select Attribute</h4><select id="attOpt"><option value = "Labor_Force">Labor Force</option><option value = "pc_Unemp">Percentage of Unemployment</option><option value = "Med_HHI">Median Household Income</option><option value = "Med_HHI_PC">Median HH Income Percent of State</option></select>';
	attdiv.firstChild.onmousedown = attdiv.firstChild.ondblclick = L.DomEvent.stopPropagation;
		return attdiv;
		};
	attDD.addTo(map);
	

//Create Functions
//Color functions

function getColorOnLoad(d) {
	return  d >= 600000 ? '#1C6513' : 
			d > 300000  ? '#4B7D0E' : 
			d > 100000  ? '#5F8111' : 
			d > 75000  ? '#87A80C' :
			d > 50000  ? '#AABB0F' :
			d > 30000  ? '#C2C61B' :
			d > 20000  ? '#82A263' :
			d > 10000  ? '#9EB89A' :
			d > 5000  ? '#D5E0C0' :
			d > 1000  ? '#ECF1E2' : 
			'#ffffff'; 
}
function getColorRed (d) {
	return  d >= 10 ? '#BF0F00' :
			d > 9  ? '#BF065B' :
			d > 8  ? '#8B0000' :
			d > 7  ? '#C41E3A' :
			d > 6  ? '#FF0000' :
			d > 5  ? '#E34234' :
			d > 4  ? '#e34a33' :
			d > 3  ? '#fc8d59' :
			d > 2  ? '#fdbb84' :
			d > 1  ? '#fdd49e' :
			'#fef0d9';
}
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
			'#C59E44';
}

function getColorHome (d) {
	return  d >= 10 ? '#BF0F00' :
			d > 9  ? '#BF065B' :
			d > 8  ? '#C00DBF' :
			d > 7  ? '#6413C0' :
			d > 6  ? '#1A27C1' :
			d > 5  ? '#2183C2' :
			d > 4  ? '#28C2AB' :
			d > 3  ? '#2FC35D' :
			d > 2  ? '#56C336' :
			d > 1  ? '#A4C43D' :
			'#C59E44';
}


function getColorIncome (d) {
	return  d >= 100000 ? '#BF0F00' :
			d > 90000  ? '#BF065B' :
			d > 80000  ? '#C00DBF' :
			d > 70000  ? '#6413C0' :
			d > 60000  ? '#1A27C1' :
			d > 50000  ? '#2183C2' :
			d > 40000  ? '#28C2AB' :
			d > 30000  ? '#2FC35D' :
			d > 20000  ? '#56C336' :
			d > 10000  ? '#A4C43D' :
			'#C59E44';
}

function getColorHome2 (d) {
	return  d >= 200 ? '#BF0F00' :
			d > 180 ? '#BF065B' :
			d > 160 ? '#C00DBF' :
			d > 140 ? '#6413C0' :
			d > 120  ? '#1A27C1' :
			d > 100  ? '#2183C2' :
			d > 80  ? '#28C2AB' :
			d > 60  ? '#2FC35D' :
			d > 40  ? '#56C336' :
			d > 20  ? '#A4C43D' :
			'#C59E44';
}

	
//Styles for tracts initialized with Bachelors stats
function tractstyle(feature) {
		if(attSel == "Labor_Force"){
			var color = getColorOnLoad(feature.properties[attyear])
			}
		if(attSel == "pc_Unemp"){
			var color = getColorRed(feature.properties[attyear])
			}
		if(attSel == "Med_HHI"){
			var color = getColorIncome(feature.properties[attSel]) //This drop down attribute was not changed
		}
		if(attSel == "Med_HHI_PC"){
			var color = getColorHome2(feature.properties[attyear])//There was not a 4th option here
		}
		return {
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 20,//0.7
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

		//gray outline on highlight
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
		labortract.resetStyle(e.target);  
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
			if(layer.feature && layer.feature.properties[attyear]){  //attYear vs attSel ??
				var props = layer.feature.properties;
				//console.log("this is props:", props);
				
				if(attSel == 'Labor_Force'){
				legend.onAdd = function (map) {
					var legdiv = L.DomUtil.create('div', 'info legend'),
						grades = [1000,5000,10000,20000,30000,50000,75000,100000,300000,600000],
						labels = [],
						from, to;
	
					for (var i = 0; i < grades.length; i++) {
						from = grades[i];
						to = grades[i + 1]; //99 ending numbers or 00 without the -1
						//this determines how the legend is displayed
						labels.push(
							'<i style="background:' + getColorOnLoad(from + 1) + '"></i> ' +
							 from + (to ? ' '+'&ndash;' + ' ' + to + ' ' : ' to 0 Workers '));
						}
	
						legdiv.innerHTML = labels.join('<br>');
						return legdiv;
						};
					
					
					var color = getColorOnLoad(props[attyear]);
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
								'<i style="background:' + getColorBach(from + 1) + '"></i> ' +
								from + (to ? '%'+'&ndash; ' + to + '' : ''));
						}
	
						legdiv.innerHTML = labels.join('<br>');
						return legdiv;
						};
						var color = getColorBach(props[attyear]);
					}}
					
					if(attSel == 'pc_Unemp'){
						legend.onAdd = function (map) {
					var legdiv = L.DomUtil.create('div', 'info legend'),
						grades = [1,3,5,7,10],
						labels = [],
						from, to;
	
					for (var i = 0; i < grades.length; i++) {
						from = grades[i];
						to = grades[i + 1]-1;
						labels.push(
							'<i style="background:' + getColorRed(from + 1) + '"></i> ' +
							 from + (to ? '%'+ '&ndash;' + to + '%' : '+'));
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
										'<i style="background:' + getColorHome(from + 1) + '"></i> ' +
										from + (to ? '&ndash; ' + to : '+'));
							}
	
						legdiv.innerHTML = labels.join('<br>');
						return legdiv;
						};
						var color = getColorHome(props[attyear]);
					}}
					
					if(attSel == 'Med_HHI'){
						legend.onAdd = function (map) {
					var legdiv = L.DomUtil.create('div', 'info legend'),
						grades = [0, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000],
						labels = [],
						from, to;
	
					for (var i = 0; i < grades.length; i++) {
						from = grades[i];
						to = grades[i + 1];  //-1 the 9's  take out the -1 to 00 ex:(200-100)
						
						//this is how the legend will display
						labels.push(
							'<i style="background:' + getColorIncome(from + 1) + '"></i> ' +
							 from + (to ? '&ndash;' + to : '+'));
						}
	
						legdiv.innerHTML = labels.join('<br>');
						return legdiv;
						};
						
					var color = getColorIncome(props[attyear]);
					
					//----------can't take this section out yet, it breaks the code
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
					//--------------------------Try and remove later
	
					if(attSel == 'Med_HHI_PC'){
						legend.onAdd = function (map) {
					var legdiv = L.DomUtil.create('div', 'info legend'),
						grades = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
						labels = [],
						from, to;
	
					for (var i = 0; i < grades.length; i++) {
						from = grades[i];
						to = grades[i + 1]; //-1
						labels.push(
							'<i style="background:' + getColorHome2(from + 1) + '"></i> ' +
							 from + (to ? '%' + '&ndash;' + to + '%' : '+'));
						}
					
						legdiv.innerHTML = labels.join('<br>');
						return legdiv;
						};
						
					var color = getColorHome2(props[attyear]);
					
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
					
					legend.remove();
					legend.addTo(map);
				
				var options = {
						weight: 2,
						opacity: 1,
						color: 'white',
						dashArray: '3',
						fillOpacity: .7, 
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
		if(attSel == 'Labor_Force'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Labor YEAR OPT Number</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '</b><br />' + 'LaborForce: ' + props.Labor_Force +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover over County') +'</h5>';
		};}
		
		if(attSel == 'pc_Unemp'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +'Unemployment Rate</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '%' + '</b><br />' + 'Labor Force ' + props.Labor_Force +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover over County') +'</h5>';
		};}
		
		if(attSel == 'Med_HHI'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Median Income Value in Dollars</h4>' + '<h5>' + (props ?
			'<b>'+ '$' + props[attSel] + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
    
        if(attSel == 'Med_HHI_PC'){
                info.update = function (props) {
        this._div.innerHTML = '<h4>'+ yearSel +' Median Household Income % of state</h4>' + '<h5>' + (props ?
            '<b>'+ props[attSel] + '%' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
            : 'Hover On A County') +'</h5>';
            };}
		info.remove();
		info.addTo(map);
	})

$('#attOpt').change(function(){
		attID = document.getElementById('attOpt');
		attVal = attID.options[attID.selectedIndex].value;
		updateMap(map,attVal,yearSel);
		
		if(attSel == 'Labor_Force'){
			info.update = function (props) {
				//'<h4>'+ yearSel +' Labor Force </h4>' +
		this._div.innerHTML =  '<h4>'+ yearSel +' Labor Force </h4>' +'<h5>' + (props ?'<b>' + props[attSel] + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'pc_Unemp'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Percent Unemployment</h4>' + '<h5>' + (props ?
			'<b>' + props[attSel] + '%' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
		
		if(attSel == 'Med_HHI'){
			info.update = function (props) {
		this._div.innerHTML = '<h4>'+ yearSel +' Median Income Value in Dollars</h4>' + '<h5>' + (props ?
			'<b>'+ '$' + props[attSel] + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
			: 'Hover On A County') +'</h5>';
		};}
        if(attSel == 'Med_HHI_PC'){
            info.update = function (props) {
        this._div.innerHTML = '<h4>'+ yearSel +' Median Household Income % of state</h4>' + '<h5>' + (props ?
        	'<b>'+ props[attSel] + '%' + '</b><br />' + 'Population: ' + props.totpop10 +'<br/>'+ 'County: ' + props.NAME10
            : 'Hover On A County') +'</h5>';
                };}
		info.remove();
		info.addTo(map);
		
	})

	