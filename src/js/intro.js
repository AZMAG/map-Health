define([
    "mag/config",
    "mag/map",
], function(config, {
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
                onShow: function() {
                    Focusable.setFocus($("#helpInfo"));
                }
            }, {
                title: "Navigation",
                content: 'Use the tools in this area to navigate around the map, toggle the basemap and find/zoom to an address.',
                target: $(".esri-ui-bottom-left")[0],
                placement: "top",
                onShow: function() {
                    Focusable.setFocus($(".esri-ui-bottom-left"));
                }
            },
            {
                title: "Toggle Population Metrics",
                content: 'Use this area to toggle between different population metrics.  This will change the background (Census Tracts) to give some demographic context to the map.',
                target: $("#populationMetrics").parent()[0],
                placement: "right",
                onShow: function() {
                    Focusable.setFocus($($("#populationMetrics").parent()));
                }
            },
            {
                title: "Toggle Healthcare Facilities Layers",
                content: 'The facilities that can be displayed on the map are shown here.  Click a checkbox to toggle the facilities layer on the map.',
                target: $("#layersList").parent()[0],
                placement: "right",
                onShow: function() {
                    Focusable.setFocus($($("#layersList").parent()));
                }
            },
            {
                title: "Open a summary report",
                content: 'Use this area of the site to open a Summary Report window that includes demographics and healthcare asset information on a particular County, Jurisdiction or Zip code.',
                target: $("#reportForm").parent()[0],
                placement: "right",
                onShow: function() {
                    Focusable.setFocus($($("#reportForm").parent()));
                }
            },
            {
                title: "Identify features on the map",
                content: 'Click anywhere on the map to identify features underneath the cursor.  You can click on points or on the background Population Metrics to get a popup with more information.',
                target: $(".introTarget")[0],
                placement: "bottom",
                onShow: function() {
                    Focusable.hide();
                }
            }
        ],
        showPrevButton: true,
        onStart: function() {
            Focusable.hide();
        },
        onEnd: function() {
            Focusable.hide();
        },
        onClose: function() {
            Focusable.hide();
        }
    };

    if (!localStorage.getItem('toured')) {
        // Start the tour!
        hopscotch.startTour(tour);
        localStorage.setItem('toured', true);
    }

    $("body").on("click", ".tutorial-btn", () => {
        hopscotch.startTour(tour);
    })
}
