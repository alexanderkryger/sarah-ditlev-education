/**
 * <count-up value="150" duration="1500">
 *   <span class="stats-counter__number">150</span>
 * </count-up>
 *
 * Counts the inner number from 0 to "value" the first time the element enters the viewport.
 * Respects prefers-reduced-motion by rendering the final value immediately.
 */
class CountUp extends HTMLElement {
  connectedCallback() {
    this.numberElement = this.querySelector('.stats-counter__number');
    this.targetValue = Number.parseFloat(this.getAttribute('value')) || 0;
    this.duration = Number.parseInt(this.getAttribute('duration'), 10) || 1500;

    if (!this.numberElement) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      this.#render(this.targetValue);
      return;
    }

    this.#render(0);

    this.observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        this.observer.disconnect();
        this.#animate();
      }
    }, { threshold: 0.4 });

    this.observer.observe(this);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  #animate() {
    const start = performance.now();
    const decimals = this.#decimalsOf(this.targetValue);

    const step = (now) => {
      const progress = Math.min((now - start) / this.duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      this.#render(this.targetValue * eased, decimals);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.#render(this.targetValue, decimals);
      }
    };

    requestAnimationFrame(step);
  }

  #render(value, decimals = this.#decimalsOf(this.targetValue)) {
    this.numberElement.textContent = value.toLocaleString(document.documentElement.lang || 'da', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  #decimalsOf(value) {
    const text = String(value);
    return text.includes('.') ? text.split('.')[1].length : 0;
  }
}

if (!window.customElements.get('count-up')) {
  window.customElements.define('count-up', CountUp);
}
