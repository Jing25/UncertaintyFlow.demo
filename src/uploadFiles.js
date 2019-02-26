//Initialization
function uploadFiles(filename) {
  var file = filename || document.getElementById("fileupload").file[0].name;
  // var filename = file || "Data/myData_test03.csv";
  //$("#openFile").hide()

  d3.csv(file, function(data) {
    //get data
    myData = data;
    //console.log(data);
    myMapData = JSON.parse(JSON.stringify(data));

    // add visibility attribute
    myData.forEach(function(element) {
      element["visible"] = true;
      element["filtered"] = false;
      element["TTrip_uncert"] = 0;
    });
    myMapData.forEach(function(element) {
      element["visible"] = true;
    });


    // DonutCharts
    var donutData = [];

    variables.forEach(function(key) {
      let random = key + "_randomness"

      myData.map((d) => {
        d[key + "_uncert"] = +d[random]
      })
    })

    variables_uncert.forEach(function(key) {

      var maxV = findMax(data, key)
      var name = key.split("_")[0]
      donutData.push({
        data: [{
            cat: "randomness",
            val: +maxV[key]
          },
          {
            cat: "fuzzyness",
            val: 0
          }
        ],
        type: name,
        detailed: name,
        total: +maxV[key],
        clicked: 0
      })
    })

    // Matrix data
    // historyOperation.push("Initial");

    matrixData = window.UV.data.matData.getMatrixData("Initial", data);
    donutData_G = donutData
    historyDonutData.push(JSON.parse(JSON.stringify(donutData)));
    historyData.push(JSON.parse(JSON.stringify(myData)));
    window.UV.views.donuts.create(donutData);

    window.UV.views.matrix.setView();
    window.UV.views.matrix.setData(matrixData)
    window.UV.views.matrix.create("Initial");

    //flowTree
    updateTree(root);

    // Map
    var markers = [];
    for (var i = 0; i < data.length; i++) {
      var radii = +(data[i].pop_uncer) + +(data[i].uncertain01);
      var lat = data[i].lat;
      var lon = data[i].lon;
      markers.push(mapPoint(lat, lon))
    }
    markerPointsLayer = L.layerGroup(markers);
    map.addLayer(markerPointsLayer);

    //dropdown variables
    variables.forEach(function(v) {
      dropdown_names.push({
        name: v
      })
    })
    $('#dropdown-var1')
      .dropdown({
        placeholder: 'NONE',
        values: dropdown_names,
        onChange: function(value, text, $selectedItem) {
          if (text !== undefined) {
            setVarSlider(1, myMapData, text)
          }

        }
      });



    $('#dropdown-var-matrix')
      .dropdown({
        placeholder: 'NONE',
        values: dropdown_names,
        onChange: function(value, text, $selectedItem) {
          if (text !== undefined) {
            //setVarSlider(1, myMapData, text)
            var v = text + "_uncert"
            window.UV.views.matrix.changeVariable(v)
          }

        }
      });
    $('#dropdown-var-matrix').dropdown('set selected', "Pop")

    addVarButton()

    $('#dropdown-uncertainty-value')
      .dropdown({
        values: [{
            name: 'Value',
            value: 'value'
          },
          {
            name: 'Uncertainty',
            value: 'uncertainty',
            selected: true
          }
        ]
      });

    // end load file
  })
}
