// Lab2 GEOG575 Lance Lazarte \\
(function(){

    //pseudo-global variables
    var attrArray = ["Labor Force", "Employed", "Unemployed", "Unemployment Rate", "Median Household Income", "Med HH Income Percent of State Total"]; //list of attributes
    var expressed = attrArray[0]; //initial attribute

   
    //begin script when window loads
    window.onload = setMap();

    //set up choropleth map
    function setMap(){

    //map frame dimensions
    var width = 1000,
        height = 800;


    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on Philippines
    var projection = d3.geo.mercator()
                .center([82.90, 32.17])
                .scale(2500)
                .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);


    //use d3.queue to parallelize asynchronous data loading
    d3.queue()
    .defer(d3.csv, "https://raw.githubusercontent.com/lancelot912/georgia/main/data/georgia.csv?token=APHYF6ZYQPC6I4HYB3GALRLA76Q6G") //load attributes from csv
    .defer(d3.json, "https://raw.githubusercontent.com/lancelot912/georgia/main/data/us_states.json?token=APHYF643VQGXXC5THQYJUALA76RBA") //load background spatial data
    .defer(d3.json, "https://raw.githubusercontent.com/lancelot912/georgia/main/data/georgia.json?token=APHYF6236VJJEX3QEHNMTWDA76RC6") //load choropleth spatial data
    .await(callback);



    //Callback within setMap
    function callback(error, csvData, usstates, ga){
        
        setGraticule(map, path);

                //translate SE Asia and Philippine Regions TopoJSON
                var usstates = topojson.feature(usstates, usstates.objects.us_states),
                    ga = topojson.feature(ga, ga.objects.georgia).features;


    //add SE Asian countries to map
    var countries = map.append("path")
            .datum(usstates)
            .attr("class", "countries")
            .attr("d", path);
        
    //join csv data to GeoJSON enumeration units
    ga = joinData(ga, csvData);

        //create the color scale
        var colorScale = makeColorScale(csvData);

    //add enumeration units to the map
        setEnumerationUnits(ga, map, path, colorScale);
        setChart(csvData, colorScale);
        createDropdown(csvData)
        };
    };


    function setGraticule(map, path){
        //create graticule generator
        var graticule = d3.geo.graticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude
        
        //create graticule background
        var gratBackground = map.append("path")
            .datum(graticule.outline()) //bind graticule background
            .attr("class", "gratBackground") //assign class for styling
            .attr("d", path) //project graticule

        //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines
    };



    function joinData(philRegions, csvData){
    //loop through csv to assign each set of csv attribute values to geojson region
    for (var i=0; i<csvData.length; i++){
        var csvRegion = csvData[i]; //the current region
        var csvKey = csvRegion.FIPS; //the CSV primary key

        //loop through geojson regions to find correct region
        for (var a=0; a<ga.length; a++){

            var geojsonProps = philRegions[a].properties; //the current region geojson properties
            var geojsonKey = ga.FIPS; //the geojson primary key

            //where primary keys match, transfer csv data to geojson properties object
            if (geojsonKey == csvKey){

                //assign all attributes and values
                attrArray.forEach(function(attr){
                    var val = parseFloat(csvRegion[attr]); //get csv attribute value
                    geojsonProps[attr] = val; //assign attribute and value to geojson properties
                });
            };
        };
    };
        
    return ga;

    };



    function setEnumerationUnits(ga, map, path, colorScale){
        //add Philippine regions to map
        var regions = map.selectAll(".regions")
            .data(ga)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "regions " + d.properties.FIPS;
            })
            .attr("d", path) 
            .style("fill", function(d){
            return choropleth(d.properties, colorScale);
            })
            .on("mouseover", function(d){
            highlight(d.properties);
            })
            .on("mouseout", function(d){
            dehighlight(d.properties)   
            })
            .on("mousemove", moveLabel);
        var desc = regions.append("desc")
        .text('{"stroke": "#444336", "stroke-width": "0.5px"}');
    };



    //function to create color scale generator
    function makeColorScale(data){
    var colorClasses = [
        "#eed000",
    ];

    //create color scale generator
    var colorScale = d3.scale.threshold()
        .range(colorClasses);


    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };

    //cluster data using ckmeans clustering algorithm to create natural breaks
    var clusters = ss.ckmeans(domainArray, 1);
    //reset domain array to cluster minimums
    domainArray = clusters.map(function(d){
        return d3.min(d);
    });
    //remove first value from domain array to create class breakpoints
    domainArray.shift();

    //assign array of last 4 cluster minimums as domain
    colorScale.domain(domainArray);

    return colorScale;
    };

    

    //function to test for data value and return color
    function choropleth(props, colorScale){
    //make sure attribute value is a number
        var val = parseFloat(props[expressed]);
        //if attribute value exists, assign a color; otherwise assign gray
        if (typeof val == 'number' && !isNaN(val)){
            return colorScale(val);
        } else {
            return "#d9d9d9";
        };
        };



   
    //function to create a dropdown menu for attribute selection
    function createDropdown(csvData){
    //add select element
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
        .on("change", function(){
            changeAttribute(this.value, csvData)
        });

    //add initial option
    var titleOption = dropdown.append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Pick A Year");

    //add attribute name options
    var attrOptions = dropdown.selectAll("attrOptions")
        .data(attrArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d })
        .text(function(d){ return d });
    };
    
    //dropdown change listener handler
    function changeAttribute(attribute, csvData){
    //change the expressed attribute
    expressed = attribute;
    };

    //function to highlight enumeration units and bars
    function highlight(props){
    //change stroke
    var selected = d3.selectAll("." + props.FIPS)
        .style("stroke", "aqua")
        .style("stroke-width", "2");
    setLabel(props)
    };

    //function to reset the element style on mouseout
    function dehighlight(props){
    var selected = d3.selectAll("." + props.FIPS)
        .style("stroke", function(){
            return getStyle(this, "stroke")
        })
        .style("stroke-width", function(){
            return getStyle(this, "stroke-width")
        });

    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select("desc")
            .text();

        var styleObject = JSON.parse(styleText);

        return styleObject[styleName];
    };

    d3.select(".infolabel")
        .remove();
    };


    //function to create dynamic label
    function setLabel(props){
    //label content
    var labelAttribute = "<h1>" + props[expressed] +
                "</h1><b>" + expressed + "</b>";

    //create info label div
    var infolabel = d3.select("body")
        .append("div")
        .attr("class", "infolabel")
        .attr("id", props.FIPS + "_label")
        .html(labelAttribute);

    var regionName = infolabel.append("div")
        .attr("class", "labelname")
        .html(props.FIPS);
    };


    //function to move info label with mouse
    function moveLabel(){
    //get width of label
    var labelWidth = d3.select(".infolabel")
        .node()
        .getBoundingClientRect()
        .width;

    //use coordinates of mousemove event to set label coordinates
    var x1 = d3.event.clientX + 20,
        y1 = d3.event.clientY - 20,
        x2 = d3.event.clientX - labelWidth - 10,
        y2 = d3.event.clientY + 5;

    //horizontal label coordinate, testing for overflow
    var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
    //vertical label coordinate, testing for overflow
    var y = d3.event.clientY < 75 ? y2 : y1; 

    d3.select(".infolabel")
        .style("left", x + "px")
        .style("top", y + "px");
    };
    })();