"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/utils/formFunctions.js
  function handleCheckboxClick() {
    $(".hs-form-checkbox").on("click", function() {
      if ($(this).find("input[type=checkbox]").is(":checked")) {
        $(this).find("label").addClass("active");
      } else {
        $(this).find("label").removeClass("active");
      }
    });
  }
  function handleRadioButtonChange() {
    $(".hs-form-radio").on("change", function() {
      let radioGroup = $(this).find("input[type=radio]").attr("name");
      let radioButtons = $('input[name="' + radioGroup.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"));
      radioButtons.closest("label").removeClass("active");
      if ($(this).find("input[type=radio]").is(":checked")) {
        $(this).find("label").addClass("active");
      }
    });
  }
  function handleSelectChange() {
    $("select").niceSelect();
    $(".nice-select li").on("click", function() {
      $(".nice-select .current").css("color", "#020c13");
    });
  }
  var handleCustomStyles = () => {
    handleCheckboxClick();
    handleRadioButtonChange();
    handleSelectChange();
  };

  // src/get-started-flows.js
  console.log(formID);
  hbspt.forms.create({
    region: "na1",
    portalId: "24141518",
    formId: formID,
    target: "#form-container",
    onFormReady: function(form) {
      handleCustomStyles();
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get("email");
      if (email) {
        const emailInput = document.querySelector('input[name="email"]');
        if (emailInput) {
          emailInput.value = email;
        }
      }
    }
  });
})();
//# sourceMappingURL=get-started-flows.js.map
