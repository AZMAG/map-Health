define([], function() {
    return {
        mainUrl: "https://services1.arcgis.com/mpVYz37anSdrK4d8/arcgis/rest/services/AZLicensedFacilities/FeatureServer/",
        // mainUrl: "https://geo.azmag.gov/arcgis/rest/services/maps/HealthData/MapServer/",
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
            // {
            //     type: "feature",
            //     opacity: .5,
            //     url: "https://geo.azmag.gov/arcgis/rest/services/maps/HealthData/MapServer/0",
            //     // index: 0,
            //     title: "Tracts",
            //     tocTitle: `Vulnerability <span><i class="fas fa-question-circle infoBtn"></i></span>`,
            //     id: "Vulnerability",
            //     visible: true,
            //     showToc: false,
            //     backgroundLayer: true
            // },
            // {
            //     type: 'feature',
            //     title: 'Hospital Locations',
            //     visible: true,
            //     showToc: true,
            //     index: 1
            // },
            // {
            //     type: 'feature',
            //     title: 'Radiation Control Facility',
            //     id: 'Radiation_Control_Facility',
            //     visible: false,
            //     showToc: true,
            //     index: 8
            // }, 
            // {
            //     type: 'feature',
            //     title: 'DUI and/or Domestic Violence Treatment Center',
            //     id: 'DUI_and_or_Domestic_Violence_Treatment_Center',
            //     visible: false,
            //     showToc: true,
            //     index: 7
            // },
            //  {
            //     type: 'feature',
            //     title: 'Business Hearing Aid Dispenser',
            //     id: 'Business_Hearing_Aid_Dispenser',
            //     visible: false,
            //     showToc: true,
            //     index: 6
            // }, 
            // {
            //     type: 'feature',
            //     title: 'Group Home for Individuals with a Developmental Disability',
            //     id: 'Group_Home_for_Individuals_with_a_Developmental_Disability',
            //     visible: false,
            //     showToc: true,
            //     index: 5
            // }, 
            {
                type: 'feature',
                title: 'Hospital',
                id: 'Hospital',
                visible: true,
                showToc: true,
                index: 0
            },
            {
                type: 'feature',
                title: 'Medical Facility',
                id: 'Medical_Facility',
                visible: true,
                showToc: true,
                index: 2
            },
            {
                type: 'feature',
                title: 'Residential Facility',
                id: 'Residential_Facility',
                visible: false,
                showToc: true,
                index: 4
            },

            // {
            //     type: 'feature',
            //     title: 'Child Care Facility',
            //     id: 'Child_Care_Facility',
            //     visible: false,
            //     showToc: true,
            //     index: 3
            // }, 

            {
                type: 'feature',
                title: 'Long-Term Care Facility',
                id: 'Long_Term_Care_Facility',
                visible: false,
                showToc: true,
                index: 1
            }

        ]
    }
});