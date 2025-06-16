import { computePosition, shift } from '@floating-ui/dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { queryExcludeNested, querySingleExcludeNested } from '$utils/query';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  queryExcludeNested('.navbar_wrap', '.u-component-classes').forEach((navbarWrap) => {
    if (navbarWrap.dataset.scriptInitialized) return;
    navbarWrap.dataset.scriptInitialized = 'true';

    configureFloatingDropdowns(navbarWrap);

    const bannerWrap = querySingleExcludeNested(
      '.navbar_banner_wrap',
      '.u-component-classes',
      navbarWrap
    );

    const bannerInstance = bannerWrap?.querySelector('.banner_main_wrap') as HTMLElement | null;

    const topWrap = querySingleExcludeNested(
      '.navbar_top_wrap',
      '.u-component-classes',
      navbarWrap
    );

    // --- NEW: Observer to refresh ScrollTrigger on dismissal ---
    // This watches the banner for changes and tells ScrollTrigger to update
    // its measurements when the banner is dismissed. This is the key to
    // making the animation work immediately after dismissal.
    if (bannerInstance) {
      const observer = new MutationObserver(() => {
        // When any attribute on the banner changes, we refresh ScrollTrigger.
        // This is a simple but effective way to catch the style/data-attribute
        // change from the dismissal script.
        ScrollTrigger.refresh();
      });

      // Tell the observer to watch for any changes to attributes.
      observer.observe(bannerInstance, { attributes: true });
    }

    // --- Navbar is-scrolled-down class ---
    ScrollTrigger.create({
      trigger: 'body',
      start: '50px top', // When the scroll is 50px from the top
      onEnter: () => navbarWrap.classList.add('is-scrolled-down'),
      onLeaveBack: () => navbarWrap.classList.remove('is-scrolled-down'),
    });

    // --- Hide Navbar on Scroll Timeline ---
    const hideNavTimeline = gsap.timeline({
      paused: true,
      defaults: { duration: 0.3, ease: 'power2.inOut' },
    });

    // --- Animate the main wrapper ---
    // We only animate the main navbar wrapper.
    if (bannerWrap || topWrap) {
      hideNavTimeline.to(
        navbarWrap,
        {
          y: () => {
            // This function robustly checks for dismissal, either from a click
            // (data-banner-dismissed="true") or from the session (style.display = "none").
            const isBannerDismissed =
              (bannerInstance && bannerInstance.dataset.bannerDismissed === 'true') ||
              (bannerInstance && bannerInstance.style.display === 'none');

            // If the banner is dismissed, its height contribution is 0.
            const bannerCurrentHeight =
              !bannerWrap || isBannerDismissed ? 0 : bannerWrap.scrollHeight;

            const topWrapCurrentHeight = topWrap ? topWrap.scrollHeight : 0;

            // The total distance to move is the sum of the visible components.
            return -(bannerCurrentHeight + topWrapCurrentHeight);
          },
        },
        0 // Position this animation at the start of the timeline
      );
    }

    // Only create the ScrollTrigger if the timeline actually has animations.
    if (hideNavTimeline.getChildren().length > 0) {
      ScrollTrigger.create({
        trigger: 'body',
        start: '600px top',
        animation: hideNavTimeline,
        onEnter: () => hideNavTimeline.play(),
        onLeaveBack: () => hideNavTimeline.reverse(),
        invalidateOnRefresh: true,
      });
    }
  });
});

function configureFloatingDropdowns(rootElement: HTMLElement) {
  const megaDropdowns = rootElement.querySelectorAll('.ndd_mega_wrap') as NodeListOf<HTMLElement>;
  // console.log(`Found ${megaDropdowns.length} total dropdown wrappers.`);

  megaDropdowns.forEach((megaDropdown, index) => {
    const trigger = megaDropdown.querySelector('.ndd_toggle') as HTMLElement | null;
    const content = megaDropdown.querySelector('.ndd_mega_content_wrap') as HTMLElement | null;

    // This check is the most likely point of failure
    if (trigger && content) {
      // console.log(`✅ Observer attached to dropdown #${index + 1}.`);

      let prevState = content.classList.contains('w--open');
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const currentState = content.classList.contains('w--open');
            if (prevState !== currentState) {
              prevState = currentState;

              if (currentState) {
                // console.log(`🚀 Positioning open dropdown #${index + 1}.`);
                computePosition(trigger, content, {
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
          }
        });
      });

      observer.observe(content, {
        attributes: true,
        attributeFilter: ['class'],
      });
    } else {
      // If a dropdown fails, this message will appear
      console.error(`❌ Failed to find trigger or content for dropdown #${index + 1}.`, {
        wrapper: megaDropdown,
        triggerFound: trigger,
        contentFound: content,
      });
    }
  });
}
