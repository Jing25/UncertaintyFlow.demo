// find the max object in an array
function findMax(data, key) {
  return data.reduce(function(a, b) {
    return (+a[key] > +b[key]) ? a : b;
  })
}

// find the min object in an array
function findMin(data, key) {
  return data.reduce(function(a, b) {
    return (+a[key] > +b[key]) ? b : a;
  })
}


//Search tree
function searchTree(element, matchingTitle) {
  if (element.name == matchingTitle) {
    return element;
  } else if (element.children != null) {
    var i;
    var result = null;
    for (i = 0; result == null && i < element.children.length; i++) {
      result = searchTree(element.children[i], matchingTitle);
    }
    return result;
  }
  return null;
}

function searchTreeAddNode(element, matchingTitle, data) {
  if (element.name == matchingTitle) {
    debugger;
    if (element.children == undefined) {

      element.children = []
    }
    element.children.push({
      "name": "400m Buffer"
    })
    return element
  } else if (element.children != null) {
    var i;
    var result = null;
    for (i = 0; result == null && i < element.children.length; i++) {
      result = searchTreeAddNode(element.children[i], matchingTitle);
    }
    return result;
  }
  return null;
}

function removeItemInArray(arr, item) {
  var index = arr.indexOf(item)
  if (index !== -1) arr.splice(index, 1);
}



function filterByClass(value) {
  if (myMapData && value) {
    // update visible attr in myData
    var variable = "UndSer_Lvl"
    myMapData.forEach(function(element) {
      // debugger;
      if (element[variable] == value) {
        element.visible = true;
      } else {
        element.visible = false;
      }
    });
    // debugger;

    // remove mappoints
    var divMapPoint = document.getElementsByClassName("leaflet-pane leaflet-marker-pane")[0];
    while (divMapPoint.firstChild) {
      divMapPoint.removeChild(divMapPoint.firstChild);
    }
    map.removeLayer(markerlayer)

    // add mappoints
    var markers = [];
    myMapData.forEach(function(element) {
      if (element.visible) {
        mapPoint(element.lat, element.lon)
        markers.push(mapCircleIndiv(element, g_var))
      }
    });
    // debugger;
    markerlayer = L.layerGroup(markers);
    map.addLayer(markerlayer);
  }
}

var numVarBtns = 1;
var btnActNum = 0;

function addVarButton() {

  numVarBtn = variables.length;

  var node = document.getElementById("var-buttons");

  for (var i = 0; i < numVarBtn; i++) {
    var btndiv = document.createElement('div');
    btndiv.classList.add("column")
    // var btndiv;
    btndiv.innerHTML =
      `
      <button class="ui button var-button" style="width:100%" onclick="varChoosing(` + i + `)" id="button` + i + `"></button>
      <div class="ui center aligned segment" id="text` + i + `"></div>
    `
    node.appendChild(btndiv)
    $('#button' + i).text(variables[i]);
  }
}

function varChoosing(index) {
  var btn = $("#button" + index);
  var tex = $("#text" + index);
  // var parameters = getModelParameters();

  if (btn.hasClass("active")) {
    btn.removeClass("active")
    tex.text('')
    btnActNum = btnActNum - 1;
  } else {
    btnActNum = btnActNum + 1;
    btn.addClass("active")
    tex.text("x" + btnActNum)
  }
  // if (btnActNum == parameters.length) {
  //   $('#model').removeClass("disabled")
  // } else {
  //   $('#model').addClass('disabled')
  // }
}

function getModelParameters() {
  var parameters = $('#parameters').val().split(',').map((d) => parseFloat(d))
  return parameters;
}

// Matrix data class
function MatrixData() {
  //matrix data manipulate

  //get data
  this.getMatrixData = function(opts, data) {
    var matrixData = {};
    // console.log("data", data);
    // debugger
    for (var i = 0; i < variables_uncert.length; i++) {
      var v = variables_uncert[i];
      matrixData[v] = [];

      data.forEach(function(d) {
        var obj = {};
        obj["Id"] = d["Id"];
        obj[opts] = d[v];

        matrixData[v].push(obj)
      })

    }

    return matrixData
  }

  // add new operation data
  this.addOperation = function(opts, data) {
    // opt: operation name i.e. historyOperation
    // data: 475 x num(v) x num(opts) i.e. historyData

    var hashdata = {};


    data.forEach(function(d) {
      var id = d.Id
      hashdata[id] = d;
    })

    variables_uncert.forEach(function(v) {

      for (var i = 0; i < matrixData[v].length; i++) {
        var id = matrixData[v][i]["Id"]
        matrixData[v][i][opts] = hashdata[id][v]

        let key = opts + "_uncert"
        if (key in data[0]) {
          // console.log("hashdata", hashdata);
          matrixData[v][i][key] = hashdata[id][key]
        }
      }

    })

  }
}

function classificationUncert() {

  if (markerPointsLayer) {
    map.removeLayer(markerPointsLayer)
  }

  let markers = [];

  let uncert = 0;

  let income = +$("#income").val()
  let pecWhi = +$("#pecWhi").val()

  for (var i = 0; i < myData.length; i++) {

    var lat = myData[i].lat;
    var lon = myData[i].lon;
    let radius = 30
    if (myData[i].visible) {
      if (+myData[i]["Income"] < income || +myData[i]["PecWhi"] < pecWhi) {
        myData[i]["UndSer_Lvl"] = "Underserved"
        markers.push(mapPoint(lat, lon, i, 'red', radius))
      } else {
        myData[i]["UndSer_Lvl"] = "Other"
        markers.push(mapPoint(lat, lon, i, 'blue', radius))
      }

    }
  }

  if (markers.length) {
    markerPointsLayer = L.layerGroup(markers);
    map.addLayer(markerPointsLayer);
  }

  myData.forEach(function(d) {

    let income_left = +d["Income"] - +d["Income_range"]
    let income_right = +d["Income"] + +d["Income_range"]
    let pecWhi_left = +d["PecWhi"] - +d["PecWhi_range"]
    let pecWhi_right = +d["PecWhi"] + +d["PecWhi_range"]

    if (income_left < income && income_right > income) {
      d["Classification_" + window.UV.num.classifying + "_uncert"] = [{
        num: 2,
        val: income - income_left
      }, {
        num: 3,
        val: income_right - income
      }]

      uncert = uncert + (income_right - income) / (income - income_left)

    } else if (pecWhi_left < pecWhi && pecWhi_right > pecWhi) {
      d["Classification_" + window.UV.num.classifying + "_uncert"] = [{
        num: 2,
        val: pecWhi - pecWhi_left
      }, {
        num: 3,
        val: pecWhi_right - pecWhi
      }]

      uncert = uncert + (pecWhi_right - pecWhi) / (pecWhi - pecWhi_left)

    } else {
      d["Classification_" + window.UV.num.classifying + "_uncert"] = [{
        num: 2,
        val: 0
      }, {
        num: 3,
        val: 0
      }]
    }

  })
  window.UV.data.matData.addOperation("Classification_" + window.UV.num.classifying, myData)
  window.UV.views.matrix.addColumn(matrixData);

  return uncert

}

function brushingUncert() {

  // let mdata = JSON.parse(JSON.stringify(myData));
  let uncert = 0
  let myPieCharts = [];

  myData.forEach(function(d, i) {

    variables_uncert.forEach(function(v) {
      if (d.visible == false) {
        myData[i][v] = 0;
        myData[i]["filtered"] = true;
      }
    })


    if ($('#dropdown-var1').dropdown("get text") != "Variables") {
      let left = +$("#slider-var-left1").val()
      let right = +$("#slider-var-right1").val()
      let v = $('#dropdown-var1').dropdown("get text")
      let range = v + "_range";
      let x_left = +d[v] - +d[range]
      let x_right = +d[v] + +d[range]

      if (x_left < left && x_right > left) {
        d["Filtering_" + window.UV.num.filtering + "_uncert"] = [{
          num: 0,
          val: left - x_left
        }, {
          num: 1,
          val: x_right - left
        }]

        myPieCharts.push(L.minichart([d.lat, d.lon], {
          data: [left - x_left, x_right - left],
          width: 10,
          type: "pie"
        }));
        uncert = uncert + Math.abs(((x_right - left) - (left - x_left)) / ((x_right - left) + (left - x_left)))

      } else if (x_left < right && x_right > right) {
        d["Filtering_" + window.UV.num.filtering + "_uncert"] = [{
          num: 0,
          val: x_right - right
        }, {
          num: 1,
          val: right - x_left
        }]

        myPieCharts.push(L.minichart([d.lat, d.lon], {
          data: [right - x_left, x_right - right],
          width: 10,
          type: "pie"
        }));

        uncert = uncert + Math.abs(((x_right - right) - (right - x_left)) / ((x_right - right) + (right - x_left)))

      } else {
        d["Filtering_" + window.UV.num.filtering + "_uncert"] = [{
          num: 0,
          val: 0
        }, {
          num: 1,
          val: 0
        }]

      }
    }



  })

  if (markerPieLayer) {
    map.removeLayer(markerPieLayer)
  }
  markerPieLayer = L.layerGroup(myPieCharts);
  // console.log(myPieCharts);

  window.UV.data.matData.addOperation("Filtering_" + window.UV.num.filtering, myData)
  // console.log("myData: ", myData);
  window.UV.views.matrix.addColumn(matrixData);
  // console.log("matrixData: ", matrixData);
  // historyData.push(JSON.parse(JSON.stringify(myData)));
  // myData = mdata;

  return uncert;

}
