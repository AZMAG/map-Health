require([
    "esri/widgets/Zoom",
    "esri/widgets/Home",
    "esri/widgets/Legend",
    "esri/widgets/Search",
    "esri/tasks/Locator",
    "esri/geometry/Extent",
    "esri/widgets/BasemapToggle",
    "dojo/topic"
], function(Zoom, Home, Legend, Search, Locator, Extent, BasemapToggle, tp) {

    tp.subscribe("map-loaded", addWidgets);

    function addWidgets() {
        //Add home widget
        // var home = new Home({
        //     view: app.view
        // });
        // app.view.ui.add(home, 'bottom-left');

        //Add zoom widget
        var zoom = new Zoom({
            view: app.view
        });
        app.view.ui.add(zoom, 'bottom-left');


        //Add legend widget
        var legend = new Legend({
            view: app.view,
            container: "legendContainer"
        });
        app.view.ui.add(legend, 'bottom-right');

        var basemapToggle = new BasemapToggle({
            view: app.view,
            nextBasemap: "hybrid"
        });
        app.view.ui.add(basemapToggle, "bottom-left");





    }
})