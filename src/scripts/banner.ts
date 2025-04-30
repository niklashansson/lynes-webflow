import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { queryExcludeNested } from '$utils/query';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  queryExcludeNested('[data-banner-id]', '.u-component-classes').forEach((banner) => {
    if (!(banner instanceof HTMLElement) || banner.dataset.scriptInitialized) return;
    banner.dataset.scriptInitialized = 'true';

    const closeButton = banner.querySelector('[data-banner-element="close"]');
    const isDismissable = !!banner.querySelector('[data-banner-element="dismissable-controller"]');

    const bannerId = banner.dataset.bannerId || 'default';
    const location = banner.dataset.bannerLocation || 'default';

    const sessionKey = `banner-dismissed:${bannerId}:${location}`;

    // Hide banner if already dismissed in this session
    if (sessionStorage.getItem(sessionKey) === 'true') {
      banner.style.display = 'none';
      return;
    }

    if (closeButton instanceof HTMLElement && isDismissable) {
      closeButton.addEventListener('click', () => {
        // Animate out then hide and store dismissal
        gsap.to(banner, {
          height: 0,
          opacity: 0,
          paddingTop: 0,
          paddingBottom: 0,
          duration: 0.2,
          ease: 'power2.inOut',
          onComplete: () => {
            banner.style.display = 'none';
            sessionStorage.setItem(sessionKey, 'true');
          },
        });
      });
    }
  });
});
