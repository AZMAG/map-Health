/**
 * JavaScript File
 * @Desc: Main
 */

define([
        "mag/config",
        "mag/map",
        "mag/widgets",
        "mag/layer",
        "mag/hover",
        "mag/intro",
        "mag/feedback"
        // "mag/report"
    ], function (config) {
        $(document).ready(function () {
            "use strict";

            function insertFooter() {

                $(".footer-section").load("views/footer.html", function () {
                    //*** version binding
                    $(".version").html(config.version);
                    //*** copy write binding
                    $(".copyright").html(config.copyright);
                });
            }
            insertFooter();

        });

        return;
    }

);
