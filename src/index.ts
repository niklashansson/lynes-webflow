import { default as initBanner } from './features/banner';
import { default as initNavbar } from './features/navbar';
import { default as initScroller } from './features/scroller';

function initializeFeatures() {
  const features = [
    { name: 'Banner', init: initBanner },
    { name: 'Navbar', init: initNavbar },
    { name: 'Scroller', init: initScroller },
  ];

  const initializedFeatures = new Set<string>();

  features.forEach(({ name, init }) => {
    if (initializedFeatures.has(name)) {
      //   console.warn(`${name} already initialized, skipping...`);
      return;
    }

    try {
      init();
      initializedFeatures.add(name);
      //   console.log(`✅ ${name} initialized successfully`);
    } catch (error) {
      console.error(`❌ Failed to initialize ${name}:`, error);
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFeatures);
} else {
  initializeFeatures();
}
