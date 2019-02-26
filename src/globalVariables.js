window.UV = {}

window.UV.views = {
  matrix: new UncertaintyMatrix(),
  donuts: new DonutCharts()
}

window.UV.data = {
  matData: new MatrixData()
}

window.UV.num = {
  brushing: 0,
  filtering: 0,
  classifying: 0,
  model: 0
}

var myData;
var myMapData;
var donutData_G;
var g_var = [];   // types of variables that is chosen
var historyData = [];
var historyDonutData = [];
var historyOperation = [];
var matrixData;
var dropdown_names = [];


var classVar = "UndSer_Lvl"

var variables = ["TTrip", "Transit", "Hospital", "IntPoints", "BNDes",
  "Pop", "PecWhi", "MedAge", "PecV", "Income"
]
var variables_uncert = variables.map( (d)=> d + "_uncert" );

var eyebuttonClick = 1;
var markerlayer;
var markerPointsLayer;
var markerPieLayer;


var objTree = {
  "name": "Initial"
}
var radiusTree = [7]
var treeNode;
var numModel = 0;

//sliders
var variableName = [];
var minAll = [];
var maxAll = [];

//barCharts
var barChartData = [];
