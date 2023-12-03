// Sets up a carousel given tabs, card, and some functions to run on leave and enter.
// Only starts the carousel when the first tab scrolls into view.
export function tabCarousel({ tabs, cards, onCardLeave, onTabLeave, onCardShow, onTabShow }) {
  if (tabs.length !== cards.length) {
    throw new Error(`Cards length: ${cards.length} did not match tabs length: ${tabs.length}`);
  }

  let hasManuallyClicked = false;
  let curIdx = 0;

  async function showCard(curIdx) {
    const prevCardIdx = curIdx === 0 ? cards.length - 1 : curIdx - 1;

    await Promise.all([onCardLeave(cards.eq(prevCardIdx)), onTabLeave(tabs.eq(prevCardIdx))]);

    // Wait until the previous card and tab are hidden before moving to the next one.
    await Promise.all([onCardShow(cards.eq(curIdx)), onTabShow(tabs.eq(curIdx))]);
  }

  async function startAnimation() {
    while (!hasManuallyClicked) {
      await showCard(curIdx);
      curIdx += 1;
      if (curIdx === cards.length) {
        curIdx = 0;
      }
    }
  }

  tabs.each((idx, tabEl) => {
    tabEl.onclick = () => {
      // Don't wait for promises to resolve, do everything simultaneously.
      onCardLeave(cards.eq(curIdx));
      onTabLeave(tabs.eq(curIdx));
      onCardShow(cards.eq(idx));
      onTabShow(tabs.eq(idx));
      hasManuallyClicked = true;
      curIdx = idx;
    };
  });

  // Wait for scroll into view before you show the animation
  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].intersectionRatio <= 0) return;
      startAnimation();
      intersectionObserver.unobserve(tabs[0]);
    },
    { threshold: 1.0 }
  );
  intersectionObserver.observe(tabs[0]);
}
