import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll<HTMLElement>('.switcher_main_wrap').forEach((wrapper) => {
    if (wrapper.dataset.scriptInitialized === 'true') return;
    wrapper.dataset.scriptInitialized = 'true';
    wrapper.classList.remove('is-builder');

    // Animate wrapper on entry
    gsap.from(wrapper, {
      autoAlpha: 0,
      y: 50,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: wrapper,
        start: 'top 70%',
        once: false,
      },
    });

    const rail = wrapper.querySelector<HTMLElement>('.switcher_main_rail');
    if (!rail) {
      setInvalid(wrapper);
      return;
    }

    const menu = rail.querySelector<HTMLElement>('.switcher_main_menu');
    const menuItems = rail.querySelectorAll<HTMLElement>('.switcher_main_menu_item');
    const sectionsSticky = rail.querySelector<HTMLElement>('.switcher_main_sections_sticky');
    const sectionItems = rail.querySelectorAll<HTMLElement>('.switcher_main_section');

    if (
      !menu ||
      !sectionsSticky ||
      sectionItems.length === 0 ||
      menuItems.length !== sectionItems.length
    ) {
      setInvalid(wrapper);
      return;
    }

    // Ensure each section has an ID
    sectionItems.forEach((section, i) => {
      if (!section.id) section.id = `switcher-main-section-${i + 1}`;
    });

    // Adjust sticky spacer height
    const lastSection = sectionItems[sectionItems.length - 1];
    const updateStickyHeight = () => {
      sectionsSticky.style.height = `${lastSection.offsetHeight}px`;
    };
    updateStickyHeight();
    window.addEventListener('resize', () => {
      updateStickyHeight();
      rebuildTriggers();
    });

    let triggers: HTMLElement[] = [];
    const buildTriggers = () => {
      triggers.forEach((t) => t.remove());
      triggers = [];
      const itemHeight = rail.clientHeight / sectionItems.length;
      sectionItems.forEach((_, i) => {
        const triggerEl = document.createElement('div');
        Object.assign(triggerEl.style, {
          position: 'absolute',
          top: `${itemHeight * i}px`,
          height: `${itemHeight}px`,
          width: '1px',
          right: '0',
        });
        rail.appendChild(triggerEl);
        triggers.push(triggerEl);
      });
    };

    const rebuildTriggers = () => {
      buildTriggers();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      initScrollTriggers();
    };

    const activateItem = (index: number) => {
      menuItems.forEach((item, idx) => {
        item.classList.toggle('is-active', idx === index);
      });

      sectionItems.forEach((section, idx) => {
        gsap.killTweensOf(section);
        if (idx === index) {
          gsap.to(section, {
            autoAlpha: 1,
            yPercent: 0,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto',
            pointerEvents: 'auto',
            zIndex: 2,
            delay: 0.2,
          });
        } else {
          gsap.to(section, {
            autoAlpha: 0,
            yPercent: 20,
            duration: 0.2,
            ease: 'power2.in',
            overwrite: 'auto',
            pointerEvents: 'none',
            zIndex: 1,
          });
        }
      });
    };

    const initScrollTriggers = () => {
      triggers.forEach((trigger, i) => {
        ScrollTrigger.create({
          trigger,
          start: 'top center',
          end: 'bottom center',
          markers: false,
          onToggle: (self) => self.isActive && activateItem(i),
        });
      });
    };

    const setupMenuClicks = () => {
      menuItems.forEach((item, i) => {
        const button = item.querySelector<HTMLButtonElement>('button');
        const target = triggers[i];
        if (!button || !target) return;
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const offsetY = window.innerHeight * 0.4;
          gsap.to(window, {
            scrollTo: { y: target, offsetY },
            duration: 1,
            ease: 'back.inOut',
          });
        });
      });
    };

    buildTriggers();
    menu.classList.add('is-active');
    // initialize sections
    sectionItems.forEach((sec, idx) => {
      gsap.set(sec, { autoAlpha: idx === 0 ? 1 : 0, yPercent: idx === 0 ? 0 : 20 });
    });
    activateItem(0);
    initScrollTriggers();
    setupMenuClicks();
  });
});

function setInvalid(wrapper: HTMLElement) {
  wrapper.classList.add('is-invalid');
}
