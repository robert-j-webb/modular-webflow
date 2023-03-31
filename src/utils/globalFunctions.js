// -- Text/Code Fuctions

// Wrap Letters
export const wrapLetters = (element) => {
  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const codeText = node.textContent;
      const fragment = document.createDocumentFragment();

      for (let i = 0; i < codeText.length; i++) {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = codeText[i];
        fragment.appendChild(span);
      }

      node.parentNode.replaceChild(fragment, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName !== 'BR') {
        const childNodes = Array.from(node.childNodes);
        childNodes.forEach(processNode);
      }
    }
  };

  $(element)
    .contents()
    .each(function () {
      processNode(this);
    });
};

const revealLetters = (elements) => {
  let letters = $(elements).find('.letter').not('.line-numbers-row .code-letter');
  const codeTimeline = gsap.timeline(); // create a child timeline based on the defaults
  letters.each((index, element) => {
    const wordHighlight = $(element).closest('.word-highlight');
    if (wordHighlight.length) {
      codeTimeline
        .fromTo(
          element,
          { display: 'none' }, // from value
          { display: 'inline' }, // to value
          index * 0.01 // delay
        )
        .to(wordHighlight, { opacity: 1, duration: 0.2 }, '<');
    } else {
      codeTimeline.fromTo(
        element,
        { visibility: 'hidden' }, // from value
        { visibility: 'initial' }, // to value
        index * 0.01 // delay
      );
    }
  });
  return codeTimeline;
};

// --- Text Animations
// Letter Animation
export const letterAnimation = (elements) => {
  wrapLetters(elements);
  return revealLetters(elements);
};

// CodeAnimation
export const codeAnimation = (className) => {
  const codeBlock = $(className).find('code');
  const lineNumbers = codeBlock.find('.line-numbers-rows').eq(0).clone();
  codeBlock.find('.line-numbers-rows').remove();
  wrapLetters(codeBlock);
  codeBlock.prepend(lineNumbers);
  return revealLetters(codeBlock);
};

// Typewrite
export const typeText = (element, text) => {
  const codeTimeline = gsap.timeline(); // create a child timeline based on the defaults
  codeTimeline.to(element, {
    text: { value: text, ease: 'none', speed: 1 },
  });
  return codeTimeline;
};

// ---- Graphs
// Animate Stats
export const animateCounter = ($element) => {
  const Cont = { val: 0 };
  const targetValue = parseFloat($element.text());

  const onUpdate = () => {
    const formattedValue = Cont.val % 1 === 0 ? Cont.val.toFixed(0) : Cont.val.toFixed(1);
    $element.text(formattedValue);
  };

  TweenLite.to(Cont, 1, {
    val: targetValue,
    onUpdate: onUpdate,
  });
};

export const animateGraphRow = (targets) => {
  const masterTimeline = gsap.timeline();

  $(targets).each(function (index) {
    let row = $(this).find('.grapha_box');
    let label = $(this).find('.grapha_label div');
    let number = $(this).find('.grapha_row-num div');

    const codeTimeline = gsap.timeline();

    codeTimeline
      .from(row, { scaleX: 0, duration: 1 })
      .add(letterAnimation(label))
      .add(animateCounter(number));

    // Stagger animations using the add() method
    masterTimeline.add(codeTimeline, index * 0.2);
  });

  return masterTimeline;
};

export const animateHorizontalGraph = (target, trigger) => {
  let triggerElement = $(trigger);
  let tl = gsap.timeline({
    ease: Power2.easeOut,
    paused: true,
    scrollTrigger: {
      trigger: triggerElement,
      // trigger element - viewport
      start: '50% bottom',
      onEnter: () => {
        // Play the timeline when the trigger element enters the viewport
        tl.play();
      },
    },
  });
  // Add the animation to the timeline
  tl.add(animateGraphRow(target));

  return tl;
};
