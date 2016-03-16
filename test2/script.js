// ***************************** //
//             Set Up            //
// ***************************** //

// Declare an array for holding the points that make up the path on the map
var line_points = [];


// *** CHART VARIABLES ***

var margin = {top: 10, right: 20, bottom: 30, left: 100},
    width = 1100 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;

// Map colors to limits
var color = d3.scale.ordinal()
    .domain([-10,-5,0,5,10])
    .range(['#a1d99b','#c7e9c0','#fdd0a2','#fdae6b','#fd8d3c','#e6550d']);

// Set up the size of the chart relative to the div
var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the look of the axis
var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);
var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);

// Define an area. Areas are filled with color.
var area = d3.svg.area()
    .x(function(d) { return x(d.distance); })
    .y0(height)
    .y1(function(d) { return y(d.elevation); });

// Define the line
var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.distance); })
    .y(function(d) { return y(d.elevation); })

// create the zoom listener
var zoomListener = d3.behavior.zoom()
//    Defer binding of scales until domains have been set.
//    .x(x)  
//    .y(y)
    .scaleExtent([1, 10])
    .on("zoom", zoomHandler);

// function for handling zoom event
function zoomHandler() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);   
    svg.selectAll('.area').attr('d', area); 
}
    
// Set up the SVG element
var svg = d3.select("#chart-container")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

svg.append("defs")
    .append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height);
  
svg = svg.append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

//zoomListener(svg);

// Caculate the average gradient of a dataGroup.
function dataGroupGradient(dataGroup)
{
  var sum = dataGroup[0].gradient;
  for (var i = 1; i < dataGroup.length; i++)
  {
    sum += parseFloat(dataGroup[i].gradient);  
  }
  return sum/dataGroup.length;
}


// ***************************** //
//     WORKING WITH THE DATA     //
// ***************************** //

// Get the data
d3.csv("data.csv", function(error, data) {
    data.forEach(function(d) {
        d.distance = +d.distance;
        d.elevation = +d.elevation;
        d.gradient = +d.gradient;
        d.latitude = +d.latitude;
        d.longitude = +d.longitude;
        line_points.push([d.latitude, d.longitude]);
    });

    // Scale the range of the entire chart
    x.domain(d3.extent(data, function(d) { return d.distance; }));
    y.domain([0, d3.max(data, function(d) { return d.elevation; })]);
    svg.call(zoomListener.x(x).y(y));

    // Split the data based on "group"
    var dataGroup = d3.nest()
        .key(function(d) {
            return d.group;
        })
        .entries(data);
    
    // To remove white space between dataGroups, append the first element of one
    // dataGroup to the last element of the previous dataGroup.
    dataGroup.forEach(function(group, i) {
      if(i < dataGroup.length - 1) {
        group.values.push(dataGroup[i+1].values[0])
      }
    })
        
    // Add a line and an area for each dataGroup
    dataGroup.forEach(function(d, i){
        svg.append("path")
            .datum(d.values)
            .attr("class", "area")
            .attr("d", area)
	          .attr("clip-path", "url(#clip)");
        });
        
    // Fill the dataGroups with color
    svg.selectAll(".area")
        .style("fill", function(d) { return color(dataGroupGradient(d)); });

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Add the text label for the X axis
    svg.append("text")
        .attr("transform",
              "translate(" + (width/2) + " ," + 
                             (height+margin.bottom) + ")")
        .style("text-anchor", "middle")
        .text("Distance");

    // Add the text label for the Y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("x", margin.top - (height / 2))
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("");

    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

});

