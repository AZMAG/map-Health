require([
    "esri/layers/FeatureLayer",
    "esri/layers/TileLayer",
    "esri/layers/MapImageLayer",
    "dojo/topic"
], function(FeatureLayer, TileLayer, MapImageLayer, tp) {

    tp.subscribe("map-loaded", addLayers);
    // tp.subscribe("render-update", UpdateFeatureLayerRenderers);

    // let $fldDropdown = $("#fldDropdown");
    // let $yearDropdown = $("#yearDropdown");
    // let $normalize = $("#normalize");

    // $normalize.change(function () {
    //     tp.publish("render-update");
    // })

    // $fldDropdown.change(function () {
    //     tp.publish("render-update");
    // })

    // $yearDropdown.change(function () {
    //     tp.publish("render-update");
    // })

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

    function addLayers() {
        config.layers.forEach(conf => {
            if (conf.type === "feature") {
                var lyr = new FeatureLayer({
                    url: config.mainUrl + conf.index,
                    title: conf.title,
                    displayField: conf.displayField,
                    outFields: ["*"],
                    // definitionExpression: GetQueryStringWhere().include,
                    popupTemplate: {
                        title: conf.title + '<div style="display: none;">{*}</div>',
                        content: GetPopupContent
                    },
                    opacity: .9,
                    id: conf.id,
                    featureReduction: {
                        type: "selection"
                    },
                    visible: conf.visible,
                    // renderer: GetRenderer(conf)
                });

                // lyr.labelingInfo = [{
                //     labelExpressionInfo: {
                //         expression: `$feature.Name`
                //     },
                //     symbol: {
                //         size: "10px",
                //         type: "text",
                //         color: "white",
                //         font: {
                //             size: 5,
                //             weight: "bold"
                //         }
                //     },
                //     minScale: 800000
                // }];

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
                $("#layersList").append(`
                <div class="form-check">
                    <div class="layerBox">
                        <input type="checkbox" ${conf.visible ? 'checked' : ''} class="form-check-input" data-id="${conf.id}" id="cBox${conf.id}">
                        <label class="form-check-label" for="cBox${conf.id}">${conf.title}</label>
                    </div>
                </div>
                `);
            }
        });

        $(".form-check-input").change(function(e) {
            let layId = $(this).data("id");
            console.log(layId);

            let lay = app.map.findLayerById(layId);
            if (lay) {
                lay.visible = !lay.visible;
            }
        })
    }

    function GetPopupContent(res) {

        let { attributes } = res.graphic;
        let { Name, Capacity, OPERSTDESC, Telephone, P_Address, P_address2, P_zip, P_city, P_State, P_county } = attributes;

        let html = `
        <div class="popupContent">
            <b>${Name}</b>
            <br>
            <div class="popupDetails">
                <div class="flexCenter" title="Address">
                    <i class="fas fa-map-marked-alt"></i>
                    <div class="marginLeft10">
                        ${P_Address} ${P_address2 ? `<br> ${P_address2}` : ''} <br>
                        ${P_city}, ${P_State} ${P_zip}
                    </div>
                </div>
                <div class="flexCenter" title="Capacity">
                    <i class="fas fa-user-friends"></i>
                    <div class="marginLeft10">
                        ${Capacity}
                    </div>
                </div>
                <div class="flexCenter" title="Phone Number">
                    <i class="fas fa-phone"></i>
                    <div class="marginLeft10">
                        ${Telephone ? Telephone.replace(')', ') ') : ''}
                    </div>
                </div>
                <div class="flexCenter" title="Operating Status">
                    <i class="fas fa-door-open"></i>
                    <div class="marginLeft10">
                        ${OPERSTDESC === 'ACTIVE' ? 'Operating' : 'Closed'}
                    </div>
                </div>
            </div>
        </div>`;
        return html;
    }
})