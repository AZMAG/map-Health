define([
    "mag/config",
    "mag/map",
], function (config, {
    map,
    view
}) {

    view.on("pointer-move", function(event) {
        $(".iconTooltip").hide();
        view.hitTest(event).then(function(response) {
          // check if a feature is returned from the Layer
          // do something with the result graphic
          const resultGraphic = response.results.filter(function(result) {
            return result.graphic.layer != "tracks";
          })[0].graphic;

          var tooltipHtml = resultGraphic.attributes.Name;
          console.log(tooltipHtml);

            var tt = $(".iconTooltip");
            var text = $(".iconTooltiptext");
            text.html(tooltipHtml);
            tt.css({
                display: "block",
                left: response.screenPoint.x + 40,
                top: response.screenPoint.y - 10
            });


        });




      });



});
