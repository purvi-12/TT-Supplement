// tt018 : Replace pagination with infinite scroll code
(() => {
  class InfiniteScroll {
    constructor(section) {
      this.section = section;
      this.grid = section.querySelector('#ProductGridContainer');
      this.sentinel = section.querySelector('[data-infinite-scroll]');
      this.loader = section.querySelector('#InfiniteScrollLoader');

      this.loading = false;
      this.nextPageUrl = this.getNextPageUrl();

      if (!this.grid || !this.sentinel || !this.nextPageUrl) return;

      this.observer = new IntersectionObserver(
        this.handleIntersect.bind(this),
        {
          root: null,
          rootMargin: '400px', // preload before user reaches bottom
          threshold: 0.1
        }
      );

      this.observer.observe(this.sentinel);
    }

    getNextPageUrl() {
      const nextLink = this.section.querySelector('.pagination__next');
      return nextLink ? nextLink.href : null;
    }

    async handleIntersect(entries) {
      const entry = entries[0];

      if (!entry.isIntersecting || this.loading || !this.nextPageUrl) return;

      this.loading = true;
      this.showLoader();

      try {
        const response = await fetch(this.nextPageUrl, {
          credentials: 'same-origin'
        });

        if (!response.ok) throw new Error('Network error');

        const htmlText = await response.text();
        const doc = new DOMParser().parseFromString(htmlText, 'text/html');

        const newItems = doc.querySelectorAll(
          '#ProductGridContainer .grid__item'
        );

        newItems.forEach(item => {
          this.grid.appendChild(item);
        });

        this.nextPageUrl = this.extractNextPageUrl(doc);

        if (!this.nextPageUrl) {
          this.observer.disconnect();
        }
      } catch (error) {
        console.error('[InfiniteScroll] Failed:', error);
      } finally {
        this.hideLoader();
        this.loading = false;
      }
    }

    extractNextPageUrl(doc) {
      const nextLink = doc.querySelector('.pagination__next');
      return nextLink ? nextLink.href : null;
    }

    showLoader() {
      if (this.loader) this.loader.hidden = false;
    }

    hideLoader() {
      if (this.loader) this.loader.hidden = true;
    }
  }

  const initInfiniteScroll = () => {
    document
      .querySelectorAll('[data-section-type="main-collection-product-grid"]')
      .forEach(section => {
        if (section.querySelector('[data-infinite-scroll]')) {
          new InfiniteScroll(section);
        }
      });
  };

  document.addEventListener('DOMContentLoaded', initInfiniteScroll);
  document.addEventListener('shopify:section:load', initInfiniteScroll);
})();
