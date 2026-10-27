/**
 * <scroll-indicator>
 *
 * On click, scrolls smoothly to the next Shopify section, keeping the sticky header clear.
 */
class ScrollIndicator extends HTMLElement {
  #abortController = new AbortController();

  connectedCallback() {
    this.querySelector('button')?.addEventListener('click', this.#onClick.bind(this), { signal: this.#abortController.signal });
  }

  disconnectedCallback() {
    this.#abortController.abort();
  }

  #onClick() {
    const section = this.closest('.shopify-section');
    const next = section?.nextElementSibling;

    if (!next) {
      return;
    }

    const stickyOffset = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sticky-area-height')) || 0;
    const top = next.getBoundingClientRect().top + window.scrollY - stickyOffset;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
  }
}

if (!window.customElements.get('scroll-indicator')) {
  window.customElements.define('scroll-indicator', ScrollIndicator);
}
