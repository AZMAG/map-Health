define([
    "mag/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/geometry/Extent"
], function(config, Map, MapView, Extent) {

    let $splashModal = $('#splashModal');

    $(window).on('load', function() {
        // $splashModal.modal('show');
    });

    let map = new Map({
        basemap: "gray-vector",
    });

    let view = new MapView({
        container: "viewDiv",
        map,
        center: [-111.956, 33.409],
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


    $(".infoBtn").click(function() {
        $("#contactModal").modal("show");
    })

    $(".btnInstructions").click(function() {
        $("#contactModal").modal("hide");
        $("#splashModal").modal("show");
    })

    function TurnOffAllLayers() {
        map.layers.forEach(function(layer) {
            layer.visible = false;
        });
    }
    return { map, view }
});