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
    const highlights = $(element).find('.word-highlight');

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
    if (highlights.length) {
      const firstHighlight = highlights[0];
      const currentBgColor = window
        .getComputedStyle(firstHighlight)
        .getPropertyValue('background-color');
      const currentBoxShadow = window
        .getComputedStyle(firstHighlight)
        .getPropertyValue('box-shadow');

      const hexToRGBA = (hex, alpha) => {
        const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      const rgbaToTransparent = (rgba) => {
        const rgbaArray = rgba
          .replace(/^rgba?\(/, '')
          .replace(/\)$/, '')
          .split(',');
        return `rgba(${rgbaArray[0]}, ${rgbaArray[1]}, ${rgbaArray[2]}, 0)`;
      };

      const isHex = (color) => /^#(?:[0-9a-f]{3}){1,2}$/i.test(color);

      const initialBackgroundColor = isHex(currentBgColor)
        ? hexToRGBA(currentBgColor, 0)
        : rgbaToTransparent(currentBgColor);

      const initialBoxShadow = currentBoxShadow.replace(/rgba?\([^)]+\)/g, (match) => {
        return isHex(match) ? hexToRGBA(match, 0) : rgbaToTransparent(match);
      });

      Array.from(highlights).forEach((element) => {
        element.style.backgroundColor = initialBackgroundColor;
        element.style.boxShadow = initialBoxShadow;
      });

      codeTimeline.to(
        highlights,
        {
          backgroundColor: currentBgColor,
          boxShadow: currentBoxShadow,
          duration: 0.35,
        },
        '<'
      );
    }
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

// Code Files Change
export const codeFile = (element, index) => {
  let tl = gsap.timeline();

  let text = index === 0 ? 'PY' : '&#x1F525';
  tl.set(element, { text: text });
  return tl;
};

// ---- Graphs
// Animate Stats
const animateCounter = ($element) => {
  $($element).each(function () {
    const Cont = { val: 0 };
    const originalText = $(this).text();
    const targetValue = parseFloat(originalText);
    const isOriginalHalf = originalText % 1 >= 0.5 && originalText % 1 < 1;

    if (!isNaN(targetValue)) {
      // Hide the element before the animation starts
      $(this).css('visibility', 'hidden');
      const onUpdate = () => {
        let formattedValue;

        if (Math.abs(targetValue - Cont.val) <= 0.01) {
          formattedValue = targetValue % 1 === 0 ? targetValue.toFixed(0) : targetValue.toFixed(2);
        } else if (Cont.val >= 1) {
          formattedValue = Math.floor(Cont.val).toFixed(0);
        } else {
          formattedValue = Cont.val.toFixed(2);
        }

        $(this).text(formattedValue);
      };

      TweenLite.to(Cont, 1, {
        val: targetValue,
        onUpdate: onUpdate,
        onStart: () => $(this).css('visibility', 'visible'),
      });
    } else {
      return;
    }
  });
};
// Animate Graph Head
const graphHeadAnimation = (graphClassPrefix) => {
  const masterTimeline = gsap.timeline();
  masterTimeline
    .add(letterAnimation(`.graph${graphClassPrefix}_head .text-size-metadata`), 'label')
    .add(() => animateCounter(`.graph${graphClassPrefix}_head .graph-number`), '<');

  return masterTimeline;
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
      // Show the number element and call animateCounter
      .add(() => {
        animateCounter(number);
      }, '<')
      .add(letterAnimation(label, 'label'));

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
  tl.add(graphHeadAnimation(graphType));
  tl.add(animateGraphRow(target, graphType), '<');

  return tl;
};

export const animateChartGraph = (target, graphType, trigger) => {
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

  tl.add(graphHeadAnimation(graphType));
  tl.add(letterAnimation(labels, 'label'), '<')
    .add(animateGraphChart(chart), '<')
    .fromTo(labelDot, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1 }, '<');

  return tl;
};

export const animateBoxGraph = (target, graphType, trigger) => {
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
  tl.add(graphHeadAnimation(graphType));
  tl.fromTo(
    box,
    {
      scale: 0,
      opacity: 0,
    },
    {
      scale: 1,
      opacity: 1,
      stagger: 0.2,
    }
  ).add(letterAnimation(labels, 'label'));

  return tl;
};
