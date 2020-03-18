var app = {};

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/geometry/Extent",
    "dojo/topic",
    "dojo/domReady!"
], function(Map, MapView, Extent, tp) {

    let $splashModal = $('#splashModal');

    $(window).on('load', function() {
        $splashModal.modal('show');
    });

    app.map = new Map({
        basemap: "streets-night-vector"
    });

    app.view = new MapView({
        container: "viewDiv",
        map: app.map,
        extent: config.initExtent,
        constraints: {
            rotationEnabled: false,
            minZoom: 3
        },
        ui: {
            components: []
        },
        popup: {
            dockEnabled: false,
            collapseEnabled: false,
            dockOptions: {
                buttonEnabled: false,
                breakpoint: false,
            }
        }
    });

    app.view.when(() => tp.publish('map-loaded'));

    // Instantiate a slider
    // var mySlider = $("#transparencySlider").slider();

    // mySlider.on('slide', function(e) {

    //     let taz = app.map.findLayerById('TAZ');
    //     let raz = app.map.findLayerById('RAZ');
    //     let mpa = app.map.findLayerById('MPA');

    //     taz.opacity = e.value;
    //     raz.opacity = e.value;
    //     mpa.opacity = e.value;

    // }).data('slider');


    var maxExtent = new Extent({
        xmin: -13574253.11189688,
        ymin: 3469475.629806112,
        xmax: -11226102.906676117,
        ymax: 4615421.849749786,
        spatialReference: 102100
    });

    app.view.watch('extent', function(extent) {
        let currentCenter = extent.center;
        if (!maxExtent.contains(currentCenter)) {
            let newCenter = extent.center;
            if (currentCenter.x < maxExtent.xmin) {
                newCenter.x = maxExtent.xmin;
            }
            if (currentCenter.x > maxExtent.xmax) {
                newCenter.x = maxExtent.xmax;
            }
            if (currentCenter.y < maxExtent.ymin) {
                newCenter.y = maxExtent.ymin;
            }
            if (currentCenter.y > maxExtent.ymax) {
                newCenter.y = maxExtent.ymax;
            }

            let newExtent = app.view.extent.clone();
            newExtent.centerAt(newCenter);
            app.view.extent = newExtent;
        }
    });

    $(".infoBtn").click(function() {
        $("#contactModal").modal("show");
    })

    $(".btnInstructions").click(function() {
        $("#contactModal").modal("hide");
        $("#splashModal").modal("show");
    })

    function TurnOffAllLayers() {
        app.map.layers.forEach(function(layer) {
            layer.visible = false;
        });
    }
});