import { handleCustomStyles } from '$utils/formFunctions';

// --- Form
let hsform;
const steps = [
  ['firstname', 'lastname', 'email', 'phone'],
  ['jobtitle', '0-2/size', 'modular_product_name', '0-2/industry', 'message'],
];
const customErrorMessages = {
  'First name': 'Please fill your first name.',
  'Last name': 'Please fill your last name.',
  'Work Email': 'Please fill your email.',
  'Phone number': 'Please fill your phone.',
  'Job title': 'Please fill your job title.',
  Size: 'Please select your company size',
  'Modular Product Interest': 'Please select the product',
  Industry: 'Please select your industry.',
  Message: 'Please fill your message',

  // Add more custom error messages as needed
};
const stepsTexts = ['Next', 'Submit'];
let controlBtn = '#formBtn';
const formBlock = '.sign-up_step-part._2';
let fields;
let currentSteps;
let x = 0;

function tagFields() {
  document.querySelectorAll('.hs-form-field :is(input, select, textarea)').forEach((element) => {
    steps.forEach((step, i) => {
      step.forEach((field) => {
        if (element.name === field) {
          element.closest('.hs-form-field').setAttribute('data-step', i);
        }
      });
    });
  });
}

hbspt.forms.create({
  region: 'na1',
  portalId: '24141518',
  formId: '1950a422-c88a-494c-b659-dc1c71dd9d5d',
  target: '#form-container',
  onFormReady: function (form) {
    hsform = form;
    initMultiStep();

    // Actions
    $(controlBtn).on('click', function () {
      if (validation()) {
        if (x === steps.length - 1) {
          submitForm();
        } else {
          updateStep();
        }
      } else {
        return;
      }
    });

    // Validate on Change
    $('input, select, :checkbox, :radio')
      .not('[type=email]')
      .on('input focus change', function () {
        const submitBtn = $(controlBtn);
        if (x !== steps.length - 1) {
          submitBtn.text(stepsTexts[0]);
        }
        removeErrorMessages($(this));
      });

    // Handle Custom Styles
    handleCustomStyles();
  },
  onFormSubmitted: function () {
    $(controlBtn).hide();
  },
});

function initMultiStep() {
  x = 0;
  fields = $('.hs-form-field');

  // Init Multisteps
  tagFields();
  fields.hide();

  // Reveal
  $('.sign-up_step-inner').animate({ opacity: 1 }, 300);
  currentSteps = fields.filter(`[data-step=${x}]`);
  currentSteps.fadeIn('slow');
}

function updateStep() {
  const submitBtn = $(controlBtn);
  x += 1;
  currentSteps = fields.filter(`[data-step=${x}]`);
  if (x === steps.length - 1) {
    submitBtn.text(stepsTexts[1]);
  } else {
    submitBtn.text(stepsTexts[0]);
  }
  currentSteps.fadeIn('slow');
  $('.hs-target_hardware').fadeIn('slow');

  // Scroll to the element
  const input = currentSteps.find('input').eq(0);
  const inputTop = input.offset().top;
  const windowHeight = $(window).height();
  const scrollTo = inputTop - windowHeight / 2;
  $('html, body').animate({ scrollTop: scrollTo }, 500);

  // Focus on the element
  input.focus();
}

function submitForm() {
  removeErrorMessages();
  hsform.find('input[type=submit]').trigger('click');
}

// ---- Validation Functions

// Validate Input Fields
function validateInput(input) {
  let isValid = true;
  const value = $(input).val();
  const inputParentElement = $(input).closest('.input');
  const labelText = inputParentElement.siblings('label').find('span').eq(0).text();
  const errorMessage = customErrorMessages[labelText] || `Error for ${labelText}`; // Fallback to a default error message

  if (value === '' || value == null) {
    createErrorMessage(errorMessage, input);
    isValid = false;
  }

  return isValid;
}

// Validate Checkbox and Radio Groups
function validateCheckboxRadio(elements) {
  if (!elements.length) return true;

  const atLeastOneChecked = elements.is(':checked');
  const firstGroupItem = elements.first();
  const closestWrapper = firstGroupItem.closest('.inputs-list');

  if (!atLeastOneChecked) {
    createErrorMessage('Please select at least one option.', closestWrapper);
    return false;
  }
  return true;
}

// Validation Flag
const validationCalled = new Set();

// Show Error
function createErrorMessage(labelText, element) {
  const inputParentElement = $(element).closest('.input');

  // check if the input parent element already has an error message element
  if (inputParentElement.next().hasClass('hs-error-msgs')) {
    return; // exit the function if an error message already exists
  }

  // create the error message elements
  const labelElement = $('<label>', {
    class: 'hs-error-msg hs-main-font-element',
    text: labelText,
  });
  const ulElement = $('<ul>', {
    class: 'no-list hs-error-msgs inputs-list custom-error-msg',
    role: 'alert',
  });
  const liElement = $('<li>');

  liElement.append(labelElement);
  ulElement.append(liElement);

  // insert the error message as a sibling of the input's parent element
  inputParentElement.after(ulElement);

  // add the "invalid" and "error" classes to the input or input group elements
  if (element.tagName === 'INPUT') {
    $(element).addClass('invalid error custom-error-class');
  }
}

function removeErrorMessages(element) {
  const $errorContainer = element ? $(element).closest('.hs-form-field') : $(document.body);
  const $errorMessages = $errorContainer.find('.custom-error-msg');
  const $errorClass = $errorContainer.find('.custom-error-class');
  $errorMessages.remove();
  $errorClass.removeClass('invalid error custom-error-class');
}

// ----- Validation
function validation() {
  let inputValidate = true;
  removeErrorMessages();

  const inputs = currentSteps.find(':input:visible,select').not('[type=email]');
  inputs.each(function () {
    inputValidate = validateInput(this) && inputValidate;
  });
  let hsemail = $('input[type=email]');
  hsemail.get(0).focus();
  hsemail.get(0).blur();

  const checkboxes = currentSteps.find(':checkbox:visible');
  const radios = currentSteps.find(':radio:visible');

  inputValidate = validateCheckboxRadio(checkboxes, 'checkbox') && inputValidate;
  inputValidate = validateCheckboxRadio(radios, 'radio') && inputValidate;

  validationCalled.add(x);
  return inputValidate;
}
