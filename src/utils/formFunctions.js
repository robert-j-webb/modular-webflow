// Function to handle checkbox clicks
function handleCheckboxClick() {
  $('.hs-form-checkbox').on('click', function () {
    if ($(this).find('input[type=checkbox]').is(':checked')) {
      $(this).find('label').addClass('active');
    } else {
      $(this).find('label').removeClass('active');
    }
  });
}

// Function to handle radio button changes
function handleRadioButtonChange() {
  $('.hs-form-radio').on('change', function () {
    // First, remove the 'active' class from all radio buttons with the same name
    let radioGroup = $(this).find('input[type=radio]').attr('name');
    let radioButtons = $('input[name="' + radioGroup.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
    radioButtons.closest('label').removeClass('active');

    // Then, add the 'active' class to the selected radio button
    if ($(this).find('input[type=radio]').is(':checked')) {
      $(this).find('label').addClass('active');
    }
  });
}

// Function to initialize custom select elements
function handleSelectChange() {
  $('select').niceSelect();
  $('.nice-select li').on('click', function () {
    $('.nice-select .current').css('color', '#020c13');
  });
}

export const handleCustomStyles = () => {
  handleCheckboxClick();
  handleRadioButtonChange();
  handleSelectChange();
};
