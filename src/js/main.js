/**
 * JavaScript File
 * @Desc: Main
 */
define([
        "mag/config",
        "mag/map",
        "mag/widgets",
        "mag/hover",
        "mag/intro",
        "mag/feedback"
        // "mag/report"
    ], function (config) {
        $(document).ready(function () {
            "use strict";

            //*** infohelp binding
            $("#helpInfo").load("views/info-card.html", function () {
                //*** contact binding
                $("#contactModal").load("views/modal-contact.html");
                insertFooter();
                
                $(".infoBtn").click(function () {
                    $("#contactModal").modal("show");
                });

                require(["mag/layer"]);
            });

            function insertFooter() {

                $(".footer-section").load("views/footer.html", function () {
                    //*** version binding
                    $(".version").html(config.version);
                    //*** copy write binding
                    $(".copyright").html(config.copyright);
                });
            }
            insertFooter();


            //*** terms binding
            $("#termsModal").load("views/modal-terms.html", function () {
                insertFooter();
            });
            //*** privacy binding
            $("#privacyModal").load("views/modal-privacy.html", function () {
                insertFooter();
            });
            //*** legal binding
            $("#legalModal").load("views/modal-legal.html", function () {
                insertFooter();
            });

        });

        return;
    }

);
