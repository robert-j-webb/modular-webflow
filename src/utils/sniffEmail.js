export function SniffEmailForAmplitude() {
  const inputs = document.querySelectorAll('input[type=email]');
  for (let input of inputs) {
    const debouncedAmpCall = debounce((val) => amplitude.track('emailInput', { email: val }), 3000);
    input.addEventListener('input', (ev) => {
      if (ev.target.checkValidity()) {
        debouncedAmpCall(ev.target.value);
      }
    });
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
