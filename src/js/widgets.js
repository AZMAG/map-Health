require([
    "esri/widgets/Zoom",
    "esri/widgets/Home",
    "esri/widgets/Legend",
    "esri/widgets/Search",
    "esri/tasks/Locator",
    "esri/geometry/Extent",
    "esri/widgets/BasemapToggle",
    "dojo/topic"
], function (Zoom, Home, Legend, Search, Locator, Extent, BasemapToggle, tp) {
    tp.subscribe("map-loaded", setupWidgets);

    function setupWidgets() {
        //Add zoom widget
        var zoom = new Zoom({
            view: app.view
        });
        app.view.ui.add(zoom, 'bottom-right');

        //Add home widget
        var home = new Home({
            view: app.view
        });
        app.view.ui.add(home, 'bottom-right');

        //Add legend widget
        var legend = new Legend({
            view: app.view,
            container: "legendContainer"
        });

        $("#legendContainer").append(`<div style="margin-left: 30px; margin-bottom: 10px; margin-top:10px;" class="esri-legend__layer-row"><div class="esri-legend__layer-cell esri-legend__layer-cell--symbols"><div class="esri-legend__symbol"><div><svg overflow="hidden" width="24" height="24" style="touch-action: none;"><defs></defs><g transform="matrix(1.17333333,0.00000000,0.00000000,1.17333333,12.00000000,12.00000000)"><path fill="gray" fill-opacity="0.97" stroke="rgb(0, 0, 0)" stroke-opacity="0.097" stroke-width="0.26666666666666666" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" path="M -10,-10 L 10,0 L 10,10 L -10,10 L -10,-10 Z" d="M-10-10L 10 0L 10 10L-10 10L-10-10Z" fill-rule="evenodd" stroke-dasharray="none" dojoGfxStrokeStyle="solid"></path></g></svg></div></div></div><div id="legendId" class="esri-legend__layer-cell esri-legend__layer-cell--info">CAG Data</div></div>`);

        //Add search widget
        let search = new Search({
            view: app.view,
            includeDefaultSources: false,
            sources: [{
                locator: new Locator({
                    url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
                }),
                singleLineFieldName: 'SingleLine',
                outFields: ["Addr_type"],
                autoNavigate: true,
                searchExtent: new Extent({
                    xmin: -114.68,
                    ymin: 31.29,
                    xmax: -109.06,
                    ymax: 36.99
                }),
                placeholder: '302 N 1st Ave, Phoenix, AZ'
            }]
        });



        //https://community.esri.com/thread/216034-search-widgetin-onfocusout-in-47-causes-error-when-used-with-jquery
        //This is a temporary workaround that prevents an error caused by ESRI's JS Api when used with Jquery.
        const handler = search.on('search-focus', event => {
            handler.remove();
            let $searchDiv = $(".esri-search");
            const input = $searchDiv.find('.esri-search__input')[0];
            if (input) {
                input.onfocusout = null;
            }
        });

        app.view.ui.add(search, "bottom-right");

        var basemapToggle = new BasemapToggle({
            view: app.view,
            nextBasemap: "hybrid"
        });
        app.view.ui.add(basemapToggle, "bottom-left");

    }
})