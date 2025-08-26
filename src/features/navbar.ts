import { autoUpdate, computePosition, shift } from '@floating-ui/dom';

import { queryExcludeNested } from '$utils/query';

// Global state to prevent multiple ScrollTrigger instances
let globalScrollTrigger: unknown = null;

function init() {
  document.addEventListener('DOMContentLoaded', () => {
    queryExcludeNested('.navbar_wrap', '.u-component-classes').forEach((navbarWrap) => {
      if (navbarWrap.dataset.scriptInitialized) return;
      navbarWrap.dataset.scriptInitialized = 'true';

      configureScrollTrigger();
      configureFloatingDropdowns(navbarWrap);
      setInitialBannerState(navbarWrap);
    });
  });
}

function setInitialBannerState(navbarWrap: HTMLElement) {
  const banner = navbarWrap.querySelector('.navbar_banner_wrap [data-banner-id]');
  if (banner) {
    navbarWrap.classList.add('is-banner');
  }
}

function configureScrollTrigger() {
  // Only create one global ScrollTrigger instance
  if (!globalScrollTrigger) {
    // @ts-expect-error - GSAP is loaded in Webflow
    globalScrollTrigger = ScrollTrigger.create({
      trigger: 'body',
      start: '50px top',
      onEnter: () => {
        // Update all navbar instances
        document.querySelectorAll('.navbar_wrap').forEach((nav) => {
          nav.classList.add('is-scrolled-down');
        });
      },
      onLeaveBack: () => {
        // Update all navbar instances
        document.querySelectorAll('.navbar_wrap').forEach((nav) => {
          nav.classList.remove('is-scrolled-down');
        });
      },
    });
  }
}

function configureFloatingDropdowns(navbarWrap: HTMLElement) {
  const megaDropdowns = navbarWrap.querySelectorAll('.ndd_mega_wrap') as NodeListOf<HTMLElement>;
  const cleanupFunctions = new Map<HTMLElement, () => void>();
  let observer: MutationObserver | null = null;
  let resizeTimeout: number | null = null;

  const isDesktop = () => window.innerWidth >= 992;

  const setupFloatingDropdowns = () => {
    // Clean up existing observer and functions
    if (observer) {
      observer.disconnect();
      cleanupFunctions.forEach((cleanup) => cleanup());
      cleanupFunctions.clear();
      observer = null;
    }

    // Only set up floating dropdowns on desktop
    if (!isDesktop()) return;

    observer = new MutationObserver((mutationList) => {
      // Process all mutations in the batch
      for (const mutation of mutationList) {
        if (mutation.type !== 'attributes') continue;

        const content = mutation.target as HTMLElement;
        const toggle = content.previousSibling as HTMLElement;

        if (!(content instanceof HTMLElement) || !(toggle instanceof HTMLElement)) continue;

        // Clean up existing autoUpdate for this dropdown
        const existingCleanup = cleanupFunctions.get(content);
        if (existingCleanup) {
          existingCleanup();
          cleanupFunctions.delete(content);
        }

        // Only set up new autoUpdate if dropdown is open
        if (content.classList.contains('w--open')) {
          const cleanup = autoUpdate(toggle, content, () => setDropdownPosition(toggle, content));
          cleanupFunctions.set(content, cleanup);
        }
      }
    });

    megaDropdowns.forEach((dropdown) => {
      const toggle = dropdown.firstChild as HTMLElement;
      const content = dropdown.lastChild as HTMLElement;

      if (!(toggle instanceof HTMLElement) || !(content instanceof HTMLElement)) return;

      observer!.observe(content, {
        attributes: true,
        childList: false,
        subtree: false,
      });
    });
  };

  // Handle window resize with debouncing
  const handleResize = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = window.setTimeout(() => {
      setupFloatingDropdowns();
    }, 250); // Debounce resize events
  };

  // Initial setup
  setupFloatingDropdowns();

  // Listen for resize events
  window.addEventListener('resize', handleResize);

  // Cleanup function to be called when component is destroyed
  navbarWrap.addEventListener('remove', () => {
    if (observer) {
      observer.disconnect();
    }
    cleanupFunctions.forEach((cleanup) => cleanup());
    cleanupFunctions.clear();
    window.removeEventListener('resize', handleResize);
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
  });
}

function setDropdownPosition(toggle: HTMLElement, content: HTMLElement) {
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
  })
    .then(({ x, y }) => {
      Object.assign(content.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    })
    .catch((error) => {
      console.error('Error computing dropdown position:', error);
    });
}

export default init;
