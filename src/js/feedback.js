$(() => {
    //Main Modal
    const $feedbackModal = $("#feedbackModal");

    //Main Form
    const $feedbackForm = $("#feedbackForm");

    //Success Message
    const $successMessage = $(".successMessage");

    //Form controls
    const $feedbackFeature = $("#feedbackFeature");
    const $feedbackText = $("#feedbackText");
    const $fileControl = $("#fileControl");
    const $contactName = $("#contactName");
    const $emailAddress = $("#emailAddress");
    const $phoneNumber = $("#phoneNumber");

    $("body").on("click", ".btnProvideFeedback", function() {
        SetupForm();
        $feedbackModal.modal("show");
    })

    $feedbackForm.submit(function(e) {
        e.preventDefault();

        var form = document.getElementById('feedbackForm');
        var formData = new FormData(form);
        let data = GetFormData();

        Object.keys(data).forEach(function(key) {
            formData.append(key, data[key]);
        });

        var xhr = new XMLHttpRequest();
        xhr.open('POST', config.feedbackUrl, true);
        xhr.send(formData);

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
        let selectedFeature = app.view.popup.selectedFeature;
        let attr = selectedFeature.attributes;
        let lyr = selectedFeature.layer;
        $feedbackFeature.html(`${lyr.title}:  <strong>${attr[lyr.displayField]}</strong>`)
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
        let selectedFeature = app.view.popup.selectedFeature;
        let attr = selectedFeature.attributes;
        let lyr = selectedFeature.layer;
        let extent = selectedFeature.geometry.extent;

        return {
            xmax: extent.xmax,
            xmin: extent.xmin,
            ymax: extent.ymax,
            ymin: extent.ymin,
            dataId: attr[lyr.displayField],
            layerId: lyr.id,
            comment: $feedbackText.val(),
            file: $fileControl.val(),
            name: $contactName.val(),
            email: $emailAddress.val(),
            phone: $phoneNumber.val()
        }
    }
})