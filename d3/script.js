var classesNumber = 10,
        cellSize = 24;
var colors = ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'];
var visibleItems = [true, true, true, true, true];
var heatmapId = '#heatmap';

//==================================================
var tooltip = d3.select(heatmapId)
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden");

//==================================================
// http://bl.ocks.org/mbostock/3680958
function zoom() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

//==================================================
var viewerWidth = $(document).width();
var viewerHeight = $(document).height();
var viewerPosTop = 100;
var viewerPosLeft = 100;

var legendElementWidth = cellSize * 2;

// http://bl.ocks.org/mbostock/3680999
var svg;

svg = d3.select(heatmapId).append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .call(zoomListener)
        .append("g")
        .attr("transform", "translate(" + viewerPosLeft + "," + viewerPosTop + ")");

svg.append('defs')
        .append('pattern')
        .attr('id', 'diagonalHatch')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 4)
        .attr('height', 4)
        .append('path')
        .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
        .attr('stroke', '#000000')
        .attr('stroke-width', 1);


//#########################################################
function heatmap_display() {
    //==================================================
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



        var rowLabels = svg.append("g")
                .attr("class", "rowLabels")
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
                .attr("class", "rowLabel mono")
                .attr("id", function (d, i) {
                    return "rowLabel_" + i;
                })
                .on('mouseover', function (d, i) {
                    d3.select('#rowLabel_' + i).classed("hover", true);
                })
                .on('mouseout', function (d, i) {
                    d3.select('#rowLabel_' + i).classed("hover", false);
                })
                .on("click", function (d, i) {
                    rowSortOrder = !rowSortOrder;
                    sortByValues("r", i, rowSortOrder);
                    d3.select("#order").property("selectedIndex", 0);
                    //$("#order").jqxComboBox({selectedIndex: 0});
                });

        var colLabels = svg.append("g")
                .attr("class", "colLabels")
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
                .attr("class", "colLabel mono")
                .attr("id", function (d, i) {
                    return "colLabel_" + i;
                })
                .on('mouseover', function (d, i) {
                    d3.select('#colLabel_' + i).classed("hover", true);
                })
                .on('mouseout', function (d, i) {
                    d3.select('#colLabel_' + i).classed("hover", false);
                })
                .on("click", function (d, i) {
                    colSortOrder = !colSortOrder;
                    sortByValues("c", i, colSortOrder);
                    d3.select("#order").property("selectedIndex", 0);
                });

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
                        tooltip.html('<div class="heatmap_tooltip">' + d.toFixed(3) + '</div>');
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


    });

    //==================================================
}

//return a string array with rows to show
function getRowArray() {
    var rowArray = [];
    //Auto 
    if (visibleItems[0])
        rowArray.push("BT_A_AUTO_1", "BT_A_BPM_1", "BT_A_HSB_1", "BT_A_VRACHT_1");

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
    console.log(rowArray);
    return rowArray;

}

function updateHeatmap() {
    heatmap_display();
}

$('#btn-auto').on('click', function (e) {
    visibleItems[0] = e.target.getAttribute("aria-pressed") === "true";
})
$('#btn-toeslagen').on('click', function (e) {
    visibleItems[1] = e.target.getAttribute("aria-pressed") === "true";
})
$('#btn-ondernemers').on('click', function (e) {
    visibleItems[2] = e.target.getAttribute("aria-pressed") === "true";
})
$('#btn-particulieren').on('click', function (e) {
    visibleItems[3] = e.target.getAttribute("aria-pressed") === "true";
    updateHeatmap();
})
$('#btn-overig').on('click', function (e) {
    visibleItems[4] = e.target.getAttribute("aria-pressed") === "true";
    updateHeatmap();
})
$(document).ready(function () {
    heatmap_display();
});