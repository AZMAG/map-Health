define([
    "mag/config",
    "mag/map",
    "esri/layers/FeatureLayer",
    "esri/layers/TileLayer",
    "esri/layers/MapImageLayer",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/tasks/QueryTask"
], function (config, {
    map,
    view
}, FeatureLayer, TileLayer, MapImageLayer, GraphicsLayer, Graphic, QueryTask) {
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
            title: "Population in Poverty",
            cRamp: [
                [237, 248, 251],
                [179, 205, 227],
                [140, 150, 198],
                [136, 86, 167],
                [129, 15, 124]
            ]
        },
        Covid: {
            title: "COVID-19 Cases (By County)",
            definition: "This feature layer contains the most up-to-date COVID-19 cases and latest trend plot. It covers China, the US, Canada, Australia (at province/state level), and the rest of the world (at country level, represented by either the country centroids or their capitals). Data sources are WHO, US CDC, China NHC, ECDC, and DXY. The China data is automatically updating at least once per hour, and non China data is updating manually. This layer is created and maintained by the Center for Systems Science and Engineering (CSSE) at the Johns Hopkins University."
        },
        Capacity: {
            title: "Capacity (Beds By County)",
            definition: "This feature layer contains the capcity in beds by county. It covers hospital capacity in Arizona."
        }
    };

    Object.keys(popMetricsConf).forEach((key) => {
        let conf = popMetricsConf[key];

        if (key === "Vulnerability") {
            $("#populationMetrics").append(`
            <div class="form-check">
                <div class="layerBox">
                    <input checked type="checkbox" class="popMetricsInput form-check-input" data-field="${key}" id="cBox${key}">
                    <label class="form-check-label" for="cBox${key}">${conf.title}</label> <i title=${conf.title} data-toggle="popover" data-content="${conf.definition}" class=" vulnerabilityPopover fas fa-question-circle"></i>
                </div>
            </div>
        `);
        } else if (key === "Covid") {
            $("#populationMetrics").append(`
                <div class="form-check">
                    <div class="layerBox">
                        <input type="checkbox" class="popMetricsInput form-check-input" data-field="${key}" id="cBox${key}">
                        <label class="form-check-label" for="cBox${key}">${conf.title}</label> <i title=${conf.title} data-toggle="popover" data-content="${conf.definition}" class=" vulnerabilityPopover fas fa-question-circle"></i>
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

    $(".popMetricsInput").change(function (e) {
        $("#context-menu").hide();
        let tractsLyr = map.findLayerById("tracts");
        let covidLyr = map.findLayerById("covidCases");
        covidLyr.visible = false;
        tractsLyr.visible = true;
        if (this.checked) {
            $(".popMetricsInput").prop('checked', false);
            $(this).prop('checked', true);
            let val = $(this).data("field");
            if (val === 'Covid') {
                tractsLyr.visible = false;
                let covidLyr = map.findLayerById("covidCases");
                covidLyr.renderer = GetCovidRenderer();
                covidLyr.labelingInfo = GetCovidLabelInfo();
                covidLyr.title = 'COVID-19 Cases (By County)';
                covidLyr.visible = true;
                $("#dashboard").show();
            } else if (val === 'Capacity') {
                tractsLyr.visible = false;
                let covidLyr = map.findLayerById("covidCases");
                covidLyr.title = 'Capacity (Beds By County)';
                covidLyr.renderer = GetCapacityRenderer();
                covidLyr.labelingInfo = GetCapacityLabelInfo();
                covidLyr.visible = true;
            } else {
                updateTractsRenderer(val);
            }
        } else {
            let checked = $(".popMetricsInput:checked").length;
            if (checked === 0) {
                tractsLyr.visible = false;
                $("#dashboard").hide();
            }
        }
    });

    function updateTractsRenderer(val) {
        let lyr = map.findLayerById("tracts");

        if (val === "Vulnerability") {
            lyr.renderer = {
                field: "Roundup_Scale_2Pop",
                type: "class-breaks",
                classBreakInfos: GetVulnerabilityCB()
            };
            lyr.title = "Vulnerability";
        } else {
            let conf = popMetricsConf[val];
            lyr.renderer = {
                type: "class-breaks",
                field: val,
                classBreakInfos: GetClassBreaks(config.breaks[val], conf.cRamp)
            };
            lyr.title = conf.title;
        }

    }

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
        };
    }

    function GetCovidRenderer() {
        return {
            type: 'simple',
            field: 'Confirmed',
            symbol: {
                type: "simple-marker",
                style: "circle",
                color: "blue",
                size: "8px",
                outline: {
                    color: [0, 0, 255],
                    width: 1
                }
            },
            visualVariables: [{
                type: "size",
                field: "Confirmed",
                stops: [{
                        value: 0,
                        size: 15,
                        label: "<15"
                    },
                    {
                        value: 15,
                        size: 30,
                        label: "<30"
                    },
                    {
                        value: 30,
                        size: 45,
                        label: ">60"
                    },
                    {
                        value: 60,
                        size: 60,
                        label: ">100"
                    },
                    {
                        value: 100,
                        size: 75,
                        label: "100+"
                    }
                ]
            }]
        }
    }

    function GetCapacityRenderer() {
        return {
            type: 'simple',
            field: 'Capacity',
            symbol: {
                type: "simple-marker",
                style: "circle",
                color: "red",
                size: "8px",
                outline: {
                    color: [0, 0, 255],
                    width: 1
                }
            },
            visualVariables: [{
                type: "size",
                field: "Capacity",
                stops: [{
                        value: 0,
                        size: 10,
                        label: "0 Beds"
                    },
                    {
                        value: 50,
                        size: 20,
                        label: "<150 Beds"
                    },
                    {
                        value: 1000,
                        size: 40,
                        label: "<1000 Beds"
                    },
                    {
                        value: 5000,
                        size: 50,
                        label: "<5000 Beds"
                    },
                    {
                        value: 15000,
                        size: 60,
                        label: "<15000 Beds"
                    },
                    {
                        value: 1000000,
                        size: 75,
                        label: "15000+ Beds"
                    }
                ]
            }]
        }
    }

    function GetCapacityLabelInfo() {
        return [{
            labelPlacement: "above-right",
            labelExpressionInfo: {
                expression: "$feature.Admin2 + ' (' + Text($feature.Capacity, '#,###') + ' Beds)'"
            },
            symbol: {
                type: "text",
                color: "black",
                haloSize: 1,
                haloColor: "white"
            },
            maxScale: 0,
            minScale: 0,
        }]
    }

    function GetCovidLabelInfo() {
        return [{
            labelPlacement: "above-right",
            labelExpressionInfo: {
                expression: "$feature.Admin2 + ' (' + $feature.Confirmed + ' Cases)'"
            },
            symbol: {
                type: "text",
                color: "black",
                haloSize: 1,
                haloColor: "white"
            },
            maxScale: 0,
            minScale: 0,
        }]
    }

    async function addCovidLayer() {
        let queryAllUrl = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/ncov_cases_US/FeatureServer/0/query?where=Province_State+%3D+%27Arizona%27&outFields=*&f=json";

        let res = await fetch(queryAllUrl);
        let {
            features
        } = await res.json();

        const pointsQt = new QueryTask({
            url: config.mainUrl + config.queryLayerIndex
        });

        const points = await pointsQt.execute({
            where: '1=1',
            outFields: ['sj_county', 'FACID', 'Capacity', 'OBJECTID'],
            returnDistinctValues: true,
            returnGeometry: false
        })

        let bedsLookupByCounty = {};

        points.features.forEach(({
            attributes
        }) => {
            if (attributes['sj_county']) {
                let countyId = attributes['sj_county'].substr(-3);
                let county = config.countyLookup[countyId];
                bedsLookupByCounty[county] = bedsLookupByCounty[county] || 0;
                bedsLookupByCounty[county] += attributes["Capacity"];
            }
        })


        let source = features.map(({
            attributes,
            geometry
        }) => {
            attributes["Capacity"] = bedsLookupByCounty[attributes["Admin2"]];

            if (attributes["Admin2"] === "Maricopa") {
                geometry.y = 33.45;
                geometry.x = -112.07;
            }
            let graphic = new Graphic({
                geometry: {
                    type: "point",
                    latitude: geometry.y,
                    longitude: geometry.x,
                    spatialReference: 4326
                },

                attributes
            });
            return graphic;
        });

        console.log(source);



        var cases = new FeatureLayer({
            title: 'COVID-19 Cases (By County)',
            id: 'covidCases',
            popupTemplate: {
                title: '{Admin2} County',
                content: `
                <b>Confirmed Cases:</b> {Confirmed} <br>
                <b>Deaths:</b>  {Deaths} <br>
                <b>Active Cases:</b> {Active} <br>
                <b>Capacity (Number of Beds):</b> {Capacity}
            `
            },
            source,
            spatialReference: {
                wkid: 4326
            },
            fields: [{
                name: 'id',
                type: 'single'
            }, {
                name: 'Admin2',
                type: 'string'
            }, {
                name: 'Confirmed',
                type: 'single'
            }, {
                name: 'Deaths',
                type: 'single'
            }, {
                name: 'Active',
                type: 'single'
            }, {
                name: 'Capacity',
                type: 'single'
            }],


            objectIdField: "ID",
            opacity: .35,
            renderer: GetCovidRenderer(),
            labelingInfo: GetCovidLabelInfo(),
            visible: false,
            labelsVisible: true
        });
        map.add(cases);
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
        });
        map.add(tractsLayer);

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
                        <label class="form-check-label" for="cBox${conf.id}">${conf.title}</label> ${conf.definition ?
                            `<i data-toggle="popover" data-placement="right"
                                data-content="${conf.definition}" class="fas fa-question-circle" title="${conf.title}">
                            </i>` : ''}
                    </div>
                </div>
                `);
            }
        });
        await addCovidLayer();

        $(".form-check-input").change(function (e) {
            let layId = $(this).data("id");

            let lay = map.findLayerById(layId);
            if (lay) {
                lay.visible = !lay.visible;
            }
        })
        $('[data-toggle="popover"]').popover({
            trigger: "hover",
            placement: "right",
            container: "body"
        });
    }

    function GetTractsPopup(res) {

        let {
            attributes
        } = res.graphic;
        console.log(attributes);

        let {
            TOTAL_POP,
            AGE_0_5,
            AGE_5_10,
            AGE_10_25,
            AGE_25_55,
            AGE_55_75,
            AGE_75Plus,
            Roundup_Scale_2Pop,
            Totoal_Pop_Under_Poverty,
            POP_FOR_POVERTY
        } = attributes;

        let vuln = 'High';

        if (Roundup_Scale_2Pop === 1) {
            vuln = 'Low';
        } else if (Roundup_Scale_2Pop === 2) {
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
            <b> Poverty Percentage: </b><span>${Math.round((Totoal_Pop_Under_Poverty / POP_FOR_POVERTY) * 1000) / 10}%</span>
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
                        ${Capacity ? Capacity : "N/A"}
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
