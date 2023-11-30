import { tabs } from '$utils/activeTabs';
import { codeAnimation, codeFile, letterAnimation } from '$utils/globalFunctions';

$(document).ready(function () {
  // Hero Animation
  $('#hero').each(function () {
    let title = $(this).find('#titleButton');
    let heading = $(this).find('h1');
    let par = $(this).find('p');
    let btn = $(this).find('.button');
    let tabBtn = '.dashboard_tab';
    let tab = '.dashboard_tab-inner';
    let fileType = '#file-type';
    let tabBrand = '.dashboard_tab-brand-box';
    let tabBrandBG = $(tabBrand).find('rect');
    let tabBrandLogo = $(tabBrand).find('path');
    let pythonLabel = '.dashboard_tab-label.python';
    let mojoLabel = '.dashboard_tab-label.mojo';
    let progressLineCode = '.dashboard_progress-line';
    let pythonCode = '#pythonCode';
    let mojoCode = '#mojoCode';

    const pythonCodeAnim = () => {
      let tl = gsap.timeline();

      tl.fromTo('#dashboard', { opacity: 0 }, { opacity: 1, duration: 0 }, '<')
        .add(codeFile(fileType, 0))
        .add(codeAnimation(pythonCode), '<');
      return tl;
    };

    const mojoCodeAnim = () => {
      let tl = gsap.timeline();
      tl.to(tabBrand, { xPercent: 133 }, '+=2')
        .to(tabBrandBG, { fill: '#B5C0F6' }, '<')
        .to(tabBrandLogo, { fill: '#020C13' }, '<')
        .to(pythonLabel, { opacity: 0 }, '<')
        .to(mojoLabel, { opacity: '1', duration: 0 })
        .add(codeFile(fileType, 1))
        .add(letterAnimation(mojoLabel, 'label'), '<')
        .set(pythonCode, { display: 'none' }, '<')
        .set(mojoCode, { display: 'block' }, '<')
        .add(codeAnimation(mojoCode), '<')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .add(gsap.delayedCall(3, () => {}));
      return tl;
    };

    let reveal = gsap.timeline({ delay: 0.6 });
    reveal
      .to(heading, { opacity: 1 })
      .call(() => {
        codeAnim.play();
      })
      .add(letterAnimation('h1'), '<')
      .fromTo(title, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '<+0.5');

    let codeAnim = gsap.timeline({ repeat: -1, paused: true });
    let codeVisible = 0;
    codeAnim
      // Python Code
      .add(pythonCodeAnim())
      .call(() => {
        codeVisible = 0;
      })
      .addLabel('Python Code')
      // Mojo Code
      .add(mojoCodeAnim())
      .call(() => {
        codeVisible = 1;
      })
      .addLabel('Mojo Code');

    $(tabBtn).on('click', function () {
      console.log(codeVisible);
      if (codeVisible === 0) {
        codeAnim.pause().seek('Mojo Code');
        codeVisible = 1;
      } else if (codeVisible === 1) {
        codeAnim.pause().seek('Python Code');
        codeVisible = 0;
      }
    });
  });

  tabs();
});
