define([
    "mag/config",
    "mag/map",
    "esri/layers/FeatureLayer",
    "esri/layers/TileLayer",
    "esri/layers/MapImageLayer",
    "esri/layers/GraphicsLayer"
], function(config, { map, view }, FeatureLayer, TileLayer, MapImageLayer, GraphicsLayer) {
    addLayers();

    let $rendererDropdown = $("#rendererDropdown");

    let popMetricsConf = {
        Vulnerability: {
            title: "Vulnerability",
            definition: "The vulnerability index is a weighted sum of selected Census attributes deemed to increase the risk to the population.  The attributes are focused on the elderly, very young, those with disabilities, those under the poverty level, and households that lack modern communications (e.g. internet, telephone)."
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
            title: "Population in Poverty",
            cRamp: [
                [254, 240, 217],
                [253, 204, 138],
                [252, 141, 89],
                [227, 74, 51],
                [179, 0, 0]
            ]
        }
    }

    Object.keys(popMetricsConf).forEach((key) => {
        let conf = popMetricsConf[key];

        if (key === "Vulnerability") {
            $("#populationMetrics").append(`
            <div class="form-check">
                <div class="layerBox">
                    <input checked type="checkbox" ${conf.visible ? 'checked' : ''} class="form-check-input" data-id="${conf.id}" id="cBox${conf.id}">
                    <label class="form-check-label" for="cBox${key}">${conf.title} <i class="fas fa-question-circle"></i></label>
                </div>
            </div>
        `);
        } else {
            $("#populationMetrics").append(`
            <div class="form-check">
                <div class="layerBox">
                    <input type="checkbox" ${conf.visible ? 'checked' : ''} class="form-check-input" data-id="${conf.id}" id="cBox${conf.id}">
                    <label class="form-check-label" for="cBox${key}">${conf.title}</label>
                </div>
            </div>
        `);
        }
    })





    $rendererDropdown.change(function(e) {

        let val = $rendererDropdown.val();

        let lyr = map.findLayerById("tracts");

        if (val === "Vulnerability") {
            lyr.renderer = {
                field: "Roundup_Scale",
                type: "class-breaks",
                classBreakInfos: GetVulnerabilityCB()
            }
        } else {
            let title = titles[val];
            lyr.renderer = {
                type: "class-breaks",
                field: val,
                classBreakInfos: GetClassBreaks(config.breaks[val], title.cRamp)
            }
            lyr.title = title.title;
        }

    })

    function GetVulnerabilityCB() {
        let cbrInfos = [{
            minValue: 0,
            maxValue: 2,
            symbol: {
                type: "simple-fill",
                color: "green",
                outline: {
                    color: [0, 0, 0, 0.1],
                    width: 0.2
                }
            },
            label: `Low`
        }, {
            minValue: 3,
            maxValue: 3,
            symbol: {
                type: "simple-fill",
                color: "yellow",
                outline: {
                    color: [0, 0, 0, 0.1],
                    width: 0.2
                }
            },
            label: `Medium`
        }, {
            minValue: 4,
            maxValue: 6,
            symbol: {
                type: "simple-fill",
                color: "red",
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

    async function addLayers() {

        let tractsLayer = new FeatureLayer({
            url: "https://geo.azmag.gov/arcgis/rest/services/maps/HealthData/MapServer/1",
            popupTemplate: {
                title: '<div style="display: none;">{*}</div>',
                content: GetTractsPopup
            },
            renderer: {
                type: "class-breaks",
                field: "Roundup_Scale",
                classBreakInfos: GetVulnerabilityCB()
            },
            id: 'tracts',
            title: 'Vulnerability',
            opacity: .4
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
                        content: GetMedicalFacilitiesPopup
                    },
                    definitionExpression: `SubType <> 'ABORTION CLINIC'`,
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

                map.add(lyr);

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

        $(".form-check-input").change(function(e) {
            let layId = $(this).data("id");
            console.log(layId);

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

        console.log(res);


        let { attributes } = res.graphic;
        let { TOTAL_POP, AGE_0_5, AGE_5_10, AGE_10_25, AGE_25_55, AGE_55_75, AGE_75Plus, Roundup_Scale, Totoal_Pop_Under_Poverty } = attributes;

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