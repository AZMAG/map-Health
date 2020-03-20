define([], function() {
    return {
        // mainUrl: "https://services1.arcgis.com/mpVYz37anSdrK4d8/arcgis/rest/services/AZLicensedFacilities/FeatureServer/",
        mainUrl: "https://geo.azmag.gov/arcgis/rest/services/maps/HealthData/MapServer/",
        initExtent: {
            xmin: -12975596.092135236,
            ymin: 3773390.176100314,
            xmax: -11862672.960303124,
            ymax: 4346362.140125967,
            spatialReference: {
                wkid: 102100
            }
        },

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
                title: 'Medical Facility',
                id: 'Medical_Facility',
                visible: true,
                scalable: true,
                showToc: true,
                index: 3
            },
            {
                type: 'feature',
                title: 'Residential Facility',
                id: 'Residential_Facility',
                visible: false,
                scalable: true,
                showToc: true,
                index: 4
            },
            {
                type: 'feature',
                title: 'Long-Term Care Facility',
                id: 'Long_Term_Care_Facility',
                visible: false,
                scalable: true,
                showToc: true,
                index: 2
            }, {
                type: 'feature',
                title: 'Hospital',
                id: 'Hospital',
                visible: true,
                scalable: true,
                showToc: true,
                index: 1
            }

        ]
    }
});
