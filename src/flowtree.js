
const WIDTH = $('#panel-vis-main').width();
const HEIGHT = $('#panel-vis-main').height();

const svg = d3.select("#panel-vis-main").append("svg")
  .attr("width", WIDTH)
  .attr("height", HEIGHT)
  .append('g')
  .attr('transform', 'translate(60,0)');


var treeData = {
  "name": "Initial",
  "r": 5,
  "clicked": 0,
  "type": "normal",
  "children":[]
}

var selectedTreeNode = null;

var i = 0,
  duration = 750,
  root;

// function flowTree(data, radiusTree) {
root = d3.hierarchy(treeData, function(d) { return d.children; });
var treemap = d3.tree().size([HEIGHT, WIDTH]);
root.x0 = HEIGHT / 2;
root.y0 = 0;
// console.log(root.descendants())

function updateTree(source) {

    // Assigns the x and y position for the nodes
    var treeData = treemap(root);

    // Compute the new tree layout.
    var nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(function(d){ d.y = d.depth * 120});

    // ****************** Nodes section ***************************

    // Update the nodes...
    var node = svg.selectAll('g.node')
        .data(nodes, function(d) {return d.id || (d.id = ++i); });

    // Enter any new modes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", function(d) {
          return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on('click', click);

    // Add Circle for the nodes
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style("fill", function(d) {
          // debugger;
            return d.data.clicked ? "lightsteelblue" : "#fff";
            // return d.data.clicked ? "lightsteelblue" : ( d.data.type === "model" ? "lightslategrey" : "#fff");
        });

    // Add labels for the nodes
    nodeEnter.append('text')
        .attr("dy", ".35em")
        .attr("x", function(d) {
            return d.children || d._children ? -13 : 13;
        })
        .attr("text-anchor", function(d) {
            return d.children || d._children ? "end" : "start";
        })
        .text(function(d) { return d.data.name; });

    // UPDATE
    var nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
      .duration(duration)
      .attr("transform", function(d) {
          return "translate(" + d.y + "," + d.x + ")";
       });

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
      .attr('id', function(d) { return d.data.id; })
      .attr('treepath', function(d) {return d.data.treepath; })
      .attr('r', function(d) { return d.data.r; })
      .style("fill", function(d) {
          return d.data.clicked ? "lightsteelblue" : "#fff";
          // d.data.clicked ? "lightsteelblue" : ( d.data.type === "model" ? "lightslategrey" : "#fff");
      })
      .attr('cursor', 'pointer');


    // Remove any exiting nodes
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle')
      .attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text')
      .style('fill-opacity', 1e-6);

    // ****************** links section ***************************

    // Update the links...
    var link = svg.selectAll('path.link')
        .data(links, function(d) { return d.id; });

    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', function(d){
          var o = {x: source.x0, y: source.y0}
          return diagonal(o, o)
        });

    // UPDATE
    var linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
        .duration(duration)
        .attr('d', function(d){ return diagonal(d, d.parent) });

    // Remove any exiting links
    var linkExit = link.exit().transition()
        .duration(duration)
        .attr('d', function(d) {
          var o = {x: source.x, y: source.y}
          return diagonal(o, o)
        })
        .remove();

    // Store the old positions for transition.
    nodes.forEach(function(d){
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {

      path = `M ${s.y} ${s.x}
              C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`

      return path
    }

    // Toggle children on click.
    function click(d, i) {
      // if (!d3.select(this).classed('clicked')) {
      if (!d.data.clicked) {
        d.data.clicked = 1;
        if (selectedTreeNode) {
          selectedTreeNode.data.clicked = 0;
        }
        updateTree(d)
        d3.select(this.children[0]).style("fill", "lightsteelblue");


        if (d.data.type == "model") {
          $("#dountCharts").hide()
          $("#barCharts").show()
          // nameM.push(d.data.name)
          // maxM.push(d.data.max)
          // minM.push(d.data.min)
          // meanM.push(d.data.mean)
          barChart(d.data);
        }
        else {
          // meanM = [];
          // maxM = [];
          // minM = [];
          // nameM = [];
          barChartData = [];
          $("#dountCharts").show()
          $("#barCharts").hide()
          selectedTreeNode = d;
          myData = JSON.parse(JSON.stringify(historyData[i]));
          console.log(myData);
          //myMapData = JSON.parse(JSON.stringify(myData));
          if (historyDonutData[i]) {
            donutData_G = JSON.parse(JSON.stringify(historyDonutData[i]));
          }
          else {
            donutData_G = JSON.parse(JSON.stringify(historyDonutData[0]));
          }

          window.UV.views.donuts.update(donutData_G)
          updateParameter()
        }

      } else {
        d.data.clicked = 0;
        d3.select(this.children[0]).style("fill", function() {
          d.children ? "#fff" : "#999"
        });
        if (d.data.type == "model" && barChartData.length) {
          var name = barChartData.map( (d) => d.name)
          var index = name.indexOf(d.data.name)
          if (index !== -1) barChartData.splice(index, 1);
          // debugger;
          barChart("none")
        }

        selectedTreeNode = null;
        // nodeClick = 1;
      }
    }
}

    /////////////////////////////////
//   svg.selectAll(".link").remove()
//   svg.selectAll(".node").remove()
//
//
//   var link = svg.selectAll(".link")
//     .data(root.descendants().slice(1))
//     .enter().append("path")
//     .attr("class", "link")
//     .attr("d", function(d) {
//       return "M" + d.y + "," + d.x +
//         "C" + (d.y + d.parent.y) / 2 + "," + d.x +
//         " " + (d.y + d.parent.y) / 2 + "," + d.parent.x +
//         " " + d.parent.y + "," + d.parent.x;
//     });
//
//   var node = svg.selectAll(".node")
//     .data(root.descendants())
//     .enter().append("g")
//     .attr("class", function(d) {
//       return "node" + (d.children ? " node--internal" : " node--leaf");
//     })
//     .attr("transform", function(d) {
//       return "translate(" + d.y + "," + d.x + ")";
//     })
//     .on("click", nodeClick);
//
//   node.append("circle")
//     // .data(radiusTree)
//     .attr("class", "circle")
//     .attr("r", function(d, i) {
//       return radiusTree[i] / 2
//     })
//     .style("fill", function() {
//       d3.select(this).classed('clicked') ? "rgb(100, 182, 235)" :
//       (d3.select(this).classed('node--internal') ? "#999" : "#555")
//     });
//
//   node.append("text")
//     .attr("dy", 3)
//     .attr("x", function(d) {
//       return d.children ? -8 : 8;
//     })
//     .style("text-anchor", function(d) {
//       return d.children ? "end" : "start";
//     })
//     .text(function(d) {
//       return d.data.name;
//     });
// }
//
// function nodeClick(d, i) {
//   // debugger;
//   if (!d3.select(this).classed('clicked')) {
//     d3.select(this.children[0]).style("fill", "rgb(100, 182, 235)");
//     $(this).addClass("clicked")
//     treeNode = d.data.name;
//     // nodeClick = 0;
//   } else {
//     d3.select(this.children[0]).style("fill", function() {
//       d3.select(this).classed('.node--leaf') ? "#555" : "#999"
//     });
//     $(this).removeClass("clicked")
//     // debugger;
//     treeNode = null;
//     // nodeClick = 1;
//   }
//
//
//
// }

// root = d3.hierarchy(DATA);
// tree = d3.tree().size([HEIGHT, WIDTH - 120]);
// // console.log(root.descendants())
//
// tree(root);
//
//
// var link = svg.selectAll(".link")
//   .data(root.descendants().slice(1))
//   .enter().append("path")
//   .attr("class", "link")
//   .attr("d", function(d) {
//     return "M" + d.y + "," + d.x +
//       "C" + (d.y + d.parent.y) / 2 + "," + d.x +
//       " " + (d.y + d.parent.y) / 2 + "," + d.parent.x +
//       " " + d.parent.y + "," + d.parent.x;
//   });
//
// var node = svg.selectAll(".node")
//   .data(root.descendants())
//   .enter().append("g")
//   .attr("class", function(d) {
//     return "node" + (d.children ? " node--internal" : " node--leaf");
//   })
//   .attr("transform", function(d) {
//     return "translate(" + d.y + "," + d.x + ")";
//   });
//
// node.append("circle")
//   // .data(radiusTree)
//   .attr("r", function(d, i) {
//     return radiusTree[i] / 2
//   });
//
// node.append("text")
//   .attr("dy", 3)
//   .attr("x", function(d) {
//     return d.children ? -8 : 8;
//   })
//   .style("text-anchor", function(d) {
//     return d.children ? "end" : "start";
//   })
//   .text(function(d) {
//     return d.data.name;
//   });
