define([
    "mag/map",
    "esri/widgets/Zoom",
    "esri/widgets/Home",
    "esri/widgets/Legend",
    "esri/widgets/Search",
    "esri/tasks/Locator",
    "esri/geometry/Extent",
    "esri/widgets/BasemapToggle",
    "esri/widgets/Locate",
], function({ map, view }, Zoom, Home, Legend, Search, Locator, Extent, BasemapToggle, Locate) {

    //Add home widget
    // var home = new Home({
    //     view: app.view
    // });
    // app.view.ui.add(home, 'bottom-left');
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

    //Add legend widget
    var legend = new Legend({
        view,
        container: "legendContainer"
    });
    view.ui.add(legend, 'bottom-right');

    //Add locate widget
    var locate = new Locate({
        view: view
    });
    view.ui.add(locate, 'bottom-left');

})