require([
    "esri/layers/FeatureLayer",
    "esri/layers/TileLayer",
    "esri/layers/MapImageLayer",
    "dojo/topic"
], function (FeatureLayer, TileLayer, MapImageLayer, tp) {

    tp.subscribe("map-loaded", addLayers);
    tp.subscribe("render-update", UpdateFeatureLayerRenderers);

    let $fldDropdown = $("#fldDropdown");
    let $yearDropdown = $("#yearDropdown");
    let $normalize = $("#normalize");

    $normalize.change(function () {
        tp.publish("render-update");
    })

    $fldDropdown.change(function () {
        tp.publish("render-update");
    })

    $yearDropdown.change(function () {
        tp.publish("render-update");
    })

    function GetClassBreaks(breaks) {
        let cbrInfos = [];
        for (let i = 0; i < breaks.length - 1; i++) {
            const min = breaks[i];
            const max = breaks[i + 1];

            let minLabel = min;
            let maxLabel = max;

            minLabel = Math.round(minLabel).toLocaleString("en-US");
            maxLabel = Math.round(maxLabel).toLocaleString("en-US");

            cbrInfos.push({
                minValue: min,
                maxValue: max,
                symbol: {
                    type: "simple-fill",
                    color: config.colorRamp[i],
                    outline: {
                        color: [0, 0, 0, 0.1],
                        width: 0.2
                    }
                },
                label: `${minLabel} - ${maxLabel}`
            });
        }
        return cbrInfos;
    }

    function GetRenderer(conf) {
        let fld = $fldDropdown.selectpicker('val');
        let fldDescription = config.fieldsDef[fld].description;
        let year = $yearDropdown.selectpicker('val');
        let normalize = $normalize.is(':checked') ? 'normalizedBreaks' : 'breaks';
        let layerType = conf.id;
        let mpa = $("#mpaDropdown").selectpicker('val') || 'all';

        let fldYear = `${fld}_${year}`;

        let breaks;

        // Find breaks if available from staticClassBreaks file
        if (
            staticClassBreaks &&
            staticClassBreaks[layerType] &&
            staticClassBreaks[layerType][normalize] &&
            staticClassBreaks[layerType][normalize][fldYear] &&
            staticClassBreaks[layerType][normalize][fldYear][mpa]
        ) {
            breaks = staticClassBreaks[layerType][normalize][fldYear][mpa];
        }

        let rend;

        if (breaks) {
            let normalizationField = normalize === 'breaks' ? undefined : "SQMI";
            rend = {
                type: "class-breaks",
                field: fldYear,
                normalizationField: normalizationField,
                legendOptions: {
                    title: `${year} - ${fldDescription} ${normalizationField ? '/ Square Mile' : ''}`
                },
                classBreakInfos: GetClassBreaks(breaks)
            };
        } else {
            rend = {
                type: "simple",
                symbol: {
                    type: "simple-fill",
                    color: "black",
                    style: "backward-diagonal",
                    outline: {
                        width: 0.5,
                        color: [50, 50, 50, 0.6]
                    }
                },
                defaultLabel: "no data",
            }
        }
        return rend;
    }

    function UpdateFeatureLayerRenderers() {
        config.layers.forEach(conf => {
            if (conf.type === "feature") {
                let lyr = app.map.findLayerById(conf.id);
                let newRend = GetRenderer(conf);
                lyr.renderer = newRend;
                let expression = `Text($feature.${newRend.field}, '#,###')`;

                if (newRend.normalizationField) {
                    expression = `Text($feature.${newRend.field} / $feature.${newRend.normalizationField}, '#,###')`;
                }

                lyr.labelingInfo[0].labelExpressionInfo = {
                    expression: expression
                }
            }
        })
    }

    function addLayers() {
        config.layers.forEach(conf => {
            if (conf.type === "feature") {
                var grayLyr = new FeatureLayer({
                    url: config.mainUrl + conf.index,
                    title: conf.title,
                    opacity: .5,
                    definitionExpression: GetQueryStringWhere().exclude,
                    legendEnabled: false,
                    id: conf.id + 'noData',
                    visible: conf.visible,
                    renderer: {
                        type: "simple",
                        symbol: {
                            type: "simple-fill",
                            color: 'gray',
                            outline: {
                                color: "gray",
                                width: 0.1
                            }
                        }
                    }
                });
                app.map.add(grayLyr);

                var lyr = new FeatureLayer({
                    url: config.mainUrl + conf.index,
                    title: conf.title,
                    displayField: conf.displayField,
                    outFields: ["*"],
                    definitionExpression: GetQueryStringWhere().include,
                    popupTemplate: {
                        title: conf.title + ": <strong>{" + conf.displayField + "}</strong>",
                        content: GetPopupContent()
                    },
                    opacity: .7,
                    id: conf.id,
                    visible: conf.visible,
                    renderer: GetRenderer(conf)
                });

                lyr.labelingInfo = [{
                    labelExpressionInfo: {
                        expression: `Text($feature.total_pop_2018, '#,###')`
                    },
                    symbol: {
                        type: "text",
                        color: "black",
                        haloSize: 1,
                        haloColor: "white"
                    },
                    minScale: 207790
                }];

                app.map.add(lyr);
            } else if (conf.type === "tile") {
                var tileLyr = new TileLayer({
                    url: conf.url,
                    id: conf.title,
                    visible: conf.visible
                });
                app.map.add(tileLyr);
            } else if (conf.type === "image") {
                var imgLayer = new MapImageLayer({
                    url: conf.url,
                    id: conf.id,
                    opacity: conf.opacity || 1,
                    title: conf.title,
                    legendEnabled: conf.legendEnabled,
                    visible: conf.visible,
                    labelsVisible: false,
                    labelingInfo: [{}],
                    sublayers: [{
                        definitionExpression: conf.definitionExpression,
                        id: conf.index,
                        opacity: 1
                    }]
                });
                app.map.add(imgLayer);
            }

            if (conf.showToc) {
                $("#contextLayersList").append(`
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" data-id="${conf.id}" id="cBox${conf.id}">
                    <label class="form-check-label" for="cBox${conf.id}">${conf.title}</label>
                </div>
                `);
            }




            // if (conf.cbr == true) {
            //     let once = false;
            //     app.view.whenLayerView(lyr).then(function (lyrView) {
            //         lyrView.watch("updating", function (val) {
            //             if (!val && !once) {
            //                 let q = {
            //                     returnGeometry: false,
            //                     outFields: ["tot_pop_50"]
            //                 }
            //                 lyrView.queryFeatures(q).then(function (res) {
            //                     SetupRenderer(lyrView.layer, res);
            //                 })
            //                 once = true;
            //             }
            //         })
            //     })
            // }
        });

        $(".form-check-input").change(function (e) {
            let layId = $(this).data("id");
            let lay = app.map.findLayerById(layId);
            if (lay) {
                lay.visible = !lay.visible;
            }
        })

        if (qs("mpa")) {
            $('#mpaDropdown').selectpicker('val', qs("mpa"));
        }

        let tazLyr = app.map.findLayerById("TAZ");
        let once = false;
        app.view.whenLayerView(tazLyr).then(function (lyrView) {
            lyrView.watch("updating", function (val) {
                if (!val && !once) {
                    lyrView.queryExtent().then(function (res) {
                        app.view.goTo(res.extent);
                    })
                    once = true;
                    $("#legendId").html('MAG Data');
                }
            })
            tazLyr.watch("definitionExpression", function (val) {
                let mpa = $('#mpaDropdown').selectpicker('val');
                window.history.pushState('ProjectionsReview', 'Updated Def Expression', `?mpa=${mpa}`);
                tazLyr.queryExtent().then(function (res) {
                    app.view.goTo(res.extent);
                })
            })
        });


    }


    function GetCBInfos(breaks, colorRamp) {
        const rtnData = [];
        for (let i = 0; i < breaks.length - 1; i++) {
            const min = breaks[i];
            const max = breaks[i + 1];

            let minLabel = Math.round(min).toLocaleString("en-US");
            let maxLabel = Math.round(max).toLocaleString("en-US");

            rtnData.push({
                minValue: min,
                maxValue: max,
                symbol: {
                    type: "simple-fill",
                    color: colorRamp[i],
                    outline: {
                        color: [0, 0, 0, .5],
                        width: 0.5
                    }
                },
                label: `${minLabel} - ${maxLabel}`
            });
        }
        return rtnData;
    };

    // function SetupRenderer(layer, res) {
    //     let field = "total_pop_2050";
    //     let cbrCount = 5;

    //     let arr = res.features.map(function (feature) {
    //         let val = feature.attributes[field];
    //         return val;
    //     })

    //     let s = new geostats();
    //     s.setSerie(arr);

    //     let breaks = s.jenks(arr, cbrCount);

    //     let rend = {
    //         type: "class-breaks",
    //         field: field,
    //         // normalizationField: data.conf.NormalizeField,
    //         classBreakInfos: GetCBInfos(breaks, config.colorRamp),
    //         legendOptions: {
    //             title: 'Total Population in 2050'
    //         }
    //     }

    //     layer.renderer = rend;
    // }

    function GetTableHTML(flds) {
        let rows = '';
        flds.forEach(function (fld) {
            rows += `<tr>
            <th scope="row">${fld.description}</th>
            `
            config.years.forEach(year => {
                rows += `<td>{${fld.name}_${year}:NumberFormat(places:0)}</td>`
            });
            rows = rows + '</tr>';
        })
        return `<table class="table table-sm table-hover table-striped">
            <thead>
                <tr>
                    <th scope="col">Category</th>
                    <th scope="col">2018</th>
                    <th scope="col">2020</th>
                    <th scope="col">2030</th>
                    <th scope="col">2040</th>
                    <th scope="col">2050</th>
                    <th scope="col">2055</th>
                </tr>
            </thead>
            <tbody>
            ${rows}
            </tbody>
        </table>`;
    }

    function GetPopupContent() {
        let html = `<div style="font-family: 'Poppins', sans-serif;">`;
        config.fields.forEach(fld => {
            html += `<span style="font-weight:bold; font-size: 14px;">${fld.title}</span>`;
            if (fld.subFields) {
                html += GetTableHTML(fld.subFields);
            }
        });
        var popupContent = `
        <button class="btn btn-primary btn-sm btnProvideFeedback">Provide Feedback</button>
        <br>
        ${html}
        </div>`;
        return popupContent;
    }
})