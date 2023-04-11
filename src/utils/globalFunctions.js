// -- Text/Code Fuctions

// Wrap Letters
export const wrapLetters = (element) => {
  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // Check if the parent node has the "letter" class
      if (!node.parentNode.classList.contains('letter')) {
        const codeText = node.textContent;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < codeText.length; i++) {
          const span = document.createElement('span');
          span.className = 'letter';
          span.textContent = codeText[i];
          fragment.appendChild(span);
        }

        node.parentNode.replaceChild(fragment, node);
      }
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

const revealLetters = (elements, letterDelay) => {
  const codeTimeline = gsap.timeline(); // create a single timeline for all elements and letters

  let globalLetterIndex = 0; // initialize a global letter index

  // Iterate over each element passed
  $(elements).each((elementIndex, element) => {
    const letters = $(element).find('.letter').not('.line-numbers-row .code-letter');

    // Animate each letter in the current element
    letters.each((letterIndex, letter) => {
      codeTimeline.fromTo(
        letter,
        { visibility: 'hidden' },
        { visibility: 'initial' },
        globalLetterIndex * letterDelay,
        '<'
      );

      globalLetterIndex++; // increment the global letter index
    });
  });
  return codeTimeline;
};

// --- Text Animations
// Letter Animation
export const letterAnimation = (elements, letterType) => {
  let letterDelay;
  if (letterType === 'label') {
    letterDelay = 0.03;
  } else if (letterType === 'heading') {
    letterDelay = 0.01;
  } else if (typeof letterType === 'number') {
    letterDelay = letterType;
  } else {
    letterDelay = 0.01;
  }
  wrapLetters(elements);
  return revealLetters(elements, letterDelay);
};

// CodeAnimation
export const codeAnimation = (className) => {
  const codeBlock = $(className).find('code');
  const lineNumbers = codeBlock.find('.line-numbers-rows').eq(0).clone();
  codeBlock.find('.line-numbers-rows').remove();
  wrapLetters(codeBlock);
  codeBlock.prepend(lineNumbers);
  return revealLetters(codeBlock, 0.01);
};

// Typewrite
export const typeText = (element, text) => {
  const codeTimeline = gsap.timeline(); // create a child timeline based on the defaults
  codeTimeline.to(
    element,
    {
      text: { value: text, ease: 'none', speed: 1 },
    },
    '<'
  );
  return codeTimeline;
};

// ---- Graphs
// Animate Stats
const animateCounter = ($element) => {
  $($element).each(function () {
    const Cont = { val: 0 };
    const originalText = $(this).text();
    const targetValue = parseFloat(originalText);

    if (!isNaN(targetValue)) {
      const onUpdate = () => {
        const formattedValue = Cont.val % 1 === 0 ? Cont.val.toFixed(0) : Cont.val.toFixed(1);
        $(this).text(formattedValue);
      };

      TweenLite.to(Cont, 1, {
        val: targetValue,
        onUpdate: onUpdate,
      });
    } else {
      return;
    }
  });
};

// Graphs Inner Animations
const animateGraphRow = (targets, graphClassPrefix) => {
  const masterTimeline = gsap.timeline();

  $(targets).each(function (index) {
    let row = $(this).find(`.graph${graphClassPrefix}_box`);
    let label = $(this).find(`.graph${graphClassPrefix}_label div`);
    let number = $(this).find(`.graph${graphClassPrefix}_row-num div`);

    const codeTimeline = gsap.timeline();

    codeTimeline
      .from(row, { scaleX: 0, duration: 1 })
      .add(letterAnimation(label, 'label'))
      .add(animateCounter(number));

    // Stagger animations using the add() method
    masterTimeline.add(codeTimeline, index * 0.2);
  });

  return masterTimeline;
};

const animateGraphChart = (target) => {
  let tl = gsap.timeline();

  tl.fromTo(
    target,
    {
      scaleY: 0,
    },
    { scaleY: 1, duration: 1 },
    '<'
  );
};

// Graph Types Animations
export const animateHorizontalGraph = (target, graphType, trigger) => {
  let triggerElement = $(trigger);
  let tl = gsap.timeline({
    ease: Power2.easeOut,
    paused: true,
    scrollTrigger: {
      trigger: triggerElement,
      start: '70% bottom',
      onEnter: () => {
        // Play the timeline when the trigger element enters the viewport
        tl.play();
      },
    },
  });
  tl.add(animateGraphRow(target, graphType));

  return tl;
};

export const animateChartGraph = (target, trigger) => {
  let triggerElement = $(trigger);
  let tl = gsap.timeline({
    ease: Power2.easeOut,
    paused: true,
    scrollTrigger: {
      trigger: triggerElement,
      start: '70% bottom',
      onEnter: () => {
        // Play the timeline when the trigger element enters the viewport
        tl.play();
      },
    },
  });

  let labels = $(target).find('.text-size-label');
  let labelDot = $(trigger).find('.graphd_legend-dot');
  let chart = $(target).find('.graph-charts');

  tl.add(letterAnimation(labels, 'label'), '<')
    .add(animateGraphChart(chart), '<')
    .fromTo(labelDot, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1 }, '<');

  return tl;
};

export const animateBoxGraph = (target, trigger) => {
  let triggerElement = $(trigger);
  let tl = gsap.timeline({
    ease: Power2.easeOut,
    paused: true,
    scrollTrigger: {
      trigger: triggerElement,
      start: '70% bottom',
      onEnter: () => {
        // Play the timeline when the trigger element enters the viewport
        tl.play();
      },
    },
  });

  let labels = $(target).find('.text-size-label');
  let box = $(target).find('.graphc_item');
  tl.set(box, {
    scale: 0,
    opacity: 0,
  });
  tl.to(box, {
    scale: 1,
    opacity: 1,
    stagger: 0.2,
  }).add(letterAnimation(labels, 'label'));

  return tl;
};
