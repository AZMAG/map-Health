define(["mag/config", "esri/tasks/QueryTask"], function (config, QueryTask) {
    let qt = new QueryTask({ url: config.historicalCovidDataURL });
    async function getDataByCounty(county) {
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

    async function createHistoricalChart(county, chartId) {
        let $chart = $(`#${chartId}`)[0];
        $chart.height = 350;

        let data = await getDataByCounty(county);
        
        new Chart($chart, {
            type: "line",
            data: {
                labels: data.map(({ date_entered }) => {
                    return moment(date_entered).format('MM/DD');
                }),
                datasets: [
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
                ],
            },
            options: {
                maintainAspectRatio: false,
            },
        });
    }

    return { getDataByCounty, createHistoricalChart };
});
