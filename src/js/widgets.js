define([
    "mag/map",
    "esri/widgets/Zoom",
    "esri/widgets/Home",
    "esri/widgets/Legend",
    "esri/widgets/BasemapToggle",
    "esri/widgets/Locate",
    "esri/widgets/Search",
    "esri/tasks/Locator",
    "esri/geometry/Extent",
    "esri/widgets/Expand"
], function({
    map,
    view
}, Zoom, Home, Legend, BasemapToggle, Locate, Search, Locator, Extent, Expand) {

    //Add legend widget - Desktop
    var legend = new Legend({
        view,
        container: "legendContainer"
    });
    view.ui.add(legend, 'top-right');

    // Legend widget - Mobile
    var expandLegend = new Expand({
        view: view,
        content: new Legend({
            view: view,
            container: document.createElement("div")
        })
    });
    // Load
    var isResponsiveSize = view.widthBreakpoint === "xsmall";
    updateView(isResponsiveSize);

    // Breakpoints
    view.watch("widthBreakpoint", function(breakpoint) {
        switch (breakpoint) {
            case "xsmall":
                updateView(true);
                break;
            case "small":
            case "medium":
            case "large":
            case "xlarge":
                updateView(false);
                break;
            default:
        }
    });

    function updateView(isMobile) {
        setLegendMobile(isMobile);
    }

    function setLegendMobile(isMobile) {
        var toAdd = isMobile ? expandLegend : legend;
        var toRemove = isMobile ? legend : expandLegend;

        view.ui.remove(toRemove);
        view.ui.add(toAdd, "top-right");
    }

    //Add basemap toggle widget
    var basemapToggle = new BasemapToggle({
        view: view,
        nextBasemap: "hybrid"
    });
    basemapToggle.visibleElements = {
        title: true
    };

    basemapToggle.on('toggle', function(event) {
        const tractsLayer = map.findLayerById("tracts");

        if (event.current.title === "Imagery with Labels") {
            tractsLayer.opacity = .5;
        } else {
            tractsLayer.opacity = .9;
        }
    });
    view.ui.add(basemapToggle, "bottom-left");

    //Add zoom widget
    var zoom = new Zoom({
        view
    });
    view.ui.add(zoom, 'top-left');

    //Add home widget
    var home = new Home({
        view
    });
    view.ui.add(home, 'top-left');

    //Add locate widget
    var locate = new Locate({
        view
    });
    view.ui.add(locate, 'top-left');

    //Add search widget
    let search = new Search({
        view,
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
    // const handler = search.on('search-focus', event => {
    //     handler.remove();
    //     let $searchDiv = $(".esri-search");
    //     const input = $searchDiv.find('.esri-search__input')[0];
    //     if (input) {
    //         input.onfocusout = null;
    //     }
    // });

    view.ui.add(search, "bottom-right");

});
