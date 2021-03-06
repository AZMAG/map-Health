define([
    'mag/map',
    'mag/config'
], function ({
    view
}, config) {

    //Main Modal
    const $feedbackModal = $("#feedbackModal");

    //Main Form
    const $feedbackForm = $("#feedbackForm");

    //Success Message
    const $successMessage = $(".successMessage");

    //Form controls
    const $feedbackFeature = $("#feedbackFeature");
    const $feedbackText = $("#feedbackText");
    const $contactName = $("#contactName");
    const $emailAddress = $("#emailAddress");
    const $phoneNumber = $("#phoneNumber");

    $("body").on("click", ".btnProvideFeedback", function () {
        $(".iconTooltip").hide();
        SetupForm();
        $feedbackModal.modal("show");
    });

    $feedbackForm.submit(function (e) {
        e.preventDefault();

        let data = GetFormData();
        fetch(config.feedbackUrl, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(data)
        });

        UpdateStoredContact(data);

        $feedbackModal.modal("hide");
        $successMessage.fadeIn(300, function () {
            var message = this;
            setTimeout(function () {
                $(message).fadeOut(500);
            }, 3000);
        });
    });

    function SetupForm(isNew) {
        $feedbackForm[0].reset();
        if (view.popup.selectedFeature) {
            let selectedFeature = view.popup.selectedFeature;
            let attr = selectedFeature.attributes;
            let lyr = selectedFeature.layer;
            $feedbackFeature.html(`${lyr.title}:  <strong>${attr["Name"]}</strong>`);
        }
        if (isNew) {
            $feedbackForm.find("#addressContainer").show();
        } else {
            $feedbackForm.find("#addressContainer").hide();
        }

        PrePopulateContactInfo();
    }

    function UpdateStoredContact(data) {
        localStorage.setItem("mag_contactName", data.name);
        localStorage.setItem("mag_contactEmail", data.email);
        localStorage.setItem("mag_contactPhone", data.phone);
    }

    function PrePopulateContactInfo() {

        let storedContactName = localStorage.getItem("mag_contactName");
        let storedContactEmail = localStorage.getItem("mag_contactEmail");
        let storedContactPhone = localStorage.getItem("mag_contactPhone");

        if (storedContactName) {
            $contactName.val(storedContactName);
        }

        if (storedContactEmail) {
            $emailAddress.val(storedContactEmail);
        }

        if (storedContactPhone) {
            $phoneNumber.val(storedContactPhone);
        }
    }


    function GetFormData() {
        let layerId = $("#address").val();
        let dataId = "new";

        if (view.popup.selectedFeature) {
            let selectedFeature = view.popup.selectedFeature;
            let attr = selectedFeature.attributes;
            let lyr = selectedFeature.layer;
            layerId = lyr.id;
            dataId = attr["Name"];
        }

        return {
            dataId,
            layerId,
            comment: $feedbackText.val(),
            name: $contactName.val(),
            email: $emailAddress.val(),
            phone: $phoneNumber.val()
        };
    }

    view.popup.viewModel.on("trigger-action", function (event) {
        if (event.action.id === "feedback") {
            SetupForm(false);
            $feedbackModal.modal("show");
        }
    });

    view.on("click", clickHandler);

    function clickHandler(e) {
        if (e.button === 2) {

            var top = e.y - 10;
            var left = e.x;

            $("#context-menu").css({
                display: "block",
                top,
                left
            });
        } else {
            $("#context-menu").hide();
        }
    }

    $("#addFeedback").click(() => {
        $("#context-menu").hide();
        SetupForm(true);
        $feedbackModal.modal("show");
    });

});
