define([
    "mag/config",
    "mag/map",
    "esri/layers/FeatureLayer",
    "esri/layers/TileLayer",
    "esri/layers/MapImageLayer",
    "esri/layers/GraphicsLayer"
], function (config, {
    map,
    view
}, FeatureLayer, TileLayer, MapImageLayer, GraphicsLayer) {
    addLayers();

    let $rendererDropdown = $("#rendererDropdown");

    let popMetricsConf = {
        Vulnerability: {
            title: "Vulnerability (Index)",
            definition: "The vulnerable population index is a weighted sum of select attributes by Census Tract that indicate increased health risk.  The attributes include factors like elderly and very young population, those with disabilities, those under the poverty level, and households that lack modern communications (e.g. internet, telephone)."
        },
        TOTAL_POP: {
            title: "Total Population",
            cRamp: [
                [237, 248, 251],
                [178, 226, 226],
                [102, 194, 164],
                [44, 162, 95],
                [0, 109, 44]
            ]
        },
        Totoal_Pop_Under_Poverty: {
            title: "Population in Poverty (Percentage)",
            cRamp: [
                [237, 248, 251],
                [179, 205, 227],
                [140, 150, 198],
                [136, 86, 167],
                [129, 15, 124]
            ]
        }
    };

    Object.keys(popMetricsConf).forEach((key) => {
        let conf = popMetricsConf[key];

        if (key === "Vulnerability") {
            $("#populationMetrics").append(`
            <div class="form-check">
                <div class="layerBox">
                    <input checked type="checkbox" class="popMetricsInput form-check-input" data-field="${key}" id="cBox${key}">
                    <label class="form-check-label" for="cBox${key}">${conf.title}</label> <i data-toggle="popover" data-content="${conf.definition}" class=" vulnerabilityPopover fas fa-question-circle"></i>
                </div>
            </div>
        `);
        } else {
            $("#populationMetrics").append(`
            <div class="form-check">
                <div class="layerBox">
                    <input type="checkbox" class="popMetricsInput form-check-input" data-field="${key}" id="cBox${key}">
                    <label class="form-check-label" for="cBox${key}">${conf.title}</label>
                </div>
            </div>
        `);
        }
    });
    $('[data-toggle="popover"]').popover({
        trigger: "hover"
    });


    $(".popMetricsInput").change(function (e) {
        let lyr = map.findLayerById("tracts");
        lyr.visible = true;
        if (this.checked) {
            $(".popMetricsInput").prop('checked', false);
            $(this).prop('checked', true);
            let val = $(this).data("field");
            updateTractsRenderer(val);
        } else {
            let checked = $(".popMetricsInput:checked").length;
            if (checked === 0) {
                lyr.visible = false;
            }

        }
    });





    function updateTractsRenderer(val) {
        let lyr = map.findLayerById("tracts");

        console.log(val);


        if (val === "Vulnerability") {
            lyr.renderer = {
                field: "Roundup_Scale_2Pop",
                type: "class-breaks",
                classBreakInfos: GetVulnerabilityCB()
            }
            lyr.title = "Vulnerability";
        } else {
            let conf = popMetricsConf[val];
            lyr.renderer = {
                type: "class-breaks",
                field: val,
                classBreakInfos: GetClassBreaks(config.breaks[val], conf.cRamp)
            }
            lyr.title = conf.title;
        }

    };

    function GetVulnerabilityCB() {
        let cbrInfos = [{
            minValue: 0,
            maxValue: 1,
            symbol: {
                type: "simple-fill",
                color: "#fde0dd",
                outline: {
                    color: [0, 0, 0, 0.1],
                    width: 0.2
                }
            },
            label: `Low`
        }, {
            minValue: 1,
            maxValue: 2,
            symbol: {
                type: "simple-fill",
                color: "#fa9fb5",
                outline: {
                    color: [0, 0, 0, 0.1],
                    width: 0.2
                }
            },
            label: `Medium`
        }, {
            minValue: 2,
            maxValue: 3,
            symbol: {
                type: "simple-fill",
                color: "#c51b8a",
                outline: {
                    color: [0, 0, 0, 0.1],
                    width: 0.2
                }
            },
            label: `High`
        }];
        return cbrInfos;
    }

    function GetClassBreaks(breaks, cRamp) {
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
                    color: cRamp[i],
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

    function GetUVRRenderer(conf) {
        return {
            type: "unique-value",
            field: "Icon_Category",
            uniqueValueInfos: conf.uvr
        }
    }

    async function addLayers() {

        let tractsLayer = new FeatureLayer({
            url: "https://geo.azmag.gov/arcgis/rest/services/maps/HealthData/MapServer/0",
            popupTemplate: {
                title: '<div style="display: none;">{*}</div>',
                content: GetTractsPopup
            },
            renderer: {
                type: "class-breaks",
                field: "Roundup_Scale_2Pop",
                classBreakInfos: GetVulnerabilityCB()
            },
            id: 'tracts',
            title: 'Vulnerability',
            opacity: .95
        })
        map.add(tractsLayer);

        // let medicalFacilitiesLayer = new FeatureLayer({
        //     url: config.mainUrl + 0,
        //     // definitionExpression: GetQueryStringWhere().include,
        //     popupTemplate: {
        //         title: '<div style="display: none;">{*}</div>',
        //         content: GetMedicalFacilitiesPopup
        //     },
        //     opacity: .9,
        //     id: 'medicalFacilities',
        //     featureReduction: {
        //         type: "selection"
        //     },
        //     visible: true,
        //     // renderer: GetRenderer(conf)
        // })

        var feedbackAction = {
            title: "Feedback",
            id: "feedback",
            className: "esri-icon-notice-triangle"
        };

        config.layers.forEach(async conf => {
            if (conf.type === "feature") {

                var lyr = new FeatureLayer({
                    url: config.mainUrl + conf.index,
                    title: conf.title,
                    displayField: conf.displayField,
                    outFields: ["*"],
                    // definitionExpression: GetQueryStringWhere().include,
                    popupTemplate: {
                        title: conf.title + '<div style="display: none;">{*}</div>',
                        content: GetMedicalFacilitiesPopup,
                        actions: [feedbackAction]
                    },
                    opacity: 1,
                    id: conf.id,
                    featureReduction: {
                        type: "selection"
                    },
                    visible: conf.visible,
                    renderer: GetUVRRenderer(conf)
                });

                map.add(lyr);

                view.whenLayerView(lyr).then(() => {
                    let renderer = lyr.renderer.clone();
                    renderer.visualVariables = [{
                        type: "size",
                        valueExpression: "$view.scale",
                        stops: [{
                                size: 9,
                                value: 1155581
                            },
                            {
                                size: 9,
                                value: 750000
                            },
                            {
                                size: 12,
                                value: 500000
                            },
                            {
                                size: 14,
                                value: 300000
                            }
                        ]
                    }];
                    lyr.renderer = renderer;
                });

            } else if (conf.type === "tile") {
                var tileLyr = new TileLayer({
                    url: conf.url,
                    id: conf.title,
                    visible: conf.visible,
                    opacity: conf.opacity,
                    title: conf.title,
                    legendEnabled: false
                });
                map.add(tileLyr);
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
                map.add(imgLayer);
            }

            if (conf.showToc) {
                $("#layersList").prepend(`
                <div class="form-check">
                    <div class="layerBox">
                        <input type="checkbox" ${conf.visible ? 'checked' : ''} class="form-check-input" data-id="${conf.id}" id="cBox${conf.id}">
                        <label class="form-check-label" for="cBox${conf.id}">${conf.title}</label> ${conf.definition ? `<i data-toggle="popover" data-content="${conf.definition}" class=" vulnerabilityPopover fas fa-question-circle"></i>` : ''}
                    </div>
                </div>
                `);
            }
        });

        // map.add(medicalFacilitiesLayer);

        // let tractsLyrView = await view.whenLayerView(medicalFacilitiesLayer);
        // let medicalFacilitiesLyrView = await view.whenLayerView(medicalFacilitiesLayer);

        // tractsLyrView

        // let medicalFacilityCategories = await medicalFacilitiesLyrView.queryFeatures({  })




        // $("#layersList").append(`
        //     <div class="form-check">
        //         <div class="layerBox">
        //             <input type="checkbox" ${conf.visible ? 'checked' : ''} class="form-check-input" data-id="${conf.id}" id="cBox${conf.id}">
        //             <label class="form-check-label" for="cBox${conf.id}">${conf.tocTitle ? conf.tocTitle : conf.title}</label>
        //         </div>
        //     </div>
        // `);

        $(".form-check-input").change(function (e) {
            let layId = $(this).data("id");

            let lay = map.findLayerById(layId);
            if (lay) {
                lay.visible = !lay.visible;
            }
        })

        // const graphicsLayer = new GraphicsLayer({
        //     id: 'graphicsLayer'
        // });
        // const graphicsLayer2 = new GraphicsLayer({
        //     id: 'graphicsLayer2'
        // });

        // map.add(graphicsLayer2);
        // map.add(graphicsLayer);
    }

    function GetTractsPopup(res) {

        let {
            attributes
        } = res.graphic;
        let {
            TOTAL_POP,
            AGE_0_5,
            AGE_5_10,
            AGE_10_25,
            AGE_25_55,
            AGE_55_75,
            AGE_75Plus,
            Roundup_Scale,
            Totoal_Pop_Under_Poverty
        } = attributes;

        let vuln = 'High';

        if (Roundup_Scale <= 2) {
            vuln = 'Low';
        } else if (Roundup_Scale === 3) {
            vuln = 'Medium';
        }

        let html = `
        <div class="popupContent">
            <b>Total Population: </b><span>${TOTAL_POP}</span>
            <br>
            <b>Vulnerability: </b><span>${vuln}</span>
            <br>
            <b> Population Below Poverty: </b><span>${Totoal_Pop_Under_Poverty}</span>
            <br>
            <div class="popupDetails">
                <table class="table table-sm">
                <thead>
                    <tr>
                    <th scope="col">Age</th>
                    <th scope="col">Persons</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Age 0 - 5</td><td>${AGE_0_5}</td></tr>
                    <tr><td>Age 5 - 10</td><td>${AGE_5_10}</td></tr>
                    <tr><td>Age 10 - 25</td><td>${AGE_10_25}</td></tr>
                    <tr><td>Age 25 - 55</td><td>${AGE_25_55}</td></tr>
                    <tr><td>Age 55 - 75</td><td>${AGE_55_75}</td></tr>
                    <tr><td>Age 75+</td><td>${AGE_75Plus}</td></tr>
                </tbody>
                </table>
            </div>
        </div>`;
        return html;
    }


    function GetMedicalFacilitiesPopup(res) {

        let {
            attributes
        } = res.graphic;
        let {
            Name,
            Capacity,
            OPERSTDESC,
            Telephone,
            P_Address,
            P_address2,
            P_zip,
            P_city,
            P_State,
            P_county
        } = attributes;

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
