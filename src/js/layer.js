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
                    <input checked type="checkbox" class="popMetricsInput form-check-input" data-field="${key}" id="cBox${key}">
                    <label class="form-check-label" for="cBox${key}">${conf.title} <i data-toggle="popover" data-content="${conf.definition}" class=" vulnerabilityPopover fas fa-question-circle"></i></label>
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
    })
    $('[data-toggle="popover"]').popover({
        trigger: "hover"
    })


    $(".popMetricsInput").change(function(e) {
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
    })





    function updateTractsRenderer(val) {
        let lyr = map.findLayerById("tracts");

        if (val === "Vulnerability") {
            lyr.renderer = {
                field: "Roundup_Scale",
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
            maxValue: 2,
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
            minValue: 3,
            maxValue: 3,
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
            minValue: 4,
            maxValue: 6,
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

    async function addLayers() {

        let tractsLayer = new FeatureLayer({
            url: "https://geo.azmag.gov/arcgis/rest/services/maps/HealthData/MapServer/0",
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
                    opacity: .9,
                    id: conf.id,
                    featureReduction: {
                        type: "selection"
                    },
                    visible: conf.visible
                    // renderer: GetRenderer(conf)
                });

                map.add(lyr);

                if (lyr.id === "Medical_Facility") {
                    lyr.renderer = {
                        type: "unique-value",
                        field: "Icon_Category",
                        uniqueValueInfos: [
                            // {
                            //     label: "Abortion Clinic/Center",
                            //     symbol: {
                            //         type: "picture-marker",
                            //         contentType: "image/png",
                            //         // imageData: "iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAQ5JREFUKJGdkDFrwlAUhT/qI48Ojg4uhuKSoYOddMlWFPJPujj7G2x2f0bBSYemQ4a6BIRk6BAdMgjOAeGJmA6Pp6ERi57pnnPueZz7BHdC/BW6Xen2+ypoNjkCrNcUvs8zkF4NWhaW5yF6Pc3nc5TvV/cqwq1VHSPkuWpd2HsqzQcgFQDDIYnncTBOqxR1HORsxofhQUAxHvMoADodaoMBtUuVbBtsG2n4aoUqV70ZAiBNYbE4i+02NBp63mwgy87edsvDKRiG8jUMtZHn6mUy4d0E4xg1GvFWr8sMYL9HgTJB9WledF0J+owTlku+Qf1Uqt59Yxm7HcfplCKONU8SBFD8G4wi9RVF+gOu4RcKulJtShL5pAAAAABJRU5ErkJggg==",
                            //         url: "https://services1.arcgis.com/mpVYz37anSdrK4d8/arcgis/rest/services/AZLicensedFacilities/FeatureServer/2/images/248448727ceffef6bcb27632a141bdac",
                            //         height: 10,
                            //         width: 10
                            //     },
                            //     value: "Abortion"
                            // },
                            // {
                            //     label: "Behavioral Health Inpatient Facility",
                            //     "symbol": {
                            //         type: "picture-marker",
                            //         // imageData: "iVBORw0KGgoAAAANSUhEUgAAAA4AAAAMCAYAAABSgIzaAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAARVJREFUKJGdz79LAnEcxvG3fg++kYPQpouTkFCILUc/4OAGwfBAp0sHh0CKCzShoCvO5QbHm+I2MfoPgri/oMDdxanRve07RA1R9MMT69k+fHjB82j8M1rco9mU5XRarYQhd3+BwrLUqZSIMOQeeFkKOg6OZWEkEohej+Mg4HoZuFarYadSrAJUqxwEAbfA80LouvLSNNX2x20Y7HiePPd95cXCTCazYduzshAkP8cKkvW62vd9hsDTXNjpzC6KRTZ/tiiV2BoMOHNdTn5BXafearE3ZzMAjYY0RyN2p1P18BXKdpvDbJZcHMzl1Hq3y5Hj8Ai8agCVCleFAuZkEsfek89T1XVa4zE3GkAU0Y8i+ovZ97wBDdtA+SL27lcAAAAASUVORK5CYII=",
                            //         url: "https://services1.arcgis.com/mpVYz37anSdrK4d8/arcgis/rest/services/AZLicensedFacilities/FeatureServer/2/images/a6cd76c5528d878bcc1a38f4109b2b5e",
                            //         height: 9,
                            //         width: 10
                            //     },
                            //     "value": "BH Inpatient"
                            // },
                            {
                                label: "Home Health Agency",
                                "symbol": {
                                    type: "picture-marker",
                                    // imageData: "iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAVNJREFUKJGd0T1IQlEUwPG/rxdPcPCBSuEQFM2tupiTDpZEIUo6hFJOCkJNzY5NgrQ5ObiEBtnglOjQEK3OwROUpgY/LomvQXyVJkpnu4fzu+ece2X+GfLMWYrHifj97NvtbOg6405H0cplUSuXeVwE7YUCuXCYgMWC9TstCAaJeL3cZzJcAr2fcK1Y5DYaJWQyzY+lqmym01zIMnIqxbkBs1mSoRBHfyFjBwkpFiPUavGQz1ORAVwuAorC+rIHUVWsPh8nBrRa2V2GpmGzsWOMajKhrAolaVIrAwyHdIHtVWCvx7sB223leTQSbnn2V2ei3wdNU55ATGClIq6dTg49nsW76jrU67wmEuLG6FgqMQgGOW02uXO72ZrtLAQ0GrQ0jWNgbECAWIyXapW9Wo2cw4HHbMYJjPt93rpdpTYYiKtkks9p/a+7Dw74AM7mBxVzmS97Z2RTu8CDUwAAAABJRU5ErkJggg==",
                                    url: "https://services1.arcgis.com/mpVYz37anSdrK4d8/arcgis/rest/services/AZLicensedFacilities/FeatureServer/2/images/034a472bfd2f39a9db2b6e7f958b4acd",
                                    height: 10,
                                    width: 10
                                },
                                "value": "HHA"
                            },
                            // {
                            //     label: "Hospice",
                            //     "symbol": {
                            //         type: "picture-marker",
                            //         // imageData: "iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAFZJREFUKJFjYSATsDAwMDBMmsRwQEeH4RsxGq5cYfifl8fgzcLAwMBgbc2gbGTEIEOMRm5uhitwG8l26qjG4aHx1i0GTjY24jTcu8fAC9cYGckgQqqNAEoJDZSH1oKfAAAAAElFTkSuQmCC",
                            //         url: "https://services1.arcgis.com/mpVYz37anSdrK4d8/arcgis/rest/services/AZLicensedFacilities/FeatureServer/2/images/63b0c87994a1f2bc21cb7cb0826ab3d9",
                            //         height: 10,
                            //         width: 10
                            //     },
                            //     "value": "Hospice"
                            // },
                            // {
                            //     label: "Other Medical Behavioral Health Facility",
                            //     "symbol": {
                            //         type: "picture-marker",
                            //         // imageData: "iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAXBJREFUKJGdkDtIgmEYhR/F+FBpSCWRpijDQUEwMAKDimgoaG4LqqWpi1NTNEZbRRBBS9AYhEKbk9Q//IWQQaSIXTAKvqGIfLvZUEGECXbG8/LAc14b/4ytxs0DPABSFzg1xWQySbZYZK8u0GplYmCA3OZmfaDH58N7cYETaABeqoIulyu6tkZXU9OjGyCblc5YDOftLZZgkA2/X10C3Nw4S7OzHGqtj20AWmu9sMB4LEbb6CiOcBiCQRDBYbczVqkI6+s8ZTJypPWn+rfq+dkZneWyWmptlaG5OdqVArsdolHe5+fJJRLsiLAIvP/e+FwsynQmw5tpMtPdjQUgleI1nWZFhNWaz2lpoT8QwLK9Td7tpjEcprm3l0HTrA06SiU64nHyW1ssRyJ4+/qYuLqiB7AAlapgJMJwocC1YTACnJomFAqufb9f7yqlukTkoCp4cqLuRCQElL87rbVhGASUIvSnqoikfm/+yr2IpH8WHyT2jDbL8dUyAAAAAElFTkSuQmCC",
                            //         url: "https://services1.arcgis.com/mpVYz37anSdrK4d8/arcgis/rest/services/AZLicensedFacilities/FeatureServer/2/images/ca6199651fbba77d4177dc7735bfddd7",
                            //         height: 10,
                            //         width: 10
                            //     },
                            //     "value": "BH"
                            // },
                            {
                                label: "Other Medical Facility",
                                "symbol": {
                                    type: "picture-marker",
                                    // imageData: "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAOCAYAAAASVl2WAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAASZJREFUGJWFkb9LAnEYhx/luhPE0AYhcFLOoaH/4kv44xaJa3GP/oCcampsc2l0yYIjp1MRThoUIpra3BREOWgIvcH6xnE2BJYZ9G4v7zO8z+ej8M8oP5dGQztT1Z2hYbg3G4DjEBkMZCUI3HdgE3Bd6vk8sfmcmGVpl6YpT1dAp0NmPKaYycByCf2+PHEcLoTAUwBGI+2uVJIqQCgEhkG01+MWKCi2TWGxkPvJ5Pez6TR0u4h2mz0FdhORiBv+radphIOAbcUw3OtqVTufzWQ2Hv86Tibg+9pDsSgfFQBdl0fNJk/lMlsAts2brsvDlUUux3Otxv10yoHnQSJBXQhe1nJIpTBbLaa+z0c2y/FGUELgWZZ2parRoRCvwZ9dmKasgFyz+QRR/WbdHBqaDAAAAABJRU5ErkJggg==",
                                    url: "https://services1.arcgis.com/mpVYz37anSdrK4d8/arcgis/rest/services/AZLicensedFacilities/FeatureServer/2/images/4acf5e7376e8c0e660d06f6e3bcb89cf",
                                    height: 10,
                                    width: 6
                                },
                                "value": "MED - Other"
                            },
                            {
                                label: "Outpatient (Ambulatory) Surgery Center",
                                "symbol": {
                                    type: "picture-marker",
                                    // imageData: "iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAeFJREFUKJGdkk9Ik2Ecxz9brzxOpENEkyQcshgkCC3Fy3hDmremJATDndayf4MdktgEMRaJQQhCjOgQrOSlS3lLDBW8KLzMBQm7xIKGFw+bmuttPMu9dphJL7JLv9Pz+/L98Pye7+9R+M9SGuguTePD3p4wo1HpA2RDsK+Ps8PDvJyf576uo/h8XCqV5A5gC4Xo7O5mKh7nFlCxgOEw70dHuerx0BaPn3kEOwAMDNAZifBWVbnicKDEYty0gIbB81yOi4OD+Mpl48WRfCqRYK6/H28mQ94weHZi1LExPs7McMdm41UoJHuqVXA6aRYCZyZDfmWF4Pg4WQs4Oyu+9vbW31+pYDdNEKJuqFbh8BChqrxbW4NsVvyMxaRXAXC55OmODpyNom9v58Lf8/a2zB/fmEpxDaClBXc4zNTQEF21Wt3Y1ASrq+KzpvHw4EAW9/f5fQwuLZELBnFHIjz2++laXua7x8P53V0M0+TXyIj0trbydHqaG7pO0RKOqoo3fr+8vL7ON00jkUwyV6tRWVggareTCgTwFQqkdZ3rFrBYlA/SafF6a0veTaf5kUzW9YkJPjkc4vbGBk8KBXnvxDomJ/kCsueodW9uUi6VMOurkovA4r+BNfqr+UCAc41SBvgDVamsuI74EA8AAAAASUVORK5CYII=",
                                    url: "https://services1.arcgis.com/mpVYz37anSdrK4d8/arcgis/rest/services/AZLicensedFacilities/FeatureServer/2/images/ff100af2ab58f15cfb8ffa42981a834b",
                                    height: 10,
                                    width: 10
                                },
                                "value": "OSC"
                            },
                            {
                                label: "Outpatient Treatment Center",
                                "symbol": {
                                    type: "picture-marker",
                                    // imageData: "iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAUpJREFUKJGdzzFIAgEYxfG/54UO4RBOHRhkIOqQIbm0KeLiIDo5BCUuNbkeQaujUUQYDtFQuDs6NOQQEbRliiBiGiiCKOFhng2CJOkVvfXjx/eeyD8jatz0wBhQ/wyTSWxOJ1eKQi+fZz+d5u1XmMmsHLrdnSOXi9XxGCwW7ux2jhMJbhdB480N135/J2Q2swSg04HHw4YkcWky4Y3FOAA+pzCVYsduJ+3z4RTnlJcklqNR4iYTm+Uyu7LMqwhgs3EWCOCct3daxwiRCNvZLBeAVwQYDHgcjdjS67Uo9PswGhnyoEyqCgIn1SpxqxVBC5bL9Go15XS6MRTipVCgaLXi0ILtNs+yTH8KAVotHlQVh7Dg53AIzabhHhRmoKpyXq+zZ7GgmwcrFT4ajUnNGRgO85TLUe12WZsHSyWKssz7DwgQDLKutfF7vgD3kWYK8jnzyAAAAABJRU5ErkJggg==",
                                    url: "https://services1.arcgis.com/mpVYz37anSdrK4d8/arcgis/rest/services/AZLicensedFacilities/FeatureServer/2/images/9666b045052f09f60f319f18e45e0847",
                                    height: 10,
                                    width: 10
                                },
                                "value": "OTC"
                            }
                        ]
                    }
                }

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