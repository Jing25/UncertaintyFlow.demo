// Upload File
$('#OpenFileUpload').click(function() {
  $('#fileupload').trigger('click');
});


$('#classifyButton').click(function() {
  $("#classifyDialog").dialog();
});

//************ uncertainty for 400m buffer *******************************
function bufferUncert() {
  ///**************** Add node in tree *****
  var newNodeData = {
    "name": "400m Buffer",
    "r": 10,
    "clicked": 0,
    "type": "normal",
    "children": []
  };
  // create newNode with d3.hierarchy
  var newNode = d3.hierarchy(newNodeData);
  newNode.depth = selectedTreeNode.depth + 1;
  newNode.height = selectedTreeNode.height - 1;
  newNode.parent = selectedTreeNode;

  // push new node in selected tree node's children
  // if no child array, create an empty array
  if (!selectedTreeNode.children) {
    selectedTreeNode.children = [];
    selectedTreeNode.data.children = [];
  }
  selectedTreeNode.children.push(newNode);
  selectedTreeNode.data.children.push(newNode.data);

  // Update tree
  updateTree(selectedTreeNode);

  //***************** test code end ****************//

  //*************** Update donut chart
  // var data = JSON.parse(JSON.stringify(myData));
  myData.map((d) => {
    d["Pop_randomness"] = +d.uncertainty * 50
  })

  //Update donut charts
  donutData_G = updateDonutData(myData)
  historyDonutData.push(JSON.parse(JSON.stringify(donutData_G)));
  // window.UV.views.donuts.update(donutData_G);
  historyData.push(JSON.parse(JSON.stringify(myData)));
  // myMapData = data;
  // historyOperation.push("400m buffer")
  window.UV.data.matData.addOperation("400m Buffer", myData)
  // console.log(matrixData)
  window.UV.views.matrix.addColumn(matrixData);
}

//************ uncertainty for classification *******************************
function classifyButton() {
  $("#classbutton").toggleClass("active")
  window.UV.num.classifying++
  let uncert = classificationUncert()
  console.log(uncert);

  let r_f = d3.scaleLinear()
    .domain([1, 150])
    .range([3, 12])
  let r = 5

  if (uncert != 0) {
    r = r_f(uncert)
  }
  //********* Adding node to the tree ********


  var newNodeData = {
    "name": "Classification_" + window.UV.num.classifying,
    "r": r,
    "clicked": 0,
    "type": "normal",
    "children": []
  };
  // create newNode with d3.hierarchy
  var newNode = d3.hierarchy(newNodeData);
  newNode.depth = selectedTreeNode.depth + 1;
  newNode.height = selectedTreeNode.height - 1;
  newNode.parent = selectedTreeNode;

  // push new node in selected tree node's children
  // if no child array, create an empty array
  if (!selectedTreeNode.children) {
    selectedTreeNode.children = [];
    selectedTreeNode.data.children = [];
  }
  selectedTreeNode.children.push(newNode);
  selectedTreeNode.data.children.push(newNode.data);

  // Update tree
  updateTree(selectedTreeNode);

  //************ End adding node to the tree *********

  //*** dropdown button for classes filtering ****
  $('#dropdown-class')
    .dropdown({
      placeholder: 'CLASSES',
      values: [{
          name: "NONE",
          value: ""
        },
        {
          name: "Other",
          value: "Other"
        },
        {
          name: "Under Served",
          value: "Underserved"
        }
      ],
      onChange: function(value, text, $selectedItem) {

        if (value) {
          updateParameter();
        }

      }
    });
  //***** end dropdown class filtering ***
  historyData.push(JSON.parse(JSON.stringify(myData)));
} // end classification uncertainty calculation

//************ uncertainty for brushing and filtering *******************************
function brushingFiltering() {
  window.UV.num.filtering++

  let r_f = d3.scaleLinear()
    .domain([1, 20])
    .range([3, 12])
  let r = 8

    //matrix
  let uncert = brushingUncert()
  console.log("uncert", uncert);
  if (uncert != 0) {
    r = r_f(uncert)
  }

  //*********** Adding node to the tree ************
  var newNodeData;

    newNodeData = {
      "name": "Filtering_" + window.UV.num.filtering,
      "r": r,
      "clicked": 0,
      "type": "normal",
      "children": []
    };

  // create newNode with d3.hierarchy
  var newNode = d3.hierarchy(newNodeData);
  newNode.depth = selectedTreeNode.depth + 1;
  newNode.height = selectedTreeNode.height - 1;
  newNode.parent = selectedTreeNode;

  // push new node in selected tree node's children
  // if no child array, create an empty array
  if (!selectedTreeNode.children) {
    selectedTreeNode.children = [];
    selectedTreeNode.data.children = [];
  }
  selectedTreeNode.children.push(newNode);
  selectedTreeNode.data.children.push(newNode.data);

  // Update tree
  updateTree(selectedTreeNode);
  //********** End adding node to the tree **********

  //Donut chart
  donutData_G = updateDonutData(myData)
  historyDonutData.push(JSON.parse(JSON.stringify(donutData_G)));

  historyData.push(JSON.parse(JSON.stringify(myData)))
}

//************ uncertainty for models *******************************
function modelUncertainty() {
  // numModel++;
  window.UV.num.model++
  let max = findMax(donutData_G, "total").total
  let r_f = d3.scaleLinear()
    .domain([1, 40])
    .range([5, 12])
  let r = r_f(max)

    //*********** Adding node to the tree ************
    var newNodeData = {
      "name": "Model " + window.UV.num.model,
      "r": r,
      "clicked": 0,
      "mean": 2 + window.UV.num.model,
      "max": 5 + window.UV.num.model,
      "min": 8 + window.UV.num.model,
      "type": "model",
      "children": []
    };
  // create newNode with d3.hierarchy
  var newNode = d3.hierarchy(newNodeData);
  newNode.depth = selectedTreeNode.depth + 1;
  newNode.height = selectedTreeNode.height - 1;
  newNode.parent = selectedTreeNode;

  // push new node in selected tree node's children
  // if no child array, create an empty array
  if (!selectedTreeNode.children) {
    selectedTreeNode.children = [];
    selectedTreeNode.data.children = [];
  }
  selectedTreeNode.children.push(newNode);
  selectedTreeNode.data.children.push(newNode.data);

  // Update tree
  updateTree(selectedTreeNode);
  //********** End adding node to the tree **********
}

function viewBuffer() {
  var bufferSize = $("#buffer").dropdown('get value');
  // console.log("bufferSize", bufferSize)

  if (eyebuttonClick && bufferSize == 400 && myData) {
    $(eyebutton).html("<i class=\"eye slash icon\"></i>")

    var data = myData;
    var markers = [];
    for (var i = 0; i < data.length; i++) {
      //var radii = +(data[i].pop_uncer) + +(data[i].uncertain01);
      var lat = data[i].lat;
      var lon = data[i].lon;
      // mapCircle(lat, lon, radii);
      var marker = new L.circle([lat, lon], +bufferSize, {
        color: 'blue',
        weight: 1
      })
      // .addTo(map);
      markers.push(marker)
    }
    markerlayer = L.layerGroup(markers);
    map.addLayer(markerlayer);
    eyebuttonClick = 0;
  } else if (bufferSize == 400 && myData) {
    $(eyebutton).html("<i class=\"eye icon\"></i>");
    map.removeLayer(markerlayer);
    eyebuttonClick = 1;
  }
}

function sortDown() {
  if (donutData_G) {
    // var donutData = donutData_G;
    donutData_G.sort((a, b) => b.total - a.total);
    // console.log(donutData)
    window.UV.views.donuts.update(donutData_G);
  }
}

function sortUp() {
  if (donutData_G) {
    // var donutData = donutData_G;
    donutData_G.sort((a, b) => a.total - b.total);
    // console.log(donutData)
    window.UV.views.donuts.update(donutData_G);
  }
}

///
////////////////////////// set uncertainty slider value ////////
///
var uncertSlider = document.getElementById('slider-uncert');
var uncertSliderValueElement = document.getElementById('slider-uncert-value');
variableName.push("uncertainty")
minAll.push(0)
maxAll.push(0)

// uncertainty slider
noUiSlider.create(uncertSlider, {
  start: [0.0],
  connect: [false, true],
  // step: 1000,
  range: {
    'min': [-2.0],
    'max': [5.0]
  }
});

function setUncertSlider(data, varType) {


  varType = varType.map((d) => d + "_uncert")
  // debugger;
  data.forEach(function(d) {
    d.showUncert = 0;
    varType.forEach(function(v) {
      d.showUncert = d.showUncert + +d[v]
    })
  })

  var min = findMin(data, "showUncert")["showUncert"];
  var max = findMax(data, "showUncert")["showUncert"];
  //console.log("min", min, "max", max);
  if (max == min) {
    max = max + 1;
  }
  uncertSlider.noUiSlider.updateOptions({
    start: [0.0],
    range: {
      'min': [-2.0],
      'max': Math.ceil(max)
    }
  });
}

uncertSlider.noUiSlider.on('update', function(values, handle) {
  $("#slider-uncert-value").val(values[handle]);


  if (myData && g_var.length) {
    minAll[0] = values[handle];
    updateParameter();
  } else {
    if (markerlayer) {
      map.removeLayer(markerlayer)
    }
  }

});

uncertSliderValueElement.addEventListener('change', function() {
  uncertSlider.noUiSlider.set(this.value);
});

///
//////////////////// set variable slider value ////////
///
var slider = [];
var sliderValueElements = [];

slider.push(document.getElementById('slider-var1'));
sliderValueElements.push([
  document.getElementById('slider-var-left1'),
  document.getElementById('slider-var-right1')
])
variableName.push("NONE")
minAll.push(0);
maxAll.push(0);

// setup slider
noUiSlider.create(slider[0], {
  start: [1000, 5000],
  connect: [false, true, false],
  // step: 1000,
  range: {
    'min': [100],
    'max': [10000]
  }
});


slider[0].noUiSlider.on('update', function(values, handle) {
  sliderValueElements[0][handle].value = values[handle];

  if (myMapData) {
    minAll[1] = values[0];
    maxAll[1] = values[1];
    updateParameter();
  }
});

sliderValueElements[0][0].addEventListener('change', function() {
  slider[0].noUiSlider.set(this.value);
});

var numVarSliders = 1;

// add html in "var-sliders" div node
function addVarSlider() {
  numVarSliders++;
  var index = numVarSliders;
  var divSlider = document.createElement('div');
  divSlider.id = "var-slider" + index;

  var node = document.getElementById("var-sliders");
  node.appendChild(divSlider);
  // use template literal (i.e., ``) for writing html as it is
  divSlider.innerHTML =
    `<div class="ui middle alligned grid">
    <div class="sixteen wide column">
      <div class="ui selection dropdown" id="dropdown-var` + index + `">
        <div class="text">Variables</div>
        <i class="dropdown icon"></i>
        <div class="menu">
          <div class="item" data-value="0">NONE</div>
        </div>
      </div>
    </div>
    <div class="seven wide column">
      <div class="slider" id="slider-var` + index + `"></div>
    </div>
    <div class="nine wide column">
        <!-- <div id="slider-step-value"></div> -->
      <div class="ui small labeled input">
        <div class="ui label">
          Value:
        </div>
        <input style="width:30%" placeholder="value" type="text" id="slider-var-left` + index + `">
        <input class="ui disabled input" style="width:30%" placeholder="value" type="text" id="slider-var-right` + index + `">
      </div>
    </div>
  </div>`;

  $('#dropdown-var' + index)
    .dropdown({
      placeholder: 'NONE',
      values: dropdown_names,
      onChange: function(value, text, $selectedItem) {
        if (text !== undefined) {
          setVarSlider(index, myData, text)
        }

      }
    });

  // prepare slider
  slider.push(document.getElementById('slider-var' + index));
  sliderValueElements.push([
    document.getElementById('slider-var-left' + index),
    document.getElementById('slider-var-right' + index)
  ])
  variableName.push("NONE")
  minAll.push(0);
  maxAll.push(0);

  // setup slider
  noUiSlider.create(slider[index - 1], {
    start: [1000, 5000],
    connect: [false, true, false],
    // step: 1000,
    range: {
      'min': [100],
      'max': [10000]
    }
  });


  slider[index - 1].noUiSlider.on('update', function(values, handle) {
    sliderValueElements[index - 1][handle].value = values[handle];
    if (myMapData) {
      minAll[index] = values[0];
      maxAll[index] = values[1];
      updateParameter();
    }
    // stepSliderValueElement.innerHTML = values[handle]
  });
  sliderValueElements[index - 1][0].addEventListener('change', function() {
    slider[index - 1].noUiSlider.set(this.value);
  });
}

function removeVarSlider() {
  var node = document.getElementById("var-slider" + numVarSliders);
  node.remove();
  numVarSliders--;
  var index = numVarSliders;
  // slider[index].noUiSlider.destroy()
  slider.pop();
  sliderValueElements.pop();
  minAll.pop();
  maxAll.pop();
  variableName.pop();

  updateParameter()
}

function setVarSlider(index, data, varType) {

  variableName[index] = varType;
  var min = findMin(data, varType)[varType];
  var max = findMax(data, varType)[varType];
  // console.log("min", min, "max", max);
  if (max == min) {
    max = max + 1;
  }
  slider[index - 1].noUiSlider.updateOptions({
    start: [min - 0.1, max],
    range: {
      'min': Math.floor(min) - 0.1,
      'max': Math.ceil(max)
    }
  });
}

function updateParameter() {
  if (g_var.length) {
    var var_name = g_var.map((d) => d + "_uncert")
  }

  myData.forEach(function(element) {
    var visible = true;
    var uncertainty = 0;


    for (var i = 1; i < variableName.length; i++) {
      if (+element[variableName[i]] > +maxAll[i] || +element[variableName[i]] < +minAll[i]) {
        visible = false;
      }
    }

    if (g_var.length) {
      var_name.forEach(function(r) {
        uncertainty = uncertainty + +element[r]
      })
      if (uncertainty < +minAll[0] - 0.01) {
        visible = false;
      }
    }

    if ($('#dropdown-class').dropdown("get value")) {
      if (element[classVar] !== $('#dropdown-class').dropdown("get value")) {
        visible = false;
      }
    }

    element.visible = visible;
  });

  updateMap();
}


function updateDonutData(data) {
  let donutData = []

  variables.forEach(function(key) {
    let random = key + "_randomness"
    let fuzzy = key + "_fuzzyness"

    myData.map((d) => {
      d[key + "_uncert"] = +d[random] + +d[fuzzy]
    })
  })

  variables.forEach(function(key) {
    let random = key + "_randomness"
    let fuzzy = key + "_fuzzyness"
    let uncert = key + "_uncert"

    let maxV = findMax(data, uncert)
    let name = key.split("_")[0]
    // console.log("maxV", maxV);
    // debugger;
    donutData.push({
      data: [{
          cat: "randomness",
          val: +maxV[random]
        },
        {
          cat: "fuzzyness",
          val: +maxV[fuzzy]
        }
      ],
      type: name,
      detailed: name,
      total: +maxV[uncert],
      clicked: 0
    })
  })

  window.UV.views.donuts.update(donutData);

  return donutData;

}



function selectAll() {
  selectIndexes = []
  for (key in markerPointsLayer._layers) {
    var point = markerPointsLayer._layers[key]
    if (point.options.color == "black") {
      point.setStyle({
        fillColor: "red"
      })
    }
    selectIndexes.push(point.options.myCustomId)
  }
  console.log(selectIndexes);
}


function deleteAll() {
  if (selectIndexes.length) {
    // restoreData.push(JSON.parse(JSON.stringify(myData)));
    // restoreData.push(myMapData)
    data = JSON.parse(JSON.stringify(historyData[0]))
    for (var i = 0; i < myData.length; i++) {
      myData[i]["Pop_randomness"] = data[i]["Pop_randomness"]
    }

    for (var i = selectIndexes.length - 1; i >= 0; i--) {
      //  console.log(selectIndexes[i])
      myData[selectIndexes[i]]["Pop_uncert"] = 0
      myData[selectIndexes[i]]["Pop_randomness"] = 0
      myData[selectIndexes[i]]["Pop_fuzzyness"] = 0
    }

    updateParameter();
    selectIndexes = [];
  }
}

function redoDelete() {
  if (restoreData.length) {
    myData = JSON.parse(JSON.stringify(restoreData[restoreData.length - 1]));
    // resetSlider();
    updateParameter();
    restoreData.pop();

  }
}

// function resetSlider() {
//   map.addLayer(markerPieLayer)
//   // variableName.forEach(function(v, i) {
//   //   if (i === 0 && g_var.length) {
//   //     setUncertSlider(myData, g_var)
//   //   } else if (i > 0) {
//   //     setVarSlider(i, myData, v)
//   //   }
//   // })
// }
$("#showPie").click(function() {
  if ($("#showPie").hasClass("active")) {
    map.removeLayer(markerPieLayer)
  } else {
    map.addLayer(markerPieLayer)
  }
  $("#showPie").toggleClass("active");

})
