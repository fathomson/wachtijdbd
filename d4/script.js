var classesNumber = 10,
        cellSize = 24;
var colors = ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'];
var visibleItems = [true, false, false, false, false];
var heatmapId = '#heatmap';

//==================================================
var tooltip = d3.select(heatmapId)
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden");

var legendElementWidth = cellSize * 2;


var margin = {top: 20, right: 60, bottom: 30, left: 50},
width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


var x = d3.scale.linear()
        .range([0, width]);

var y = d3.scale.linear()
        .range([height, 0]);

var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(-height, 0);

var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right")
        .ticks(5)
        .tickSize(-width);

var zoom = d3.behavior.zoom()
        .on("zoom", refresh);

var timer = true;


// http://bl.ocks.org/mbostock/3680999
var svg = d3.select(heatmapId).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom)
        .on("mousedown", function () {
            timer = false;
        })
        .on("mouseup", function () {
            timer = true;
        });
svg.append("rect")
        .attr("width", width)
        .attr("height", height);


svg.append('defs')
        .append('pattern')
        .attr('id', 'diagonalHatch')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 4)
        .attr('height', 4);



function setData() {
    svg.selectAll("*").remove();
    d3.json('http://localhost/bt/d3/data.php', function (error, data) {
        var visibleRows = getRowArray();

        var yLabels = [];
        var dataPoints = [];

        //some data prep work here. - get the keys
        for (var i = 0; i < data.data.length; i++) {
            var key = Object.keys(data.data[i]);
            var values = data.data[i][key];

            var shouldAdd = visibleRows.indexOf(key.toString()) > -1;
            //when in selection add to arrays
            if (shouldAdd) {
                yLabels.push(key);
                dataPoints.push(values);
            }
        }
        // console.log(data);
        var arr = dataPoints;
        var row_number = arr.length;
        var col_number = arr[0].length;

        //console.log(col_number, row_number);
        var colorScale = d3.scale.quantile()
                .domain([0, d3.max(arr, function (d) {
                        return d3.max(d) / 12;
                    }), d3.max(arr, function (d) {
                        return d3.max(d);
                    })])
                .range(colors);

        x.domain([0, arr.length]);
        y.domain([0, d3.max(data, function (d) {
                return  d3.max(d);
            })]);



        var rowLabels = svg.append("g")
                .attr("class", "y axis")
                .selectAll(".rowLabel")
                .data(yLabels)
                .enter().append("text")
                .text(function (d) {
                    return d;
                })
                .attr("x", 0)
                .attr("y", function (d, i) {
                    return (i * cellSize);
                })
                .style("text-anchor", "end")
                .attr("transform", function (d, i) {
                    return "translate(-3," + cellSize / 1.5 + ")";
                })
                .attr("class", "rowLabel mono");

        var colLabels = svg.append("g")
                .attr("class", "x axis")
                .call(xAxis)
                .selectAll(".colLabel")
                .data(data.xLabels)
                .enter().append("text")
                .text(function (d) {
                    return d;
                })
                .attr("x", 0)
                .attr("y", function (d, i) {
                    return (i * cellSize);
                })
                .style("text-anchor", "left")
                .attr("transform", function (d, i) {
                    return "translate(" + cellSize / 2 + ", -3) rotate(-90) rotate(45, 0, " + (i * cellSize) + ")";
                })
                .attr("class", "colLabel mono");

        var row = svg.selectAll(".row")
                .data(dataPoints)
                .enter().append("g")
                .attr("id", function (d) {
                    return d.idx;
                })
                .attr("class", "row");


        var j = 0;
        var heatMap = row.selectAll(".cell")
                .data(function (d) {
                    j++;
                    return d;
                })
                .enter().append("svg:rect")
                .style('opacity', 0)
                .attr("x", function (d, i) {
                    return i * cellSize;
                })
                .attr("y", function (d, i, j) {
                    return j * cellSize;
                })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", function (d, i, j) {
                    return "cell bordered cr" + j + " cc" + i;
                })
                .attr("row", function (d, i, j) {
                    return j;
                })
                .attr("col", function (d, i, j) {
                    return i;
                })
                .attr("width", cellSize)
                .attr("height", cellSize)
                .style("fill", function (d) {
                    if (d != null)
                        return colorScale(d);
                    else
                        return "url(#diagonalHatch)";
                })
                .on('mouseover', function (d, i, j) {
                    d3.select('#colLabel_' + i).classed("hover", true);
                    d3.select('#rowLabel_' + j).classed("hover", true);
                    if (d != null) {
                        tooltip.html('<div class="heatmap_tooltip">' + convertSecondToMinuts(d) + '</div>');
                        tooltip.style("visibility", "visible");
                    } else
                        tooltip.style("visibility", "hidden");
                })
                .on('mouseout', function (d, i, j) {
                    d3.select('#colLabel_' + i).classed("hover", false);
                    d3.select('#rowLabel_' + j).classed("hover", false);
                    tooltip.style("visibility", "hidden");
                })
                .on("mousemove", function (d, i) {
                    tooltip.style("top", (d3.event.pageY - 55) + "px").style("left", (d3.event.pageX - 60) + "px");
                })
                .on('click', function () {
                    //console.log(d3.select(this));
                });
        heatMap.transition()
                .delay(function (d, i) {
                    return i * 10;
                })
                .duration(1250)
                .style('opacity', 1);


    });
}

function refresh() {
    svg.select(".x.axis").call(xAxis);
}

//return a string array with rows to show
function getRowArray() {
    var rowArray = [];
    //Auto 
    //        rowArray.push("BT_A_AUTO_1", "BT_A_BPM_1", "BT_A_HSB_1", "BT_A_VRACHT_1");
    if (visibleItems[0])
        rowArray.push("BT_A_AUTO_1");

    //Toeslagen
    if (visibleItems[1])
        rowArray.push("BT_T_BETA_1", "BT_T_BETA_2", "BT_T_GRIP_1", "BT_T_TOESLAGEN_1", "BT_T_VERMOGEN_1",
                "BT_T_WKO_1", "TT_BO_TOESL_2", "TT_S_FRAUDE", "TT_T_HUZO_1");

    //Ondernemers
    if (visibleItems[2])
        rowArray.push("BT_O_EXPERTLIJN_1", "BT_O_IB_1", "BT_O_IB_2", "BT_O_KTU_1", "BT_O_LH_1",
                "BT_O_LH_2", "BT_O_OB_1", "BT_O_OB_2", "BT_O_OVERIG_1", "BT_O_VPB_1");

    //Particulieren
    if (visibleItems[3])
        rowArray.push("BT_P_BEST_1", "BT_P_BETA_1", "BT_P_HUBA_1", "BT_P_IB_1", "BT_P_IB_2",
                "BT_P_OLDV_1");

    //BT_S_MELDINGEN
    if (visibleItems[4])
        rowArray.push("BT_B_BUIT_1", "BT_B_IB_2", "BT_B_OND_1", "BT_B_TSL_1", "BT_D_OVERIG_1",
                "BT_G_BELONS_1", "BT_G_CAMP_1", "BT_G_EBV_1", "BT_G_ENGELS_1", "BT_G_ERFETM_1",
                "BT_G_GELDZAKEN_1", "BT_G_INVOR_1", "BT_G_OHVAUTO_1", "BT_G_OHVOND_1", "BT_G_OHVPART_1",
                "BT_G_OHVTOE_1", "BT_G_SCHEIDEN_1", "BT_HI_IB_1", "BT_HI_OVERIG_1", "BT_S_MELDINGEN");
    return rowArray;

}

$('.btn-wachtstroom').click(function () {
    console.log(this.id);
    switch (this.id) {
        case "btn-auto":
            visibleItems[0] = this.getAttribute("aria-pressed") === "true";
            break;
        case "btn-toeslagen":
            visibleItems[1] = this.getAttribute("aria-pressed") === "true";
            break;
        case "btn-ondernemers":
            visibleItems[2] = this.getAttribute("aria-pressed") === "true";
            break;
        case "btn-particulieren":
            visibleItems[3] = this.getAttribute("aria-pressed") === "true";
            break;
        case "btn-overig":
            visibleItems[4] = this.getAttribute("aria-pressed") === "true";
            break;
    }
    setData();

});

function convertSecondToMinuts(seconds) {
    var minutes = Math.floor(seconds / 60);
    var sec = seconds % 60;
    return minutes + 'm ' + sec + 's';
}

$(document).ready(function () {
    setData();
});