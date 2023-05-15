import { handleCustomStyles } from '$utils/formFunctions';
console.log(formID);
hbspt.forms.create({
  region: 'na1',
  portalId: '24141518',
  formId: formID,
  target: '#form-container',
  onFormReady: function (form) {
    // Handle Custom Styles
    handleCustomStyles();

    // Check for "email" query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    if (email) {
      // Find the input field with name="email" inside the form
      const emailInput = document.querySelector('input[name="email"]');

      if (emailInput) {
        // Set the value of the input field to the email query parameter
        emailInput.value = email;
      }
    }
  },
});
