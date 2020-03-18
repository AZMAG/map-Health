    define([
            "mag/map",
            "esri/widgets/Sketch/SketchViewModel",
            "esri/geometry/Polyline",
            "esri/geometry/Point",
            "esri/Graphic",
            "esri/layers/FeatureLayer",
            "esri/geometry/geometryEngine",
            "esri/widgets/Expand",
            "esri/core/watchUtils",
            "dojo/topic"
        ], function({ map, view },
            SketchViewModel,
            Polyline,
            Point,
            Graphic,
            FeatureLayer,
            geometryEngine,
            Expand,
            watchUtils
        ) {

            // App 'globals'
            let sketchViewModel, featureLayerView, pausableWatchHandle, reportExpand;

            let centerGraphic,
                edgeGraphic,
                polylineGraphic,
                bufferGraphic,
                centerGeometryAtStart,
                labelGraphic;

            const unit = "miles";

            // Create layers
            const graphicsLayer = map.findLayerById("graphicsLayer");
            const graphicsLayer2 = map.findLayerById("graphicsLayer2");

            // Update UI
            setUpAppUI();
            setUpSketch();

            function setUpAppUI() {

                // When layer is loaded, create a watcher to trigger drawing of the buffer polygon
                // view.whenLayerView(featureLayer).then(function(layerView) {
                //     featureLayerView = layerView;

                //     pausableWatchHandle = watchUtils.pausable(
                //         layerView,
                //         "updating",
                //         function(val) {
                //             if (!val) {
                //                 drawBufferPolygon();
                //             }
                //         }
                //     );

                view.when(function() {
                    drawBufferPolygon();
                    graphicsLayer.visible = false;
                    graphicsLayer2.visible = false;
                    // Display the chart in an Expand widget
                    reportExpand = new Expand({
                        expandIconClass: "esri-icon-table",
                        expandTooltip: "Open Report",
                        expanded: false,
                        view,
                        content: document.getElementById("reportPanel")
                    });

                    reportExpand.watch("expanded", (expanded) => {
                        if (expanded) {
                            toggleReport(true);

                        } else {
                            toggleReport(false);
                        }

                    })

                    $("#reportPanel").show();

                    // Add our components to the UI
                    view.ui.add(reportExpand, "top-right");

                });
            }

            function toggleReport(expand) {
                graphicsLayer.visible = expand;
                graphicsLayer2.visible = expand;

                if (expand) {
                    sketchViewModel = new SketchViewModel({
                        view,
                        layer: graphicsLayer
                    });
                    sketchViewModel.on("update", onMove);
                } else {
                    if (sketchViewModel) {
                        sketchViewModel.detstroy();
                    }
                }
            }

            function setUpSketch() {

            }

            function onMove(event) {
                // If the edge graphic is moving, keep the center graphic
                // at its initial location. Only move edge graphic
                if (event.toolEventInfo && event.toolEventInfo.mover.attributes.edge) {
                    const toolType = event.toolEventInfo.type;
                    if (toolType === "move-start") {
                        centerGeometryAtStart = centerGraphic.geometry;
                    }
                    // keep the center graphic at its initial location when edge point is moving
                    else if (toolType === "move" || toolType === "move-stop") {
                        centerGraphic.geometry = centerGeometryAtStart;
                    }
                }

                // the center or edge graphic is being moved, recalculate the buffer
                const vertices = [
                    [centerGraphic.geometry.x, centerGraphic.geometry.y],
                    [edgeGraphic.geometry.x, edgeGraphic.geometry.y]
                ];

                // client-side stats query of features that intersect the buffer
                calculateBuffer(vertices);

                // user is clicking on the view... call update method with the center and edge graphics
                if (event.state === "cancel" || event.state === "complete") {
                    sketchViewModel.update([edgeGraphic, centerGraphic], {
                        tool: "move"
                    });
                }
            }

            /*********************************************************************
             * Edge or center point is being updated. Recalculate the buffer with
             * updated geometry information.
             *********************************************************************/
            function calculateBuffer(vertices) {
                // Update the geometry of the polyline based on location of edge and center points
                polylineGraphic.geometry = new Polyline({
                    paths: vertices,
                    spatialReference: view.spatialReference
                });

                // Recalculate the polyline length and buffer polygon
                const length = geometryEngine.geodesicLength(
                    polylineGraphic.geometry,
                    unit
                );
                const buffer = geometryEngine.geodesicBuffer(
                    centerGraphic.geometry,
                    length,
                    unit
                );

                // Update the buffer polygon
                bufferGraphic.geometry = buffer;

                // Query female and male age groups of the census tracts that intersect
                // the buffer polygon on the client
                // queryLayerViewAgeStats(buffer).then(function(newData) {
                //     // Create a population pyramid chart from the returned result
                //     updateChart(newData);
                // });

                // Update label graphic to show the length of the polyline
                labelGraphic.geometry = edgeGraphic.geometry;
                labelGraphic.symbol = {
                    type: "text",
                    color: "#FFEB00",
                    text: length.toFixed(2) + " miles",
                    xoffset: 50,
                    yoffset: 10,
                    font: {
                        // autocast as Font
                        size: 14,
                        family: "sans-serif"
                    }
                };
            }

            /*********************************************************************
             * Spatial query the census tracts feature layer view for statistics
             * using the updated buffer polygon.
             *********************************************************************/
            function queryLayerViewAgeStats(buffer) {
                // Data storage for the chart
                let femaleAgeData = [],
                    maleAgeData = [];

                // Client-side spatial query:
                // Get a sum of age groups for census tracts that intersect the polygon buffer
                const query = featureLayerView.layer.createQuery();
                query.outStatistics = statDefinitions;
                query.geometry = buffer;

                // Query the features on the client using FeatureLayerView.queryFeatures
                return featureLayerView
                    .queryFeatures(query)
                    .then(function(results) {
                        // Statistics query returns a feature with 'stats' as attributes
                        const attributes = results.features[0].attributes;
                        // Loop through attributes and save the values for use in the population pyramid.
                        for (var key in attributes) {
                            if (key.includes("FEM")) {
                                femaleAgeData.push(attributes[key]);
                            } else {
                                // Make 'all male age group population' total negative so that
                                // data will be displayed to the left of female age group
                                maleAgeData.push(-Math.abs(attributes[key]));
                            }
                        }
                        // Return information, seperated by gender
                        return [femaleAgeData, maleAgeData];
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            }

            /***************************************************
             * Draw the buffer polygon when application loads or
             * when user searches for a new location
             **************************************************/
            function drawBufferPolygon() {
                // When pause() is called on the watch handle, the callback represented by the
                // watch is no longer invoked, but is still available for later use
                // this watch handle will be resumed when user searches for a new location
                // pausableWatchHandle.pause();

                // Initial location for the center, edge and polylines on the view
                const viewCenter = view.center.clone();
                const centerScreenPoint = view.toScreen(viewCenter);
                const centerPoint = view.toMap({
                    x: centerScreenPoint.x + 120,
                    y: centerScreenPoint.y - 120
                });
                const edgePoint = view.toMap({
                    x: centerScreenPoint.x + 240,
                    y: centerScreenPoint.y - 120
                });

                // Store updated vertices
                const vertices = [
                    [centerPoint.x, centerPoint.y],
                    [edgePoint.x, edgePoint.y]
                ];

                // Create center, edge, polyline and buffer graphics for the first time
                if (!centerGraphic) {
                    const polyline = new Polyline({
                        paths: vertices,
                        spatialReference: view.spatialReference
                    });

                    // get the length of the initial polyline and create buffer
                    const length = geometryEngine.geodesicLength(polyline, unit);
                    const buffer = geometryEngine.geodesicBuffer(
                        centerPoint,
                        length,
                        unit
                    );

                    // Create the graphics representing the line and buffer
                    const pointSymbol = {
                        type: "simple-marker",
                        style: "circle",
                        size: 10,
                        color: [0, 255, 255, 0.5]
                    };
                    centerGraphic = new Graphic({
                        geometry: centerPoint,
                        symbol: pointSymbol,
                        attributes: {
                            center: "center"
                        }
                    });

                    edgeGraphic = new Graphic({
                        geometry: edgePoint,
                        symbol: pointSymbol,
                        attributes: {
                            edge: "edge"
                        }
                    });

                    polylineGraphic = new Graphic({
                        geometry: polyline,
                        symbol: {
                            type: "simple-line",
                            color: [254, 254, 254, 1],
                            width: 2.5
                        }
                    });

                    bufferGraphic = new Graphic({
                        geometry: buffer,
                        symbol: {
                            type: "simple-fill",
                            color: [150, 150, 150, 0.2],
                            outline: {
                                color: "#FFEB00",
                                width: 2
                            }
                        }
                    });
                    labelGraphic = labelLength(edgePoint, length);

                    // Add graphics to layer
                    graphicsLayer.addMany([centerGraphic, edgeGraphic]);
                    // once center and edge point graphics are added to the layer,
                    // call sketch's update method pass in the graphics so that users
                    // can just drag these graphics to adjust the buffer
                    setTimeout(function() {
                        sketchViewModel.update([edgeGraphic, centerGraphic], {
                            tool: "move"
                        });
                    }, 1000);

                    graphicsLayer2.addMany([
                        bufferGraphic,
                        polylineGraphic,
                        labelGraphic
                    ]);
                }
                // Move the center and edge graphics to the new location returned from search
                else {
                    centerGraphic.geometry = centerPoint;
                    edgeGraphic.geometry = edgePoint;
                }

                // Query features that intersect the buffer
                calculateBuffer(vertices);
            }

            // Create an population pyramid chart for the census tracts that intersect the buffer polygon
            // Chart is created using the Chart.js library
            let chart;

            function updateChart(newData) {
                reportExpand.expanded = true;


                if (!chart) {

                } else {

                }
            }

            // Label polyline with its length
            function labelLength(geom, length) {
                return new Graphic({
                    geometry: geom,
                    symbol: {
                        type: "text",
                        color: "#FFEB00",
                        text: length.toFixed(2) + " miles",
                        xoffset: 50,
                        yoffset: 10,
                        font: {
                            // autocast as Font
                            size: 14,
                            family: "sans-serif"
                        }
                    }
                });
            }
        }



    );