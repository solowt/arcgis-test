require(["esri/map",
  "esri/toolbars/draw",
  "esri/layers/StreamLayer",
  "esri/InfoTemplate",
  "esri/graphic",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleLineSymbol",
  "dojo/_base/Color",
  "dojo/on",
  "dojo/dom",
  "dojo/domReady!"
], function(Map, Draw, StreamLayer, InfoTemplate, Graphic, SimpleFillSymbol,
            SimpleLineSymbol, Color, on,dom) {
  var self = this;
  var busArray= [];
  $.get("https://api.wmata.com/Bus.svc/json/jBusPositions?All&api_key=635e0ed2348f420cbe874f1bcd5d1b11", function(d){
    busArray = d['BusPositions'];
  })

  var map,
      drawTools,
      streamLayer;

  function init(){
    map = new Map("map", {
      basemap: "gray",
      // center: [-122.402, 47.642],
      center: [-77.0164,38.9047],
      zoom: 10
    });

    drawTools = new Draw(map);

    //connect click events to UI buttons
    on(dojo.byId("cmdToggleStreamLayer"), "click", toggleStreamLayer);
    on(dojo.byId("cmdToggleSpatialFilter"), "click", toggleSpatialFilter);

    on(drawTools, "draw-end", function(evt){
      drawTools.deactivate();
      setSpatialFilter(evt.geometry);
      dojo.byId("cmdToggleSpatialFilter").value = "Clear Spatial Filter";
    });
  }

  /*************************************************
   *
   * Functions to add and remove Stream Layer
   *
   *************************************************/
  function toggleStreamLayer(){
    if(streamLayer){
      removeStreamLayer();
    }
    else{
      addStreamLayer();
    }
  }
  function addStreamLayer(){
    //url to stream service
    var svcUrl = dojo.byId("txtStreamUrl").value;

    //construct Stream Layer
    streamLayer = new StreamLayer(svcUrl, {
      purgeOptions: { displayCount: 10000 },
      infoTemplate: new InfoTemplate("Attributes", "${*}")
    });

    //When layer loads, register listeners for layer events and add layer to map
    streamLayer.on("load", function(){
      //Connect and Disconnect events
      streamLayer.on("connect", processConnect);
      streamLayer.on("disconnect", processDisconnect);

      //FilterChange event
      streamLayer.on("filter-change", processFilterChange);

      //Add layer to map
      map.addLayer(streamLayer);
    });
  }

  function removeStreamLayer(){
    if (streamLayer){
      map.removeLayer(streamLayer);
      streamLayer = null;
      map.graphics.clear();
    }
  }

  /*********************************************************
   *
   * Stream layer event handlers
   *
   *********************************************************/
  function processConnect(){
    dojo.byId("cmdToggleStreamLayer").value = "Remove Stream Layer";
    dojo.byId("txtStreamUrl").style.backgroundColor = "#008000";
    dojo.byId("cmdToggleSpatialFilter").value = "Draw Extent";
    dojo.byId("divFilterControls").style.display = "block";
  }

  function processDisconnect(){
    dojo.byId("cmdToggleStreamLayer").value = "Add Stream Layer";
    dojo.byId("txtStreamUrl").style.backgroundColor = "#8b0000";
    dojo.byId("divFilterControls").style.display = "none";
  }

  function processFilterChange(evt){
    //clear layer graphics
    streamLayer.clear();

    //the event contains a filter property that is the current filter set on the service
    //update map graphic to show current spatial filter
    var bbox = evt.filter.geometry;
    map.graphics.clear();
    if(bbox){
      map.graphics.add(new Graphic(bbox,
          new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL,
              new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                  new Color( [5, 112, 176] ), 2),
              new Color( [5, 112, 176, 0] ))));
    }
  }

  /************************************************
   *
   * Functions to set and clear spatial filter
   *
   ************************************************/
  function toggleSpatialFilter(){
    var currentSpatialFilter = null;
    if(streamLayer){
      currentSpatialFilter = streamLayer.getFilter().geometry;
    }
    if (!currentSpatialFilter){
      drawTools.activate(Draw.EXTENT);
    }
    else{
      setSpatialFilter(null);
      dojo.byId("cmdToggleSpatialFilter").value = "Draw Extent";
    }
  }

  //Set spatial filter on stream layer. Setting to null clears filter
  function setSpatialFilter(bbox){
    if (streamLayer){
      streamLayer.setGeometryDefinition(bbox);
    }
  }

  init();
});
