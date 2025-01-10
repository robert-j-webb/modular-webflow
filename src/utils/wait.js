export async function wait(ms = 15) {
  await new Promise((resolve) =>
    setTimeout(
      () =>
        requestAnimationFrame(() => {
          resolve();
        }),
      ms
    )
  );
}

/**
 * Checks every 15ms for a condition, up to a default of 1000 times, or 15s.
 */
export async function waitUntil(condition, maxChecks = 1000) {
  let timesChecked = 0;
  while (!condition() && timesChecked < maxChecks) {
    timesChecked = timesChecked + 1;
    await wait();
  }
}
