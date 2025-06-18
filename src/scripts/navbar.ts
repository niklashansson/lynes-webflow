import { computePosition, shift } from '@floating-ui/dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { queryExcludeNested } from '$utils/query';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  queryExcludeNested('.navbar_wrap', '.u-component-classes').forEach((navbarWrap) => {
    if (navbarWrap.dataset.scriptInitialized) return;
    navbarWrap.dataset.scriptInitialized = 'true';

    configureScrollTrigger(navbarWrap);
    configureFloatingDropdowns(navbarWrap);
  });
});

function configureScrollTrigger(navbarWrap: HTMLElement) {
  ScrollTrigger.create({
    trigger: 'body',
    start: '50px top', // When the scroll is 50px from the top
    onEnter: () => navbarWrap.classList.add('is-scrolled-down'),
    onLeaveBack: () => navbarWrap.classList.remove('is-scrolled-down'),
  });
}

function configureFloatingDropdowns(navbarWrap: HTMLElement) {
  const megaDropdowns = navbarWrap.querySelectorAll('.ndd_mega_wrap') as NodeListOf<HTMLElement>;
  megaDropdowns.forEach((dropdown) => {
    const toggle = dropdown.firstChild;
    const content = dropdown.lastChild;

    if (!(toggle instanceof HTMLElement) || !(content instanceof HTMLElement)) return;
    toggle.addEventListener('mouseenter', () => handleMouseEnter(toggle, content));
  });

  function handleMouseEnter(toggle: HTMLElement, content: HTMLElement) {
    computePosition(toggle, content, {
      placement: 'bottom-start',
      middleware: [
        shift({
          padding: {
            left: 24,
            right: 24,
          },
        }),
      ],
    }).then(({ x, y }) => {
      Object.assign(content.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  }
}
