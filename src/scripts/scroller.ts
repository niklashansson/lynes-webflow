import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { queryExcludeNested } from '$utils/query';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

type Item = {
  itemEl: HTMLElement;
  menuItemEl: HTMLElement;
  menuItemParentEl: HTMLElement;
  visualItemEl: HTMLElement;
  visualItemParentEl: HTMLElement;
  contentItemEl: HTMLElement;
  contentItemParentEl: HTMLElement;
};

document.addEventListener('DOMContentLoaded', () => {
  queryExcludeNested('[data-scroller-element=instance]', '.u-component-classes').forEach(
    (scrollerInstance) => {
      if (scrollerInstance.dataset.scriptInitialized) return;
      scrollerInstance.dataset.scriptInitialized = 'true';

      let scrollTriggers: ScrollTrigger[] = [];

      // ─────────────────────────────────────────────────────────────
      // 1. Collect references we’ll need later
      // ─────────────────────────────────────────────────────────────
      const { desktopEl, desktopMenuItemsEl, desktopVisualItemsEl, desktopContentItemsEl } =
        getDesktopElements(scrollerInstance);

      if (
        !(desktopEl instanceof HTMLElement) ||
        !(desktopMenuItemsEl instanceof HTMLElement) ||
        !(desktopVisualItemsEl instanceof HTMLElement) ||
        !(desktopContentItemsEl instanceof HTMLElement)
      ) {
        setEmptyState(scrollerInstance, true);
        return;
      }

      const itemElements = scrollerInstance.querySelectorAll('[data-scroller-element=item]');
      if (!itemElements.length) {
        setEmptyState(scrollerInstance, true);
        return;
      }

      const items = getItems(itemElements);

      // ─────────────────────────────────────────────────────────────
      // 2. Desktop / mobile layout switching
      //    • ≤ 992 px  → “desktop”  (per requirement)
      //    • > 992 px  → “mobile”
      // ─────────────────────────────────────────────────────────────
      const mql = window.matchMedia('(max-width: 992px)');
      let isDesktop = null as boolean | null; // track current state so we don’t thrash

      function handleResize(ev?: MediaQueryListEvent | MediaQueryList) {
        if (ev ? ev.matches : mql.matches) {
          toMobile(); // ≤ 992 px
        } else {
          toDesktop(); // > 992 px
        }
      }

      // run immediately, then on every resize
      handleResize(mql);
      mql.addEventListener('change', handleResize);

      // ─────────────────────────────────────────────────────────────
      // 3. ScrollTrigger, click-scroll, “is-active” classes
      // ─────────────────────────────────────────────────────────────
      /** Destroy all ScrollTriggers created for this instance */
      function killScrollTriggers() {
        scrollTriggers.forEach((t) => t.kill());
        scrollTriggers = [];
      }

      /** Build ScrollTriggers & click handlers for every section */
      function initDesktopScroll() {
        killScrollTriggers(); // safety when toggling from mobile→desktop
        clearActive();

        /* helper: remove all active classes first */
        function clearActive() {
          items.forEach(({ menuItemEl, visualItemEl, contentItemEl }) => {
            menuItemEl.classList.remove('is-active');
            visualItemEl.classList.remove('is-active');
            contentItemEl.classList.remove('is-active');
          });
        }

        scrollTriggers = items.map((item) => {
          /* — click-to-scroll — */
          const button = item.menuItemEl.querySelector(
            '[data-scroller-element=menu-item-button]'
          ) as HTMLElement | null;

          if (button && !button.dataset.scrollInit) {
            button.dataset.scrollInit = 'true'; // avoid double listeners
            button.addEventListener('click', (e) => {
              e.preventDefault();
              gsap.to(window, {
                duration: 1,
                ease: 'power2.out',
                scrollTo: { y: item.contentItemEl, offsetY: 0 },
              });
            });
          }

          /* — active-state trigger — */
          return ScrollTrigger.create({
            trigger: item.contentItemEl,
            start: 'top center',
            end: 'bottom center',
            toggleClass: {
              targets: [item.contentItemEl, item.visualItemEl, item.menuItemEl],
              className: 'is-active',
            },
            onEnter: () => {
              clearActive();
              item.menuItemEl.classList.add('is-active');
              item.contentItemEl.classList.add('is-active');
              item.visualItemEl.classList.add('is-active');
            },
            onEnterBack: () => {
              clearActive();
              item.menuItemEl.classList.add('is-active');
              item.contentItemEl.classList.add('is-active');
              item.visualItemEl.classList.add('is-active');
            },
          });
        });

        ScrollTrigger.refresh(); // ensure posi tions are correct
      }

      function toDesktop() {
        if (isDesktop) return;
        isDesktop = true;
        setDesktopState(scrollerInstance, true);

        clearDesktopItems(desktopEl);
        items.forEach(({ menuItemEl, visualItemEl, contentItemEl }) => {
          desktopMenuItemsEl?.appendChild(menuItemEl);
          desktopVisualItemsEl?.appendChild(visualItemEl);
          desktopContentItemsEl?.appendChild(contentItemEl);
        });

        initDesktopScroll(); // ← build ScrollTriggers
      }

      function toMobile() {
        if (isDesktop === false) return;
        isDesktop = false;
        setDesktopState(scrollerInstance, false);

        items.forEach(
          ({
            menuItemEl,
            menuItemParentEl,
            visualItemEl,
            visualItemParentEl,
            contentItemEl,
            contentItemParentEl,
          }) => {
            menuItemParentEl.appendChild(menuItemEl);
            visualItemParentEl.appendChild(visualItemEl);
            contentItemParentEl.appendChild(contentItemEl);
          }
        );

        clearDesktopItems(desktopEl);

        /* kill ScrollTriggers so nothing fires on mobile */
        killScrollTriggers();
        ScrollTrigger.refresh();
      }
    }
  );
});

function getItems(itemElements: NodeListOf<Element>): Item[] {
  const items: Item[] = [];

  itemElements.forEach((itemEl) => {
    const menuItemEl = itemEl.querySelector('[data-scroller-element=menu-item]');
    const menuItemParentEl = menuItemEl?.parentElement;

    const visualItemEl = itemEl.querySelector('[data-scroller-element=visual-item]');
    const visualItemParentEl = visualItemEl?.parentElement;

    const contentItemEl = itemEl.querySelector('[data-scroller-element=content-item]');
    const contentItemParentEl = contentItemEl?.parentElement;

    if (
      !(itemEl instanceof HTMLElement) ||
      !(menuItemEl instanceof HTMLElement) ||
      !(visualItemEl instanceof HTMLElement) ||
      !(contentItemEl instanceof HTMLElement) ||
      !(menuItemParentEl instanceof HTMLElement) ||
      !(visualItemParentEl instanceof HTMLElement) ||
      !(contentItemParentEl instanceof HTMLElement)
    )
      return;

    items.push({
      itemEl,
      menuItemEl,
      visualItemEl,
      contentItemEl,
      menuItemParentEl,
      visualItemParentEl,
      contentItemParentEl,
    });
  });

  return items;
}

function clearDesktopItems(desktopEl: Element | null) {
  const visualItems = desktopEl?.querySelectorAll('[data-scroller-element=visual-item]') ?? [];
  const contentItems = desktopEl?.querySelectorAll('[data-scroller-element=content-item]') ?? [];

  visualItems.forEach((item) => item.remove());
  contentItems.forEach((item) => item.remove());
}

function setEmptyState(instanceEl: HTMLElement, empty: boolean) {
  instanceEl.dataset.scrollerEmpty = empty ? 'true' : 'false';
}

function setDesktopState(instanceEl: HTMLElement, desktop: boolean) {
  instanceEl.dataset.scrollerDesktop = desktop ? 'true' : 'false';
}

function getDesktopElements(instanceEl: HTMLElement) {
  const desktopEl = instanceEl.querySelector('[data-scroller-element=desktop]');
  const desktopMenuItemsEl = instanceEl.querySelector('[data-scroller-element=desktop-menu-items]');
  const desktopVisualItemsEl = instanceEl.querySelector(
    '[data-scroller-element=desktop-visual-items]'
  );
  const desktopContentItemsEl = instanceEl.querySelector(
    '[data-scroller-element=desktop-content-items]'
  );

  return {
    desktopEl,
    desktopMenuItemsEl,
    desktopVisualItemsEl,
    desktopContentItemsEl,
  };
}
