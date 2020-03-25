define([
    "mag/config",
    "mag/map",
], function (config, {
    map,
    view
}) {
    view.when(() => {
        startupIntro();
    });
});

function startupIntro() {
    const tour = {
        id: "hello-hopscotch",
        steps: [{
                title: "Instructions",
                content: 'Welcome to the Arizona Healthcare Assets Map.  Click next to continue to view the instructions on using this tool.',
                target: $("#helpInfo")[0],
                placement: "right",
                onShow: function () {
                    Focusable.setFocus($("#helpInfo"));
                }
            }, {
                title: "Navigation",
                content: 'Use the tools in this area to navigate around the map, toggle the basemap and find/zoom to an address.',
                target: $(".esri-ui-bottom-left")[0],
                placement: "top",
                onShow: function () {
                    Focusable.setFocus($(".esri-ui-bottom-left"));
                }
            },
            {
                title: "Toggle Population Metrics",
                content: 'Use this area to toggle between different population metrics.  This will change the background (Census Tracts) to give some demographic context to the map.',
                target: $("#populationMetrics").parent()[0],
                placement: "right",
                onShow: function () {
                    Focusable.setFocus($($("#populationMetrics").parent()));
                }
            },
            {
                title: "Toggle Healthcare Facilities Layers",
                content: 'The facilities that can be displayed on the map are shown here.  Click a checkbox to toggle the facilities layer on the map.',
                target: $("#layersList").parent()[0],
                placement: "right",
                onShow: function () {
                    Focusable.setFocus($($("#layersList").parent()));
                }
            },
            // {
            //     title: "Toggle Healthcare Facilities Layers",
            //     content: 'The facilities that can be displayed on the map are shown here.  Click a checkbox to toggle the facilities layer on the map.',
            //     target: $("#layersList").parent()[0],
            //     placement: "right",
            //     onShow: function () {
            //         Focusable.setFocus($($("#layersList").parent()));
            //     }
            // }
        ],
        showPrevButton: true,
        onStart: function () {
            Focusable.hide();
        },
        onEnd: function () {
            Focusable.hide();
        },
        onClose: function () {
            Focusable.hide();
        }
    };

    if(!localStorage.getItem('toured')){
        // Start the tour!
        hopscotch.startTour(tour);
        localStorage.setItem('toured', true);
    }

    $(".tutorial-btn").click(() => {
        hopscotch.startTour(tour);
    })
}
