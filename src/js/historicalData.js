define(["mag/config", "esri/tasks/QueryTask"], function (config, QueryTask) {
    async function getDataByCounty(county) {
        let qt = new QueryTask({ url: config.historicalCovidDataURL });
        let { features } = await qt.execute({
            returnDistinctValues: true,
            returnGeometry: false,
            where: `county='${county}'`,
            outFields: ["cases", "county", "date_entered", "deaths", "fips"],
        });
        return features.map(({ attributes }) => {
            return attributes;
        });
    }

    async function getDataByZip(zip) {
        let qt = new QueryTask({ url: config.covidZipLayerURL });
        let { features } = await qt.execute({
            returnDistinctValues: true,
            returnGeometry: false,
            where: `postcode='${zip}'`,
            outFields: ["postcode", "cases", "create_date"],
        });
        return features.map(({ attributes }) => {
            return attributes;
        });
    }

    async function createHistoricalChart(value, type, chartId) {
        let $chart = $(`#${chartId}`)[0];
        $chart.height = 350;

        let data;

        if (type === "county") {
            data = await getDataByCounty(value);
        } else if (type === "zip") {
            data = await getDataByZip(value);
        }
        let datasets = [
            {
                label: "Cases",
                data: data.map(({ cases }) => cases),
                borderColor: "blue",
                fill: false,
            },
            {
                label: "Deaths",
                data: data.map(({ deaths }) => deaths),
                borderColor: "red",
                fill: false,
            },
        ];
        if (type === "zip") {
            datasets.pop();
        }

        new Chart($chart, {
            type: "line",
            data: {
                labels: data.map(({ date_entered, create_date }) => {
                    let date = date_entered || create_date;
                    return moment(date).format("MM/DD");
                }),
                datasets,
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true,
                            },
                        },
                    ],
                },
            },
        });
    }

    return { getDataByCounty, createHistoricalChart };
});
