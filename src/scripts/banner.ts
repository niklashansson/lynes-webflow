import { queryExcludeNested } from '$utils/query';

document.addEventListener('DOMContentLoaded', () => {
  queryExcludeNested('[data-banner-id]', '.u-component-classes').forEach((banner) => {
    if (!(banner instanceof HTMLElement) || banner.dataset.scriptInitialized) return;
    banner.dataset.scriptInitialized = 'true';

    const closeButton = banner.querySelector('[data-banner-element="close"]');
    const isDismissable = !!banner.querySelector('[data-banner-element="dismissable-controller"]');

    const isWithinNavbar = !!banner.closest('.navbar_wrap');

    const bannerId = banner.dataset.bannerId || 'default';
    const location = banner.dataset.bannerLocation || 'default';

    const sessionKey = `banner-dismissed:${bannerId}:${location}`;

    // Hide banner if already dismissed in this session
    if (sessionStorage.getItem(sessionKey) === 'true') {
      removeBanner(banner, sessionKey, isWithinNavbar);
      return;
    }

    if (closeButton instanceof HTMLElement && isDismissable) {
      closeButton.addEventListener('click', () => {
        removeBanner(banner, sessionKey, isWithinNavbar);
      });
    }

    if (isWithinNavbar) {
      const navbar = banner.closest('.navbar_wrap');
      if (navbar) {
        navbar.classList.add('is-banner');
      }
    }
  });
});

function removeBanner(banner: HTMLElement, sessionKey: string, isWithinNavbar: boolean) {
  if (isWithinNavbar) {
    const navbar = banner.closest('.navbar_wrap');
    if (navbar) navbar.classList.remove('is-banner');
  }

  banner.remove();
  sessionStorage.setItem(sessionKey, 'true');
}
