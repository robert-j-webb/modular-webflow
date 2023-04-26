// --- Custom Query Flow ---
function getQueryParam(param) {
  const urlSearchParams = new URLSearchParams(window.location.search);
  return urlSearchParams.get(param);
}
const queryParam = getQueryParam('flow');

// --- MultiStep Form Handling ---
var form = $('[data-form="multistep"]');
form.each(function () {
  // Vars
  var self = $(this);
  var x = 0;

  // Check for query flow
  var steps;
  if (queryParam) {
    steps = $(self).find('[data-form="step"][data-flow="' + queryParam + '"],[flow-base]');
    if (queryParam === 'hardware') {
      updateSuccessMessages(
        'Thank you!',
        'Thank you for your interest in partnering with us. We will contact you as soon as possible to discuss next steps.'
      );
    }
    if (queryParam === 'mojo') {
      updateSuccessMessages(
        'Thank you!',
        'We will contact you as soon as possible to discuss next steps.'
      );
    }
  }
  // Else show default
  else {
    var steps = $(self).find('[data-form="step"]').not('[data-flow]:not([flow-base])');
  }
  var totalSteps = steps.length;

  // Initialize the form
  $(self).find('.field-validation').hide();
  $(self)
    .find('[data-text=total-step]')
    .each(function () {
      $(this).text(totalSteps);
    });
  $(self).find('[data-form="step"]').hide();

  // Initial Clear
  $(self).find('.field-validation').hide();
  $(self).find('[data-form="submit-btn"]').hide();
  $(self)
    .find('[data-text=total-step]')
    .each(function () {
      $(this).text(totalSteps);
    });
  steps.hide();

  function formProgress(x) {
    const currentStep = $(self).find('[data-text=current-step]');
    const totalStep = $(self).find('[data-text=total-step]');

    // Ensure the lowest value for x is 1
    x = x + 1;

    let formattedX = x;

    if (totalStep.text() >= 10 && x < 10) {
      formattedX = '0' + x;
    }

    currentStep.text(formattedX);
  }

  // Update Displayed Form Step
  function updateStep() {
    //hide unhide steps
    steps.hide();
    formProgress(x);
    if (x === totalSteps - 1) {
      $(steps[x]).find('[data-form="next-btn"]').text('Submit');
    }
    $(steps[x]).fadeIn('slow');

    //hide unhide button
    const showOrHide = (selector, condition) => $(self).find(selector).toggle(condition);

    if (x === 0) {
      showOrHide('[data-form="next-btn"]', true);
      showOrHide('[data-form="back-btn"]', false);
    } else {
      showOrHide('[data-form="next-btn"]', true);
      showOrHide('[data-form="back-btn"]', true);
    }
  }

  // Validate Input Fields
  function validateInput(input) {
    let isValid = true;
    const value = $(input).val();

    if ($(input).prop('required') && value === '') {
      toggleValidationMsg(input, true);
      isValid = false;
    } else if ($(input).is('[type="email"]')) {
      const emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      if (!emailReg.test(value)) {
        toggleValidationMsg(input, true, 'Please fill correct email address.');
        isValid = false;
      } else {
        toggleValidationMsg(input, false);
      }
    } else {
      toggleValidationMsg(input, false);
    }

    return isValid;
  }

  // Validate Checkbox and Radio Groups
  function validateCheckboxRadio(elements) {
    if (!elements.length) return true;

    const atLeastOneChecked = elements.is(':checked');
    const firstGroupItem = elements.first();
    const closestWrapper = firstGroupItem.closest('.form-field-wrapper');

    if (!atLeastOneChecked) {
      toggleValidationMsg(closestWrapper, true);
      return false;
    }
    toggleValidationMsg(closestWrapper, false);
    return true;
  }

  // Show/Hide Validation Message
  const toggleValidationMsg = (element, condition, msg) => {
    const validation = $(element).closest('.form-field-wrapper').find('.field-validation');
    const formField = $(element).closest('.form-field');

    formField.toggleClass('error', condition);
    validation.toggle(condition);
    if (msg) {
      validation.text(msg);
    }
  };

  // Validation Flag
  const validationCalled = new Set();

  // Form Validation
  function validation() {
    let inputValidate = true;

    const inputs = $(steps[x]).find(':input:visible,select');
    inputs.each(function () {
      inputValidate = validateInput(this) && inputValidate;
    });

    const checkboxes = $(steps[x]).find(':checkbox:visible');
    const radios = $(steps[x]).find(':radio:visible');

    inputValidate = validateCheckboxRadio(checkboxes, 'checkbox') && inputValidate;
    inputValidate = validateCheckboxRadio(radios, 'radio') && inputValidate;

    validationCalled.add(x);
    return inputValidate;
  }

  // Validate on Input Change
  $(steps).on(
    'input change',
    ':input:visible, select, :checkbox:visible, :radio:visible',
    function () {
      if (validationCalled.has(x)) {
        validateInput(this);
      }
    }
  );

  // Functions for clicks
  function nextStep(e) {
    // Mojo Condition
    const isMojoOnlyChecked = $('#Mojo').is(':checked') && !$('#Inference-Engine').is(':checked');

    // Step Validation
    if (x === 1 && isMojoOnlyChecked) {
      handleMojoOnlySubmission();
    } else if (x < steps.length - 1) {
      let isValid = validation();
      if (isValid) {
        x += 1;
        updateStep();
      }
    } else {
      submitForm(e);
    }

    // Submit if Mojo
    function handleMojoOnlySubmission() {
      // Double check the required are gone
      let isValid = validation();

      if (isValid) {
        removeRequiredForElements();
        updateSuccessMessages(
          'Wow! You’re fast like Mojo!',
          'Thank you for signing up. We will contact you as soon as we can onboard you on our early trial program.'
        );
        $('form').trigger('submit');
      }
    }
  }

  function backStep() {
    if (x > 0) {
      x -= 1;
      updateStep();
    }
  }

  function submitForm(e) {
    let button = $(this);

    e.preventDefault();

    let isValid = validation();
    removeRequiredForElements();

    if (isValid) {
      $('form').trigger('submit');
      /*
          fillHubSpot();
          hsform.find('input[type=submit]').trigger('click');
          // set button to disabled
          let initText = $('[data-form="submit-btn"]').val();
          button.val('Submitting');
          button.addClass('disabled');
          button.attr('type', 'disabled');
          setTimeout(function () {
            mirrorHS();
            // set button back to normal
            button.val(initText);
            button.removeClass('disabled');
            button.attr('type', 'submit');
          }, 3000);
          */
    }
  }

  function removeRequiredForElements() {
    const steps = $(self).find('[data-form="step"]').not(':visible');
    console.log(steps);
    for (let i = 0; i < steps.length; i++) {
      $(steps[i])
        .find(':input[required], select[required]')
        .each(function () {
          if (!$(this).val()) $(this).data('initially-required', true);
          $(this).removeAttr('required');
        });
    }
  }

  function updateSuccessMessages(titleText, paragraphText) {
    if (titleText) {
      $('.w-form-done').find('.sign-up_step-head h2').text(titleText);
    }
    if (paragraphText) {
      $('.w-form-done').find('.sign-up_step-head p').text(paragraphText);
    }
  }

  // Elements Clicks
  $(self)
    .find('[data-form="next-btn"]')
    .on('click', function (e) {
      nextStep(e);
    });
  $(self)
    .find('[data-form="back-btn"]')
    .on('click', function () {
      backStep();
    });

  updateStep();
});

// --- Fill HubSpot Form Fields ---
function fillHubSpot() {
  var $form = $('[data-form="multistep"]:visible');

  var restaurantname = $form.find('input[name=restaurant-name]').val();
  var name = $form.find('input[name=name]').val();
  var phone = $form.find('input[name=international_phone_number]').val();
  var address = $form.find('input[name=restaurant-address]').val();
  var city = $form.find('input[name=locality]').val();
  var state = $form.find('input[name=administrative_area_level_1]').val();
  var zipcode = $form.find('input[name=postal_code]').val();
  var country = $form.find('input[name=country]').val();
  var firstname = $form.find('input[name=first-name]').val();
  var lastname = $form.find('input[name=last-name]').val();
  var cellphone = $form.find('input[name=cellphone]').val();
  var email = $form.find('input[name=email]').val();
  var userType = $form.find('select[name=person-type]').val();
  var website = $form.find('input[name=website]').val();
  var placeId = $form.find('input[name=place_id]').val();
  var placeTypes = $form.find('input[name=place_types]').val();
  var rating = $form.find('input[name=rating]').val();
  var userRating = $form.find('input[name=user_ratings_total]').val();
  var hearFrom = $form.find('select[name=hear]').val();
  var pageUrl = window.location.pathname;

  // Company Info
  hsform.find('input[name="0-2/name"]').val(name);
  hsform.find('input[name="0-2/phone"]').val(phone);
  hsform.find('input[name="0-2/address"]').val(address);
  hsform.find('input[name="0-2/city"]').val(city);
  hsform.find('input[name="0-2/state"]').val(state);
  hsform.find('input[name="0-2/zip"]').val(zipcode);
  hsform.find('input[name="0-2/country"]').val(country);
  hsform.find('input[name="website"]').val(website);
  hsform.find('input[name="place_id"]').val(placeId);
  hsform.find('input[name="0-2/place_types"]').val(placeTypes);
  hsform.find('input[name="place_rating"]').val(rating);
  hsform.find('input[name="user_ratings_total"]').val(userRating);

  // User
  hsform.find('input[name="firstname"]').val(firstname);
  hsform.find('input[name="lastname"]').val(lastname);
  hsform.find('input[name="mobilephone"]').val(phone);
  hsform.find('input[name="address"]').val(address);
  hsform.find('input[name="city"]').val(city);
  hsform.find('input[name="state"]').val(state);
  hsform.find('input[name="zip"]').val(zipcode);
  hsform.find('input[name="country"]').val(country);
  hsform.find('input[name="place_types_contact"]').val(placeTypes);
  hsform.find('input[name="lead_person_type"]').val(userType);
  hsform.find('input[name=how_did_you_hear_about_us]').val(hearFrom);

  // Extra
  hsform.find('input[name="last_pdf_download"]').val(pageUrl);

  var hsphone = hsform.find('input[name="phone"]');
  hsphone.val(phone);
  hsphone.get(0).focus();
  hsphone.get(0).blur();

  var hsphone = hsform.find('input[name="mobilephone"]');
  hsphone.val(cellphone);
  hsphone.get(0).focus();
  hsphone.get(0).blur();

  var hsemail = hsform.find('input[name="email"]');
  hsemail.val(email);
  hsemail.get(0).focus();
  hsemail.get(0).blur();

  hsform.find('input[name="company"]').val(name);
}

// --- Mirror HubSpot Error Messages ---
function mirrorHS() {
  let isError = false;

  // HS Phone
  var hsPhoneVal = hsform
    .find('input[name=mobilephone]')
    .parent()
    .siblings('.hs-error-msgs')
    .find('.hs-error-msg')
    .text();
  var gtPhoneVal = $('input[name="cellphone"]').siblings('.field-validation');
  if (hsPhoneVal) {
    isError = true;
    gtPhoneVal.text(hsPhoneVal);
    gtPhoneVal.show();
  } else {
    gtPhoneVal.hide();
  }

  // HS Email
  var hsEmailVal = hsform
    .find('input[name=email]')
    .closest('.hs-fieldtype-text')
    .find('.hs-error-msgs')
    .find('.hs-error-msg')
    .text();
  var gtEmail = $('input[name="email"]').closest('.form-field').find('.field-validation');
  if (hsEmailVal) {
    gtEmail.text(hsEmailVal);
    gtEmail.show();
    isError = true;
  } else {
    gtEmail.hide();
  }
  return isError;
}

// --- Custom Actions ---
// Prevent Default Submit Action
$('form[data-form=multistep]').submit(function (e) {
  e.preventDefault();
});

// Check Flex orientation based on the childrens
function checkFlexContainerHeight() {
  const parents = document.querySelectorAll('.sign-up_step-part._2');

  parents.forEach((parent) => {
    const children = parent.querySelectorAll('.sign-up_step-inner');

    let totalChildrenHeight = 0;

    children.forEach((child) => {
      totalChildrenHeight += child.offsetHeight;
    });

    if (totalChildrenHeight > parent.offsetHeight) {
      parent.classList.add('flex-start');
    } else {
      parent.classList.remove('flex-start');
    }
  });
}

// Load and Resize
checkFlexContainerHeight();
window.addEventListener('resize', checkFlexContainerHeight);
