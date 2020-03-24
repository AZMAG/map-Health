define([], function () {
    return {
        // mainUrl: "https://services1.arcgis.com/mpVYz37anSdrK4d8/arcgis/rest/services/AZLicensedFacilities/FeatureServer/",
        mainUrl: "https://geo.azmag.gov/arcgis/rest/services/maps/HealthData/MapServer/",
        feedbackUrl: "https://geo.azmag.gov/services/HealthcareFeedback/Feedback/SendFeedback",
        initExtent: {
            xmin: -12975596.092135236,
            ymin: 3773390.176100314,
            xmax: -11862672.960303124,
            ymax: 4346362.140125967,
            spatialReference: {
                wkid: 102100
            }
        },

        version: 'v0.0.3 | 2020-03-23',
        copyright: '2020',

        breaks: {
            "TOTAL_POP": [0, 2879, 4487, 6170, 8907, 17951],
            "Totoal_Pop_Under_Poverty": [0, 440, 889, 1473, 2331, 3962]
        },


        layers: [{
                type: "tile",
                url: 'http://server.arcgisonline.com/arcgis/rest/services/Reference/World_Transportation/MapServer',
                title: "Streets",
                id: "Streets",
                visible: true,
                showToc: false
            },
            {
                type: 'feature',
                title: 'Laboratory',
                id: 'Laboratory',
                visible: false,
                scalable: true,
                showToc: true,
                index: 5,
                uvr: [{
                    value: 'Laboratory',
                    label: 'Laboratory',
                    symbol: {
                        type: 'picture-marker',
                        url: "icons/Laboratory.svg"
                    }
                }]
            },
            {
                type: 'feature',
                title: 'Residential Facility',
                id: 'Residential_Facility',
                visible: false,
                scalable: true,
                showToc: true,
                index: 4,
                uvr: [{
                    value: 'AL Center',
                    label: 'Assisted Living Home',
                    symbol: {
                        type: 'picture-marker',
                        url: "icons/AL Center.svg"
                    }
                }, {
                    value: 'AL Home',
                    label: 'Assisted Living Home',
                    symbol: {
                        type: 'picture-marker',
                        url: "icons/AL Home.svg"
                    }
                }]
            },
            {
                type: 'feature',
                title: 'Long-Term Care Facility',
                id: 'Long_Term_Care_Facility',
                visible: false,
                scalable: true,
                showToc: true,
                index: 2,
                uvr: [{
                    value: 'NH',
                    label: 'Nursing Home',
                    symbol: {
                        type: 'picture-marker',
                        url: "icons/NH_1.svg"
                    }
                }]
            },
            {
                type: 'feature',
                title: 'Medical Facility',
                id: 'Medical_Facility',
                visible: true,
                showToc: true,
                index: 3,
                uvr: [{
                    value: 'MED - Other',
                    label: 'Other Medical Facility',
                    symbol: {
                        type: 'picture-marker',
                        url: "icons/MED.svg"
                    }
                }, {
                    value: 'OSC',
                    label: 'Outpatient Surgery Center',
                    symbol: {
                        type: 'picture-marker',
                        url: "icons/OSC.svg"
                    }
                }, {
                    value: 'OTC',
                    label: 'Outpatient Treatment Center',
                    symbol: {
                        type: 'picture-marker',
                        url: "icons/OTC.svg"
                    }
                }, {
                    value: 'BH',
                    label: 'Behavioral Health Facility',
                    symbol: {
                        type: 'picture-marker',
                        url: "icons/BH.svg"
                    }
                }]
            },
            {
                type: 'feature',
                title: 'Hospital',
                id: 'Hospital',
                visible: true,
                scalable: true,
                showToc: true,
                index: 1,
                uvr: [{
                    value: 'HOSPITAL',
                    label: 'Hospital',
                    symbol: {
                        type: 'picture-marker',
                        url: "icons/HOSPITAL.svg"
                    }
                }]
            }
        ]
    }
});
