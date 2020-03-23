define([
    'mag/map',
    'mag/config'
], function({ view }, config) {

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

    $("body").on("click", ".btnProvideFeedback", function() {
        $(".iconTooltip").hide();
        SetupForm();
        $feedbackModal.modal("show");
    })

    $feedbackForm.submit(function(e) {
        e.preventDefault();

        let data = GetFormData();
        fetch(config.feedbackUrl, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(data)
        })

        UpdateStoredContact(data);

        $feedbackModal.modal("hide");
        $successMessage.fadeIn(300, function() {
            var message = this;
            setTimeout(function() {
                $(message).fadeOut(500);
            }, 3000);
        });
    })

    function SetupForm() {
        let selectedFeature = view.popup.selectedFeature;
        let attr = selectedFeature.attributes;
        let lyr = selectedFeature.layer;
        $feedbackFeature.html(`${lyr.title}:  <strong>${attr["Name"]}</strong>`)
        $feedbackForm[0].reset();
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
        let selectedFeature = view.popup.selectedFeature;
        let attr = selectedFeature.attributes;
        let lyr = selectedFeature.layer;

        return {
            dataId: attr["Name"],
            layerId: lyr.id,
            comment: $feedbackText.val(),
            name: $contactName.val(),
            email: $emailAddress.val(),
            phone: $phoneNumber.val()
        }
    }

    view.popup.viewModel.on("trigger-action", function(event) {
        if (event.action.id === "feedback") {
            SetupForm();
            $feedbackModal.modal("show");
        }
    });
});