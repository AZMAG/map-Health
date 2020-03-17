var config = {
    defExpression: {
        MAG: {
            include: `MPA in('AJ','FL','GR','MA','PC','QC','AV','BU','CA','CC','CH','EL','FM','FH','GB','GI','GL','GO','GU','LP','CO','ME','PA','PE','PH','SA','SC','SU','TE','TO','WI','YO')`,
            exclude: `MPA in('KE','MM','MR','SP','WK','AK','SN','CG','CL','EY','TC')`
        },
        CAG: {
            include: `MPA in('AJ','FL','GR','MA','PC','QC','KE','MM','MR','SP','WK','AK','SN','CG','CL','EY','TC')`,
            exclude: `MPA in('AV','BU','CA','CC','CH','EL','FM','FH','GB','GI','GL','GO','GU','LP','CO','ME','PA','PE','PH','SA','SC','SU','TE','TO','WI','YO')`
        },
    },
    mainUrl: "https://geo.azmag.gov/arcgis/rest/services/maps/Projections2019/MapServer/",
    feedbackUrl: "https://geo.azmag.gov/services/ProjectionsReview/Main/SendFeedback",
    initExtent: {
        xmax: -12173618.791367317,
        xmin: -12760655.168597186,
        ymax: 4073634.8232044266,
        ymin: 3787148.8411917244,
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
    layers: [{
            type: "feature",
            index: "0",
            title: "Traffic Analysis Zone",
            displayField: "TAZ2016b",
            id: "TAZ",
            cbr: true
        },
        {
            type: "feature",
            index: "1",
            title: "Regional Analysis Zone",
            displayField: "RAZ2016b",
            id: "RAZ",
            visible: false,
            cbr: true
        }, {
            type: "feature",
            index: "2",
            title: "Municipal Planning Area",
            displayField: "MPA_FULLNAME",
            id: "MPA",
            visible: false,
            cbr: false
        },
        // {
        //     index: "3",
        //     title: "County",
        //     displayField: "MPA_FULLNAME",
        //     id: "COUNTY",
        //     visible: false,
        //     cbr: false
        // },
        {
            type: "image",
            url: "https://geo.azmag.gov/gismag/rest/services/maps/EXLU_2017/MapServer",
            title: "Existing Land Use 2017",
            index: "0",
            opacity: .7,
            visible: false,
            showToc: true,
            id: "EXLU_2018",
            legendEnabled: true
        },
        {
            type: "image",
            url: "https://geo.azmag.gov/gismag/rest/services/maps/MapLIT2018/MapServer",
            title: "County Boundaries",
            index: "5",
            opacity: 1,
            visible: true,
            showToc: false,
            id: "countyBoundaries",
            definitionExpression: `COUNTY in('Maricopa', 'Pinal')`
        },
        {
            type: "image",
            url: "https://geo.azmag.gov/gismag/rest/services/maps/FLU_2018/MapServer",
            title: "Future Land Use 2018",
            index: "0",
            opacity: .7,
            visible: false,
            showToc: true,
            id: "FLU_2018",
            legendEnabled: true
        },
        {
            type: "image",
            url: "https://geo.azmag.gov/gismag/rest/services/maps/Developments_2018/MapServer",
            title: "Developments 2018",
            index: "1",
            opacity: .7,
            visible: false,
            showToc: true,
            id: "DEV_2018",
            legendEnabled: true
        },
        {
            type: "tile",
            url: 'http://server.arcgisonline.com/arcgis/rest/services/Reference/World_Transportation/MapServer',
            title: "Streets",
            id: "Streets",
            visible: false,
            showToc: true
        }

    ],
    fields: [{
            title: "Population",
            subFields: [{
                name: "total_pop",
                description: "Total Population"
            }, {
                name: "hh_pop",
                description: "Household Population"
            }, {
                name: "gq_pop",
                description: "Group Quarters Population"
            }]
        }, {
            title: "Jobs",
            subFields: [{
                    name: "total_emp",
                    description: "Total Jobs"
                }, {
                    name: "site_based_jobs",
                    description: "Site Based Jobs"
                }
                // ,{
                //     name: "nsb_jobs",
                //     description: "Non-Site Based Jobs"
                // }, {
                //     name: "wah_jobs",
                //     description: "Work at Home Jobs"
                // }, {
                //     name: "constr_jobs",
                //     description: "Construction Jobs"
                // }
            ]
        },
        // {
        //     title: "Housing",
        //     subFields: [{
        //             name: "households",
        //             description: "Total Households"
        //         },
        //         {
        //             name: "residential_units",
        //             description: "Residential Units"
        //         }
        //     ]
        // }
    ],
    years: [2018, 2020, 2030, 2040, 2050, 2055]
}

config.fieldsDef = {}

config.fields.forEach(fld => {
    fld.subFields.forEach(subFld => {
        config.fieldsDef[subFld.name] = subFld;
    })
});

if (typeof window === 'undefined') {
    module.exports = config;
}