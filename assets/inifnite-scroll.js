(() => {
  class InfiniteScroll {
    constructor(section) {
      this.section = section;
      this.grid = section.querySelector('#ProductGridContainer');
      this.sentinel = section.querySelector('[data-infinite-scroll]');
      this.loader = section.querySelector('#InfiniteScrollLoader');

      this.loading = false;
      this.page = this.getCurrentPage();

      if (!this.grid || !this.sentinel) return;

      this.observer = new IntersectionObserver(
        this.onIntersect.bind(this),
        {
          rootMargin: '500px', // preload before user hits bottom
          threshold: 0.1
        }
      );

      this.observer.observe(this.sentinel);
    }

    getCurrentPage() {
      const params = new URLSearchParams(window.location.search);
      return parseInt(params.get('page') || '1', 10);
    }

    async onIntersect(entries) {
      const entry = entries[0];
      if (!entry.isIntersecting || this.loading) return;

      this.loading = true;
      this.showLoader();

      const nextPage = this.page + 1;
      const url = new URL(window.location.href);
      url.searchParams.set('page', nextPage);

      try {
        const response = await fetch(url.toString(), {
          credentials: 'same-origin'
        });

        if (!response.ok) throw new Error('Network error');

        const text = await response.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');

        const newItems = doc.querySelectorAll(
          '#ProductGridContainer .grid__item'
        );

        if (newItems.length === 0) {
          // No more products → stop observing
          this.observer.disconnect();
          this.hideLoader();
          return;
        }

        newItems.forEach(item => {
          this.grid.appendChild(item);
        });

        this.page = nextPage;
      } catch (error) {
        console.error('[InfiniteScroll]', error);
      } finally {
        this.hideLoader();
        this.loading = false;
      }
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
