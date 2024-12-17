export function SniffEmailForAmplitude() {
  setInterval(() => {
    sniffEmail();
  }, 1000);
}

let lastFire = '';
function sniffEmail() {
  const inputs = document.querySelectorAll('input[type=email]');

  for (let input of inputs) {
    if (input.classList.contains('emailCheck')) {
      continue;
    }
    let formParent = input.parentElement;
    while (formParent && formParent.nodeName !== 'FORM' && formParent.nodeName !== 'BODY') {
      formParent = formParent.parentElement;
    }
    const { formId } = formParent.dataset;

    const debouncedAmpCall = debounce((input, formId) => {
      if (!input.checkValidity() || input.classList.contains('error')) {
        return;
      }
      lastFire = input.value;
      amplitude.track('emailInput', { email: input.value, formId });
    }, 3000);
    input.addEventListener('blur', (ev) => {
      if (ev.target.value === lastFire) {
        return;
      }
      if (
        ev.target.checkValidity() &&
        !ev.target.classList.contains('error') &&
        ev.target.value !== ''
      ) {
        debouncedAmpCall(ev.target, formId);
      }
    });
    input.classList.add('emailCheck');
  }
}

const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
};
