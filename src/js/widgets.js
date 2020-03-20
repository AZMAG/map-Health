define([
    "mag/map",
    "esri/widgets/Zoom",
    "esri/widgets/Home",
    "esri/widgets/Legend",
    "esri/widgets/BasemapToggle",
    "esri/widgets/Locate",
], function({ map, view }, Zoom, Home, Legend, BasemapToggle, Locate) {

    //Add legend widget
    var legend = new Legend({
        view,
        container: "legendContainer"
    });
    view.ui.add(legend, 'top-right');

    //Add basemap toggle widget
    var basemapToggle = new BasemapToggle({
        view,
        nextBasemap: "hybrid"
    });
    view.ui.add(basemapToggle, "bottom-left");

    //Add zoom widget
    var zoom = new Zoom({
        view
    });
    view.ui.add(zoom, 'bottom-left');

    //Add home widget
    var home = new Home({
        view
    });
    view.ui.add(home, 'bottom-left');

    //Add locate widget
    var locate = new Locate({
        view
    });
    view.ui.add(locate, 'bottom-left');

})
