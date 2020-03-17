var config = {
    mainUrl: "https://services1.arcgis.com/mpVYz37anSdrK4d8/arcgis/rest/services/AZLicensedFacilities/FeatureServer/",
    initExtent: {
        xmin: -13574253.11189688,
        ymin: 3469475.629806112,
        xmax: -11226102.906676117,
        ymax: 4615421.849749786,
        spatialReference: {
            wkid: 102100
        }
    },
    colorRamp: [
        [171, 217, 233],
        [44, 123, 182],
        [255, 255, 191],
        [215, 25, 28],
        [253, 174, 97]
    ],

    layers: [
        // {
        //     type: "tile",
        //     url: 'http://server.arcgisonline.com/arcgis/rest/services/Reference/World_Transportation/MapServer',
        //     title: "Streets",
        //     id: "Streets",
        //     visible: true,
        //     showToc: true
        // }, 
        
        // {
        //     type: "image",
        //     url: "https://geo.azmag.gov/arcgis/rest/services/readon/MapLIT2018/MapServer",
        //     title: "County Boundaries",
        //     index: 5,
        //     opacity: 1,
        //     visible: true,
        //     showToc: false,
        //     id: "countyBoundaries"
        // },
        {
            type: 'feature',
            title: 'Radiation Control Facility',
            visible: false,
            index: 8
        }, {
            type: 'feature',
            title: 'DUI and/or Domestic Violence Treatment Center',
            visible: false,
            index: 7
        }, {
            type: 'feature',
            title: 'Business Hearing Aid Dispenser',
            visible: false,
            index: 6
        }, {
            type: 'feature',
            title: 'Group Home for Individuals with a Developmental Disability',
            visible: false,
            index: 5
        }, {
            type: 'feature',
            title: 'Residential Facility',
            visible: false,
            index: 4
        }, {
            type: 'feature',
            title: 'Child Care Facility',
            visible: false,
            index: 3
        }, {
            type: 'feature',
            title: 'Medical Facility',
            visible: true,
            index: 2
        }, {
            type: 'feature',
            title: 'Long-Term Care Facility',
            visible: false,
            index: 1
        }, {
            type: 'feature',
            title: 'Hospital',
            visible: true,
            index: 0
        }
    ]
}