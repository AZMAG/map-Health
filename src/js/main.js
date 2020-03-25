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
        // "mag/report"
    ], function (config) {
        $(document).ready(function () {
            "use strict";

            //*** infohelp binding
            $("#helpInfo").load("views/info-card.html", function () {
                //*** contact binding
                $("#contactModal").load("views/modal-contact.html");
                //*** source binding
                $("#sourceModal").load("views/modal-source.html");
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

            //*** dashboard binding
            $("#dashboard").load("views/dashboard.html", function () {
                $("#dashboard").hide();
            });

            //*** feeback binding
            $("#feedbackModal").load("views/modal-feedback.html", function () {
                require(["mag/feedback"]);
            });
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
