define([
    "mag/config",
    "mag/map",
], function (config, {
    map,
    view
}) {
    let highlight;
    view.on("pointer-move", function (event) {
        $(".iconTooltip").hide();
        view.hitTest(event).then(function (response) {
            if (highlight) {
                highlight.remove();
            }
            // check if a feature is returned from the Layer
            // do something with the result graphic
            const filteredGfx = response.results.filter(function (result) {
                return !['gray-base-layer', 'tracts'].includes(result.graphic.layer.id);
            });

            var tt = $(".iconTooltip");
            tt.hide();
            if (filteredGfx.length > 0) {
                let resultGraphic = filteredGfx[0].graphic;

                var tooltipHtml = resultGraphic.attributes.Name;
                var tt = $(".iconTooltip");
                var text = $(".iconTooltiptext");
                text.html(tooltipHtml);
                tt.css({
                    display: "block",
                    left: response.screenPoint.x + 20,
                    top: response.screenPoint.y - 10
                });

                view.whenLayerView(resultGraphic.layer).then(function (layerView) {
                    highlight = layerView.highlight(resultGraphic);
                });
            }
        });

    });



});
