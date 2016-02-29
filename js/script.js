require([
      "esri/map", "esri/geometry/Point",
      "esri/symbols/SimpleMarkerSymbol", "esri/graphic",
      "dojo/_base/array",
      "dojo/domReady!"
  ],
  function(
    Map,
    Point,
    SimpleMarkerSymbol,
    Graphic,
    arrayUtil
  ) {
    var map = new Map("map", {
      basemap: "streets",
      center: [-77.0164, 38.9047],
      zoom: 14
    });
    var self = this;
    var busArray= [];
    var iconPath = "M2.386,21.467h2.386v14.312H2.386C1.067,35.779,0,34.717,0,33.394v-9.542C0,22.54,1.067,21.467,2.386,21.467z M73.948,21.467h-2.388v14.312h2.388c1.317,0,2.386-1.062,2.386-2.385v-9.542C76.334,22.54,75.268,21.467,73.948,21.467z M66.792,16.698v42.937c0,2.638-2.133,4.771-4.771,4.771v4.771c0,2.639-2.133,4.771-4.771,4.771h-4.772   c-2.637,0-4.771-2.137-4.771-4.771v-4.771H28.626v4.771c0,2.639-2.134,4.771-4.771,4.771h-4.769c-2.638,0-4.771-2.137-4.771-4.771   v-4.771c-2.637,0-4.771-2.137-4.771-4.771V16.698C9.542,8.796,15.954,2.386,23.855,2.386H52.48   C60.382,2.386,66.792,8.794,66.792,16.698z M28.626,11.928h19.083V7.157H28.626V11.928z M23.855,54.866   c0-2.641-2.134-4.771-4.769-4.771c-2.637,0-4.771,2.133-4.771,4.771c0,2.635,2.134,4.771,4.771,4.771   C21.72,59.636,23.855,57.499,23.855,54.866z M62.021,54.866c0-2.641-2.133-4.771-4.771-4.771s-4.771,2.133-4.771,4.771   c0,2.635,2.136,4.771,4.771,4.771C59.889,59.636,62.021,57.499,62.021,54.866z M62.021,16.698H14.313v28.625h47.708V16.698   L62.021,16.698z";

    map.on("load", getBuses);

    function createSymbol(path, color){
      var markerSymbol = new esri.symbol.SimpleMarkerSymbol();
      markerSymbol.setPath(path);
      markerSymbol.setColor(new dojo.Color(color));
      markerSymbol.setOutline(null);
      return markerSymbol;
    }

    function getBuses(){
      $.get("https://api.wmata.com/Bus.svc/json/jBusPositions?All&api_key=635e0ed2348f420cbe874f1bcd5d1b11", function(d){
        busArray = d.BusPositions;
        busArray.forEach(function(point){
          var graphic = new Graphic(new Point([point.Lon, point.Lat]), createSymbol(iconPath, "black"));
          map.graphics.add(graphic);
        })
      });
    }
  });
