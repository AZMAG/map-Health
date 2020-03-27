define([
    "mag/config",
    "esri/tasks/QueryTask"
], function(config, QueryTask) {
    const pointsQt = new QueryTask({
        url: config.mainUrl + config.queryLayerIndex
    });
    const geoQt = new QueryTask({
        url: config.mainUrl + config.demographicsLayerIndex
    });

    let $reportForm = $("#reportForm");
    let $reportType = $("#reportType");
    let $specificReport = $("#specificReport");

    $("body").on("click", "#standardBtnSubmit", () => {
        $("#reportModal").modal("show");
    })

    setupDropdowns();

    async function setupDropdowns() {

        let { features } = await geoQt.execute({
            returnDistinctValues: true,
            returnGeometry: false,
            where: '1=1'
        })

        features.sort((a, b) => {
            let aCounty = a.attributes["COUNTY"];
            let bCounty = b.attributes["COUNTY"];
            if (aCounty < bCounty) {
                return -1;
            }
            if (aCounty > bCounty) {
                return 1;
            }
        })

        features.forEach(({ attributes }) => {
            let county = attributes.COUNTY;
            $specificReport.append(`<option data-id="${county}">${county}</option>`);
        });
    }

    $reportForm.submit((e) => {
        e.preventDefault();
        let selectedReport = $specificReport.children("option:selected").data("id");
        openReport(selectedReport);
    })

    function getPointTableHTML(data) {
        console.log(data);

        let rows = data.map(({ Name, Capacity, P_Address }) => {
            return `
            <tr>
                <td>${Name}</td>
                <td>${Capacity}</td>
                <td>${P_Address}</td>
            </tr>
            `
        })

        return `
            <table class="table table-sm">
            <thead>
            <tr>
                <th scope="col">Name</th>
                <th scope="col">Capacity</th>
                <th scope="col">Address</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                ${rows.join('')}
            </tr>
            </tbody>
        </table>`
    }

    async function openReport(selectedReport) {
        let pointRes = await pointsQt.execute({
            returnGeometry: false,
            outFields: ["*"],
            where: `P_county = '${selectedReport}'`
        });
        let pointFeatures = pointRes.features;

        let categories = {}
        let categoryTitleLookup = {
            Hospital: "Hospitals",
            MED: "Medical Facilities",
            RES: "Residential Facilities",
            LTC: "Long-Term Care Facilities"
        }

        let allPoints = pointFeatures.map(({ attributes }) => {
            let cat = attributes["Category"];
            categories[cat] = categories[cat] || 0;
            categories[cat]++;
            return attributes;
        })

        let categoryLines = Object.keys(categories).map((category) => {
            return `<span><b>${categoryTitleLookup[category]}</b> ${categories[category]}</span>`;
        })

        $("#reportOutput").html(
            `   
                <h5>Total Healthcare Assets: ${allPoints.length}</h5> 
                ${categoryLines.join("<br>")}
                <br>
                ${getPointTableHTML(allPoints)}
            `
        )

    }
});