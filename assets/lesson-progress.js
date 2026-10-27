/**
 * <lesson-complete-button>
 *
 * Marks the current lesson as completed for the logged-in customer by posting the article ID
 * to the app proxy endpoint, then redirects to the next lesson (or reloads if it was the last one).
 *
 * Attributes:
 *   article-id  - the Shopify article ID of the current lesson
 *   proxy-url   - the app proxy path, e.g. /apps/kursus/complete
 *   next-url    - optional URL of the next lesson
 */
class LessonCompleteButton extends HTMLElement {
  #abortController = new AbortController();

  connectedCallback() {
    this.button = this.querySelector('button');
    this.errorMessage = this.querySelector('[data-error]');

    this.button?.addEventListener('click', this.#onClick.bind(this), { signal: this.#abortController.signal });
  }

  disconnectedCallback() {
    this.#abortController.abort();
  }

  async #onClick(event) {
    event.preventDefault();

    if (!this.button || this.button.hasAttribute('disabled')) {
      return;
    }

    this.button.setAttribute('disabled', '');
    this.button.setAttribute('aria-busy', 'true');
    this.errorMessage?.setAttribute('hidden', '');

    try {
      const response = await fetch(this.getAttribute('proxy-url'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ article_id: this.getAttribute('article-id') })
      });

      if (!response.ok) {
        throw new Error(`Lesson completion failed with status ${response.status}`);
      }

      this.#markLessonCompleted();

      const nextUrl = this.getAttribute('next-url');

      if (nextUrl) {
        window.location.assign(nextUrl);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);

      this.button.removeAttribute('disabled');
      this.button.removeAttribute('aria-busy');
      this.errorMessage?.removeAttribute('hidden');
    }
  }

  #markLessonCompleted() {
    const articleId = this.getAttribute('article-id');

    document.querySelectorAll(`[data-lesson-id="${articleId}"]`).forEach((item) => {
      item.classList.add('article-lessons__item--completed');
    });
  }
}

if (!window.customElements.get('lesson-complete-button')) {
  window.customElements.define('lesson-complete-button', LessonCompleteButton);
}
