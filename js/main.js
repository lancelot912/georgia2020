//begin script when window loads
window.onload = setMap();

// variables for data join from csv
var attrArray = ["labor", "totalvotes", "demographic", "income", "education"];
var expressed = attrArray[7];
var expressedOpt = ["Labor Force", "Employed", "Unemployed", "UnemploymentRate"]; //initial attribute
var collapse2Data = attrArray[1];
var collapse2Opt = ["All Votes", "Democratic Votes %", "Republican Votes %", "Libertarian Votes %"];
var collapse3Data = attrArray[5];
var collapse3Opt = ["Black Female", "Black Male", "White Female", "White Male", "Asian", "Hispanic", "White Male"];
var collapse4Data = attrArray[0]; //YES OR NO - check if number
var collapse4Opt = ["yes", "no"];
var collapse5Data = attrArray[2];
var collapse5Opt = ["None", "ID Requested (General)", "Photo ID Requested", "Strict Proof of Identity", "Strict Photo ID"];
var collapse6Data = attrArray[3];
var collapse6Opt = ["Yes", "Sometimes","No"];
var collapse7Data = attrArray[4];
var collapse7Opt = ["Never", "When Incarcerated", "Until Sentence Complete", "Strictest"];
var stateAbbs = ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
//set up choropleth map
function setMap(){

    //map frame dimensions
    var width = 700,
        height = 460;

    //create new svg container for the map
    var map = d3.select("div.mapContainer")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

        //create custom d3 albers projection specific for the US
        var projection = d3.geoAlbersUsa()
            .scale(950)
            .translate([width / 2, height / 2]);

        var path = d3.geoPath()
            .projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    var promises = [];
    promises.push(d3.csv('data/State_Voting_Laws_Updated.csv')); //Load CSV attributes
    promises.push(d3.json("data/USAFinalProjectTopo.json"));    //load choropleth spatial data
    promises.push(d3.json("data/GreatLakesTopo.json"));         //loads great lakes layers

    Promise.all(promises).then(callback);

    function callback(data){
      	csvData = data[0];
      	usa = data[1];
        bigLakes = data[2];

        //translate US TopoJSON
        var usaStates = topojson.feature(usa, usa.objects.USAFinalProject).features,
            greatLakes = topojson.feature(bigLakes, bigLakes.objects.GreatLakes);

        // join csv data to GeoJSON data
        usaStates = joinData(usaStates, csvData);
        //add enumeration units to the map
        setEnumerationUnits(usaStates, map, path);

        //add great lakes to map
        var lakes = map.append("path")
            .datum(greatLakes)
            .attr("class", "lakes")
            .attr("d", path);

    };

};

function joinData(usaStates, csvData){
    // assign csv attributes to GeoJSON with each loop
    for (var i=0; i<csvData.length; i++){
        // index states
        var csvState = csvData[i];
        // name is joining field
        var csvKey = csvState.name;
        csvKey = csvKey.replace(" ", "_").trim();

        // loop through GeoJSON states to find correct one
        for (var a=0; a<usaStates.length; a++){
            var geojsonProps = usaStates[a].properties,
            geojsonKey = geojsonProps.name;
            geojsonKey = geojsonKey.replace(" ", "_").trim();

            // conditional statement transferring data when names match
            if (geojsonKey == csvKey){
                // when condition met, assign attributes and values
                attrArray.forEach(function(attr){
                    // make variable equal to csv value, check if float or string
                    var val = csvState[attr];
                    if(!isNaN(csvState[attr])) {
                      val=parseFloat(csvState[attr]);
                    }
                    // assign value to GeoJSON
                    geojsonProps[attr] = val;
                });
            };

        };
    };
    return usaStates;
};


//function to create color scale generator
function findFill(data, attArray){
    // PURPLE COLOR SCALE
    var  colorClasses = [
        "#f2f0f7",
        "#cbc9e2",
        "#9e9ac8",
        "#756bb1",
        "#54278f"
    ];
    if(attArray.length == 5) {
      if(data == attArray[0]) {
        return colorClasses[0];
      } else if (data == attArray[1]) {
        return colorClasses[1];
      } else if (data==attArray[2]) {
        return colorClasses[2];
      } else if (data==attArray[3]) {
        return colorClasses[3];
      } else if(data==attArray[4]){
        return colorClasses[4];
      };
    };

    if(attArray.length == 4) {
      if(data == attArray[0]) {
        return colorClasses[0];
      } else if (data == attArray[1]) {
        return colorClasses[1];
      } else if (data==attArray[2]) {
        return colorClasses[2];
      } else if (data==attArray[3]) {
        return colorClasses[4];
      };
    };

    if(attArray.length == 3) {
      if(data == attArray[0]) {
        return colorClasses[0];
      } else if (data == attArray[1]) {
        return colorClasses[2];
      } else if (data==attArray[2]) {
        return colorClasses[4];
      };
    };

    if(attArray.length == 2) {
      if(isNaN(data)) {
        return  colorClasses[4];
      } else {
        return colorClasses[0];
      };
    };

  };

function setEnumerationUnits(usaStates, map, path){

    //add states to map
    var states = map.selectAll(".states")
        .data(usaStates)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "State:" + d.properties.StateAbb;
        })
        .attr("id", function(d){
            return d.properties.StateAbb;
        })
        .attr("d", path)
          .on("mouseover", function(d){
              highlight(d.properties, usaStates);
          })
          .on("mouseout", function(d){
              dehighlight(d.properties, usaStates);
          })
        .attr("fill", function(d) {
          return findFill(d.properties["Grade"], expressedOpt);
        });


        $(".collapsed1").click(function() {
          for(var i =0; i < stateAbbs.length; i++) {
            map.select("#" + stateAbbs[i])
              .attr("fill", function(d) {
                return findFill(d.properties["Grade"], expressedOpt);
              });
          };
        });
        $(".collapsed2").click(function() {
          for(var i =0; i < stateAbbs.length; i++) {
            map.select("#" + stateAbbs[i])
              .attr("fill", function(d) {
                return findFill(d.properties["EarlyVotingStatus"], collapse2Opt);
              });
          };
        });
        $(".collapsed3").click(function() {
          for(var i =0; i < stateAbbs.length; i++) {
            map.select("#" + stateAbbs[i])
              .attr("fill", function(d) {
                return findFill(d.properties["IncorrectlyCastProvisionalVote"], collapse3Opt);
              });
          };
        });
        $(".collapsed4").click(function() {
          for(var i =0; i < stateAbbs.length; i++) {
            map.select("#" + stateAbbs[i])
              .attr("fill", function(d) {
                return findFill(d.properties["OnlineRegImplementYr"], collapse4Opt);
              });
          };
        });
        $(".collapsed5").click(function() {
          for(var i =0; i < stateAbbs.length; i++) {
            map.select("#" + stateAbbs[i])
              .attr("fill", function(d) {
                return findFill(d.properties["VoterIDRequirement"], collapse5Opt);
              });
          };
        });
        $(".collapsed6").click(function() {
          for(var i =0; i < stateAbbs.length; i++) {
            map.select("#" + stateAbbs[i])
              .attr("fill", function(d) {
                return findFill(d.properties["ElectionDayVoteCenters"], collapse6Opt);
              });
          };
        });
        $(".collapsed7").click(function() {
          for(var i =0; i < stateAbbs.length; i++) {
            map.select("#" + stateAbbs[i])
              .attr("fill", function(d) {
                return findFill(d.properties["RightsLosttoFelons"], collapse7Opt);
              });
          };
        });

      //alternate dehighlight for fill
      var desc = states.append("desc")
          .text('{"fill": "#000"}');
};


function highlight(props, usaStates){
    //             //change STROKE highlight method
    //Call setlabel to create label
    for(var i =0; i < stateAbbs.length; i++) {
      var tempStr = "#" + stateAbbs[i];
      d3.selectAll(tempStr)
        .style("opacity", "0.5");
    }
    var selected = d3.selectAll("#" + props.StateAbb)
        .style("stroke", "#00FFFF") //highlight color
        .style("stroke-width", "2px")
        .style("opacity", "1"); //highlight width
    setLabel(props);
};

//function to reset the element style on mouseout
function dehighlight(props, usaStates, rectA, rectB, rectC, rectD, rectF){
  //             // STROKE DEHIGHLIGHT
  for(var i =0; i < stateAbbs.length; i++) {
    var tempStr = "#" + stateAbbs[i];
    d3.selectAll(tempStr)
      .style("opacity", "1");
  }
  var selected = d3.selectAll("#" + props.StateAbb)
        .style("stroke-width", "1.1px")
        .style("stroke", "#fff");
  defaultPanel();

};

//function to create dynamic label
function setLabel(props){

  //Update retrieve panel inner HTML with hover
  var textBox = props.name +"<br/>" + "Grade: " + props.Grade + "<br/>";
  if(isNaN(props["OnlineRegImplementYr"])) {
    textBox+= "Online Registration: No<br/>";
  } else {
    textBox+= "Online Registration: Yes<br/>";
  };
  textBox+="Early Voting Status: " + props["EarlyVotingStatus"] + "<br/>" + "Voter ID Requirement: " + props["VoterIDRequirement"] + "<br/>";
  textBox+= "Election Day Vote Centers: " + props["ElectionDayVoteCenters"] + "<br/>";
  textBox+= "Voting Rights Lost to Felons: " + props["RightsLosttoFelons"] + "<br/>";
  textBox+= "Incorrectly Cast Provisional Vote: " + props["IncorrectlyCastProvisionalVote"] + "<br/>";

  document.getElementById("retrieveTitle").innerHTML=textBox;
  d3.select("#retrieveTitle")
    .style("size", "14pt")
    .style("color", "white"); //retrieve text color

};
function defaultPanel() {
  document.getElementById("retrieveTitle").innerHTML="No State Selected";
};
