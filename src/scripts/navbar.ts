import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { queryExcludeNested, querySingleExcludeNested } from '$utils/query';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  queryExcludeNested('.navbar_wrap', '.u-component-classes').forEach((navbarWrap) => {
    if (navbarWrap.dataset.scriptInitialized) return;
    navbarWrap.dataset.scriptInitialized = 'true';

    const bannerWrap = querySingleExcludeNested(
      '.navbar_banner_wrap',
      '.u-component-classes',
      navbarWrap
    );

    ScrollTrigger.create({
      trigger: 'body',
      start: '50px top',
      onToggle() {
        navbarWrap.classList.toggle('is-scrolled-down');
      },
    });

    if (bannerWrap) {
      let isBannerHidden = false;

      ScrollTrigger.create({
        trigger: 'body',
        start: '600px top',
        onToggle() {
          bannerWrap.style.marginTop = isBannerHidden ? '0px' : `-${bannerWrap.scrollHeight}px`;
          isBannerHidden = !isBannerHidden;
        },
      });
    }
  });
});
