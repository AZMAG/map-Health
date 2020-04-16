define([], function() {
    var streetsURL =
        "https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Transportation/MapServer";

    return {
        // mainUrl: "https://services1.arcgis.com/mpVYz37anSdrK4d8/arcgis/rest/services/AZLicensedFacilities/FeatureServer/",
        mainUrl: "https://geo.azmag.gov/arcgis/rest/services/maps/HealthData/MapServer/",
        feedbackUrl: "https://geo.azmag.gov/services/HealthcareFeedback/Feedback/SendFeedback",

        covidCountyLayerURL: "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/ncov_cases_US/FeatureServer/0/query?where=Province_State+%3D+%27Arizona%27&outFields=*&f=json",

        covidZipLayerURL: "https://geo.azmag.gov/arcgis/rest/services/Hosted/COVID19_By_Zip_Code/FeatureServer/0",

        healthLayerURL: "https://geo.azmag.gov/arcgis/rest/services/maps/HealthData/MapServer/0",

        historicalCovidDataURL: "https://geo.azmag.gov/arcgis/rest/services/Hosted/Covid_19_NY_Times_Historical/FeatureServer/0",

        queryLayerIndex: 6,
        demographicsLayerIndex: 7,
        initExtent: {
            xmin: -12975596.092135236,
            ymin: 3773390.176100314,
            xmax: -11862672.960303124,
            ymax: 4346362.140125967,
            spatialReference: {
                wkid: 102100,
            },
        },

        version: "v1.1.1 | 2020-04-08",
        copyright: "2020",

        countyLookup: {
            "001": "Apache",
            "003": "Cochise",
            "005": "Coconino",
            "007": "Gila",
            "009": "Graham",
            "011": "Greenlee",
            "012": "La Paz",
            "013": "Maricopa",
            "015": "Mohave",
            "017": "Navajo",
            "019": "Pima",
            "021": "Pinal",
            "023": "Santa Cruz",
            "025": "Yavapai",
            "027": "Yuma",
        },

        breaks: {
            TOTAL_POP: [0, 2879, 4487, 6170, 8907, 17951],
            Totoal_Pop_Under_Poverty: [0, 440, 889, 1473, 2331, 3962],
        },

        layers: [{
                type: "tile",
                url: streetsURL,
                title: "Streets",
                id: "Streets",
                visible: true,
                showToc: false,
            },
            {
                type: "feature",
                title: "Residential Facility",
                id: "Residential_Facility",
                definition: "Facilities intended for long term assistance.",
                visible: false,
                scalable: true,
                showToc: true,
                index: 4,
                uvr: [{
                        value: "AL CENTER",
                        label: "Assisted Living Center",
                        symbol: {
                            type: "picture-marker",
                            url: "icons/AL Center.svg",
                        },
                    },
                    {
                        value: "AL HOME",
                        label: "Assisted Living Home",
                        symbol: {
                            type: "picture-marker",
                            url: "icons/AL Home.svg",
                        },
                    },
                ],
            },
            {
                type: "feature",
                title: "Long-Term Care Facility",
                id: "Long_Term_Care_Facility",
                definition: "Nursing Homes",
                visible: false,
                scalable: true,
                showToc: true,
                index: 2,
                uvr: [{
                    value: "NH",
                    label: "Nursing Home",
                    symbol: {
                        type: "picture-marker",
                        url: "icons/NH_1.svg",
                    },
                }, ],
            },
            {
                type: "feature",
                title: "Diagnostic Facilities",
                id: "Laboratory",
                definition: "Laboratories and other medical testing facilities.",
                visible: false,
                scalable: true,
                showToc: true,
                index: 5,
                uvr: [{
                    value: "LABORATORY",
                    label: "Diagnostic Facility",
                    symbol: {
                        type: "picture-marker",
                        url: "icons/Laboratory.svg",
                    },
                }, ],
            },
            {
                type: "feature",
                title: "Medical Facility",
                id: "Medical_Facility",
                visible: true,
                showToc: true,
                definition: "A variety of outpatient treatment facilities",
                index: 3,
                uvr: [{
                        value: "MED - Other",
                        label: "Other Medical Facility",
                        symbol: {
                            type: "picture-marker",
                            url: "icons/MED.svg",
                        },
                    },
                    {
                        value: "OSC",
                        label: "Outpatient Surgery Center",
                        symbol: {
                            type: "picture-marker",
                            url: "icons/OSC.svg",
                        },
                    },
                    {
                        value: "OTC",
                        label: "Outpatient Treatment Center",
                        symbol: {
                            type: "picture-marker",
                            url: "icons/OTC.svg",
                        },
                    },
                    // {
                    //     value: 'BH',
                    //     label: 'Behavioral Health Facility',
                    //     symbol: {
                    //         type: 'picture-marker',
                    //         url: "icons/BH.svg"
                    //     }
                    // }
                ],
            },
            {
                type: "feature",
                title: "Hospital",
                id: "Hospital",
                visible: true,
                scalable: true,
                showToc: true,
                index: 1,
                uvr: [{
                    value: "HOSPITAL",
                    label: "Hospital",
                    symbol: {
                        type: "picture-marker",
                        url: "icons/HOSPITAL.svg",
                    },
                }, ],
            },
        ],
    };
});