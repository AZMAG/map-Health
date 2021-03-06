define([
    "mag/config",
    "mag/layer",
    "mag/historicalData",
    "esri/tasks/QueryTask",
], function (
    config,
    { addHighlightGraphicToMap, clearHighlightLayer },
    { createHistoricalChart },
    QueryTask
) {
    const pointsQt = new QueryTask({
        url: config.mainUrl + config.queryLayerIndex,
    });
    const geoQt = new QueryTask({
        url: config.mainUrl + config.demographicsLayerIndex,
    });
    const zipQT = new QueryTask({
        url: config.covidZipLayerURL,
    });

    let $reportForm = $("#reportForm");
    let $reportType = $("#reportType");
    let $specificReport = $("#specificReport");

    $("body").on("click", "#standardBtnSubmit", () => {
        $("#reportModal").modal({
            backdrop: "static",
        });
    });

    $("body").on("click", ".reportClose", () => {
        clearHighlightLayer();
    });

    $(".reportHeader").on("mousedown", function (mousedownEvt) {
        var $draggable = $(this);
        var x = mousedownEvt.pageX - $draggable.offset().left,
            y = mousedownEvt.pageY - $draggable.offset().top;
        $("body").on("mousemove.draggable", function (mousemoveEvt) {
            $draggable.closest(".modal-dialog").offset({
                left: mousemoveEvt.pageX - x,
                top: mousemoveEvt.pageY - y,
            });
        });
        $("body").one("mouseup", function () {
            $("body").off("mousemove.draggable");
        });
        $draggable.closest(".modal").one("bs.modal.hide", function () {
            $("body").off("mousemove.draggable");
        });
    });

    setupDropdowns();

    async function getTypes() {
        let { features } = await geoQt.execute({
            returnDistinctValues: true,
            returnGeometry: false,
            where: "1=1",
            outFields: ["Type"],
        });
        return features.map(({ attributes }) => {
            return attributes["Type"];
        });
    }

    async function getSpecificReportsByType(type) {
        const { features } = await geoQt.execute({
            returnDistinctValues: true,
            returnGeometry: false,
            where: `Type = '${type}'`,
            outFields: ["GEOID", "Name"],
        });
        const data = features.map(({ attributes }) => attributes);

        data.sort((a, b) => {
            let aName = a.Name;
            let bName = b.Name;
            if (aName < bName) {
                return -1;
            }
            return 1;
        });

        return data;
    }

    async function setupDropdowns() {
        // let types = await getTypes();
        // let typeOptions = types.map((type) => {
        //     return `<option data-id="${type}">${type}</option>`;
        // });

        //typeOptions.join("")
        let tempHtml = `
        <option data-id="County">County</option>
        <option data-id="Zip">Zip</option>
        <option data-id="Jurisdiction">Jurisdiction</option>
        <option data-id="Congressional District">Congressional District</option>
        <option data-id="Legislative District">Legislative District</option>
        `;

        $reportType.append(tempHtml);

        $(".selectpicker_health").selectpicker();
        $reportType.selectpicker("val", "County");

        //Setting up initially as County
        await setupSpecificReportDropdown("County");
    }

    $reportType.change(() => {
        const type = $reportType.val();
        setupSpecificReportDropdown(type);
    });

    async function setupSpecificReportDropdown(type) {
        let data = await getSpecificReportsByType(type);
        let specificReportOptions = data.map(({ GEOID, Name }) => {
            return `<option data-id="${GEOID}">${Name}</option>`;
        });
        $specificReport.selectpicker("destroy");
        $specificReport.html(specificReportOptions.join(""));
        $specificReport.selectpicker();
    }

    $reportForm.submit((e) => {
        e.preventDefault();
        let selectedReport = $specificReport
            .children("option:selected")
            .data("id");
        let type = $reportType.val();
        openReport(selectedReport, type);
    });

    function titleCase(string) {
        var sentence = string.toLowerCase().split(" ");
        for (var i = 0; i < sentence.length; i++) {
            sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
        }

        return sentence.join(" ");
    }

    function getPointTableHTML(data) {
        if (!data) {
            return "";
        }
        let rows = data.map(({ Name, Capacity, P_Address, SUBTYPE_ }) => {
            return `
            <tr>
                <td>${Name}</td>
                <td>${P_Address ? P_Address : "N/A"}</td>
                <td>${SUBTYPE_ ? titleCase(SUBTYPE_) : "N/A"}</td>
                </tr>
                `;
            // <td>${Capacity ? Capacity.toLocaleString() : 'N/A'}</td>
        });

        return `
        <div class="tableContainer">
            <table class="table table-sm">
                <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Address</th>
                    <th scope="col">Type of Facility</th>
                </tr>
                </thead>
                <tbody>
                    ${rows.join("")}
                </tbody>
            </table>
        </div>`;
    }

    const pointPolyFieldMap = {
        County: "sj_county",
        Jurisdiction: "sj_juris",
        Zip: "sj_zip",
        "Legislative District": "sj_legislative",
        "Congressional District": "sj_congress",
    };

    async function getPointHTML(selectedReport, type) {
        let categories = {};
        let categoryTitleLookup = {
            Hospital: "Hospitals",
            Capacity: "Hospital Beds",
            MED: "Medical Facilities",
            RES: "Residential Facilities",
            LTC: "Long-Term Care Facilities",
        };
        let pointRes = await pointsQt.execute({
            returnGeometry: false,
            outFields: ["*"],
            where: `${pointPolyFieldMap[type]} = '${selectedReport}'`,
        });

        let pointFeatures = pointRes.features;
        let allPoints = pointFeatures.map(({ attributes }) => {
            let cat = attributes["Category"];
            if (cat) {
                categories[cat] = categories[cat] || 0;
                categories[cat]++;

                if (cat === "Hospital") {
                    categories["Capacity"] = categories["Capacity"] || 0;
                    categories["Capacity"] += attributes["Capacity"];
                }
            }
            return attributes;
        });

        let categoryLines = Object.keys(categoryTitleLookup).map((category) => {
            return categories[category]
                ? `
            <div class="categoryLine">
                <img width="20" src="./icons/${category}.svg">
                <b>${categoryTitleLookup[category]}: </b>
                <span>${categories[category].toLocaleString()}</span>
            </div>`
                : "";
        });

        return `
        <h5>Total Healthcare Assets: <span class="badge badge-secondary">${allPoints.length.toLocaleString()}</span></h5>
        <br>
        <div class="container">
            <div class="row">
                <div class="col col-5">
                    ${categoryLines.join("")}
                </div>
                <div class="col col-7">
                    ${getPointTableHTML(allPoints)}
                </div>
            </div>
            <br />
            <button type="button" class="btn btn-info btn-xs source" data-toggle="modal" data-target="#sourceModal" data-dismiss="modal">Source</button>
        </div>
        `;
    }

    function getAgeTableHTML(data) {
        let ageConfig = [
            { field: "UNDER5", title: "Under 5" },
            { field: "AGE5TO9", title: "Age 5 to 9" },
            { field: "AGE10TO14", title: "Age 10 to 14" },
            { field: "AGE15TO19", title: "Age 15 to 19" },
            { field: "AGE20TO24", title: "Age 20 to 24" },
            { field: "AGE25TO34", title: "Age 25 to 34" },
            { field: "AGE35TO44", title: "Age 35 to 44" },
            { field: "AGE45TO54", title: "Age 45 to 54" },
            { field: "AGE55TO59", title: "Age 55 to 59" },
            { field: "AGE60TO64", title: "Age 60 to 64" },
            { field: "AGE65TO74", title: "Age 65 to 74" },
            { field: "AGE75TO84", title: "Age 75 to 84" },
            { field: "AGE85PLUS", title: "Age 85+" },
        ];

        let rows = ageConfig.map((age) => {
            return `
            <tr>
                <td>${age.title}</td>
                <td>${data[age.field].toLocaleString()}</td>
            </tr>
            `;
        });

        return `
        <div class="tableContainer">
            <table class="table table-sm">
                <thead>
                <tr>
                    <th scope="col">Age Category</th>
                    <th scope="col">Number of Persons</th>
                </tr>
                </thead>
                <tbody>
                    ${rows.join("")}
                </tbody>
            </table>
        </div>`;
    }

    async function getPolyData(selectedReport) {
        const polyRes = await geoQt.execute({
            returnGeometry: true,
            outFields: ["*"],
            where: `GEOID = '${selectedReport}'`,
        });
        return polyRes.features[0];
    }

    async function getPolyHTML(selectedReport, type) {
        let { geometry, attributes: data } = await getPolyData(selectedReport);
        let covidCases = null;
        if (type === "Zip") {
            const res = await zipQT.execute({
                returnGeometry: false,
                outFields: ["cases"],
                where: `POSTCODE = '${selectedReport.substring(2)}'`,
            });
            if (res.features.length === 1) {
                covidCases = res.features[0].attributes["cases"];
            }
        }
        addHighlightGraphicToMap(geometry);

        let leftPanelConf = [
            {
                field: "POPESTIMATE2018",
                title: "2018 Census Estimates",
                valueFormat: (val, data, i) => {
                    if (val) {
                        return val.toLocaleString();
                    } else {
                        return data["TOTAL_POP"].toLocaleString();
                    }
                },
                titleFormat: (val, data, i) => {
                    // return leftPanelConf[i].title;
                    return val
                        ? leftPanelConf[i].title
                        : " ACS 2017-2018 5 Year Population";
                },
            },
            {
                field: "AGE65PLUS",
                title: "Population Age 65+",
            },
            {
                field: "AGE65PLUS",
                pctField: "TOTAL_POP",
                title: "Percent of Population Age 65+",
                valueFormat: (val) => `${parseFloat(val).toFixed(1)}%`,
            },
            {
                field: "INCOME_BELOW_POVERTY",
                title: "Total Population Below Poverty",
            },
            {
                field: "PCT_INCOME_BELOW_POVERTY",
                title: "Percent of Population Below Poverty",
                valueFormat: (val) => `${parseFloat(val).toFixed(1)}%`,
            },
            {
                field: "SQMI",
                title: "Area",
                valueFormat: (val) =>
                    `${
                        val > 1
                            ? Math.round(val).toLocaleString()
                            : val.toFixed(2)
                    } (sq mi)`,
            },
            {
                field: "MEDIAN_HOUSEHOLD_INCOME",
                title: "Median Household Income",
                valueFormat: (val) => `$${Math.round(val).toLocaleString()}`,
            },
            {
                field: "POP_PER_SQMI",
                title: "Population Per SQMI",
            },
            {
                field: "MALE",
                title: "Male Population",
            },
            {
                field: "FEMALE",
                title: "Female Population",
            },
        ];

        let leftPanelLines = leftPanelConf.map(
            (
                { pctField, field, title, iconClass, valueFormat, titleFormat },
                i
            ) => {
                let val = pctField
                    ? (data[field] / data[pctField]) * 100
                    : data[field];
                return `
            <div class="categoryLine">
                <i class="${iconClass}"></i>
                <b>${titleFormat ? titleFormat(val, data, i) : title}: </b>
                <span>${
                    valueFormat
                        ? valueFormat(val, data, i)
                        : val.toLocaleString()
                }</span>
            </div>`;
            }
        );

        if (covidCases) {
            leftPanelLines.unshift(
                `
            <div class="categoryLine">
            <i class=""></i>
                <b>COVID-19 Cases: </b>
                <span> ${covidCases}</span>
            </div>
        `
            );
        }

        return {
            html: `
                <div class="container">
                    <div class="row">
                        <div class="col col-6">
                            ${leftPanelLines.join("")}
                        </div>
                        <div class="col col-6">
                            <b>Population by Age</b>
                            <br>
                            <br>
                            ${getAgeTableHTML(data)}
                        </div>
                    </div>
                    <br />
                    <button type="button"
                    class="btn btn-info btn-xs source"
                    data-toggle="modal"
                    data-target="#sourceModal"
                    data-dismiss="modal">Source</button>
                </div>
                `,
            data,
        };
    }

    async function getTitle(selectedReport, type) {
        let { attributes: data } = await getPolyData(selectedReport);
        return `<h5>${data["Name"]} Report</h5>`;
    }

    async function openReport(selectedReport, type) {
        const [polyData, pointHtml, title] = await Promise.all([
            getPolyHTML(selectedReport, type),
            getPointHTML(selectedReport, type),
            getTitle(selectedReport, type),
        ]);
        $("#reportOutput").html(
            `
            ${title}
            <ul class="nav nav-tabs" id="reportTabs" role="tablist">
                <li class="nav-item">
                    <a class="nav-link active" id="demographics-tab" data-toggle="tab" href="#demographics" role="tab" aria-controls="demographics" aria-selected="true">Demographics</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="assets-tab" data-toggle="tab" href="#assets" role="tab" aria-controls="assets" aria-selected="false">Healthcare Assets</a>
                </li>
            </ul>
            <div class="tab-content" id="reportTabsContent">
                <div class="tab-pane fade show active" id="demographics" role="tabpanel" aria-labelledby="demographics-tab">
                    ${polyData.html}
                </div>
                <div class="tab-pane fade" id="assets" role="tabpanel" aria-labelledby="assets-tab">
                    ${pointHtml}
                </div>
                <div class="tab-pane fade" id="historical" role="tabpanel" aria-labelledby="historical-tab">
                    <div class="chartContainer">
                        <canvas id="historicalChart"></canvas>
                        </div>
                        <br />
                        <button type="button"
                        class="btn btn-info btn-xs source"
                        data-toggle="modal"
                        data-target="#sourceModal"
                        data-dismiss="modal">Source</button>
                </div>
            </div>
            `
        );
        if (type === "County") {
            let county = polyData.data["Name"];
            $("#reportTabs").append(`
                <li class="nav-item">
                    <a class="nav-link" id="historical-tab" data-toggle="tab" href="#historical"
                    role="tab" aria-controls="historical" aria-selected="false">Historical Covid-19 Data</a>
                </li>
            `);
            await createHistoricalChart(county, "county", "historicalChart");
        } else if (type === "Zip") {
            let zip = polyData.data["Name"];
            $("#reportTabs").append(`
                <li class="nav-item">
                    <a class="nav-link" id="historical-tab" data-toggle="tab" href="#historical"
                    role="tab" aria-controls="historical" aria-selected="false">Historical Covid-19 Data</a>
                </li>
            `);
            await createHistoricalChart(zip, "zip", "historicalChart");
        }
    }
});
