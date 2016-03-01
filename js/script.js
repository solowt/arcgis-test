require([
      "esri/map","esri/geometry/Point",
      "esri/symbols/PictureMarkerSymbol","esri/graphic",
      "esri/InfoTemplate","dojo/domReady!"
  ],
  function(
    Map,
    Point,
    PictureMarkerSymbol,
    Graphic,
    InfoTemplate
  ) {

    var map = new Map("map", {
      basemap: "streets",
      center: [-77.0164, 38.9047],
      zoom: 14
    });

    var self = this;
    var stationArray = [];
    var busArray = [];
    var intervalID = null;
    var iconPath = "http://i.imgur.com/SM9DA24.jpg";
    var rotateMap = {
                    NORTH: 90,
                    SOUTH: 270,
                    EAST: 180,
                    WEST: 0
                  }

    // map.on("load", getMetroStations);

    function createSymbol(url, color, direction){
      var markerSymbol = new esri.symbol.PictureMarkerSymbol();
      markerSymbol.setUrl(url);
      markerSymbol.setHeight(10);
      markerSymbol.setWidth(30);
      if (rotateMap[direction]){
        markerSymbol.setAngle(rotateMap[direction]);
      }
      markerSymbol.setColor(new dojo.Color(color));
      // markerSymbol.setOutline(null);
      return markerSymbol;
    }

    function createInfoTemplate(route, direction, offset, dest){
      var infoTemplate = new InfoTemplate();
      infoTemplate.setTitle(route);
      infoTemplate.setContent("<b>Direction: </b>"+direction+"<br/>"
        + "<b>Deviation from Schedule (Min): </b>"+offset+"<br/>"
        + "<b>Destination: </b>"+dest+"<br/>");
      return infoTemplate;
    }

    function getBuses(){
      map.graphics.clear();
      $.get("https://api.wmata.com/Bus.svc/json/jBusPositions?All&api_key=635e0ed2348f420cbe874f1bcd5d1b11", function(d){
        busArray = d.BusPositions;
        busArray.forEach(function(point){
          var graphic = new Graphic(new Point([point.Lon, point.Lat]), createSymbol(iconPath, "black", point.DirectionText));
          graphic.setInfoTemplate(createInfoTemplate(point.RouteID, point.DirectionText, point.Deviation, point.TripHeadsign));
          map.graphics.add(graphic);
        });
      });
    }

    function createMetroInfoTemplate(name, address, line, code){
      var infoTemplate = new InfoTemplate();
      infoTemplate.setTitle(name);
      infoTemplate.setContent("<b>Line: </b>"+line+"<br/>"
        + "<b>Code: </b>"+code+"<br/>"
        + "<b>Address: </b>"+address+"<br/>");
      return infoTemplate;
    }

    function createStaticSymbol(url){
      var markerSymbol = new esri.symbol.PictureMarkerSymbol();
      markerSymbol.setUrl(url);
      return markerSymbol;
    }

    function getMetroStations(){
      $.get("https://api.wmata.com/Rail.svc/json/jStations?api_key=635e0ed2348f420cbe874f1bcd5d1b11", function(d){
        stationArray = d.Stations;
        stationArray.forEach(function(point){
          var graphic = new Graphic(new Point([point.Lon, point.Lat]), createStaticSymbol("https://image.freepik.com/free-icon/baltimore-metro-logo-symbol_318-66152.png"));
          graphic.setInfoTemplate(createMetroInfoTemplate(point.Name, point.Address.Street, point.LineCode1, point.Code));
          map.graphics.add(graphic);
        });
      })
    }

    $(".busButton").click(function(){
      getBuses();
      intervalID = setInterval(getBuses, 10000);
    });

    $(".trainButton").click(function(){
      clearInterval(intervalID);
      map.graphics.clear();
      getMetroStations();
    })

  });
