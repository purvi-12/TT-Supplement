(() => {
  class InfiniteScroll {
    constructor(section) {
      this.section = section;
      this.grid = section.querySelector('#product-grid');
      this.sentinel = section.querySelector('[data-infinite-scroll]');
      this.loader = section.querySelector('#InfiniteScrollLoader');

      this.loading = false;
      this.page = this.getCurrentPage();

      if (!this.grid || !this.sentinel) return;

      this.observer = new IntersectionObserver(
        this.onIntersect.bind(this),
        {
          root: null,
          rootMargin: '500px', // preload before bottom
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
      if (!entries[0].isIntersecting || this.loading) return;

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

        const htmlText = await response.text();
        const doc = new DOMParser().parseFromString(htmlText, 'text/html');

        const newGrid = doc.querySelector('#product-grid');
        const newItems = newGrid ? newGrid.children : [];

        if (!newItems || newItems.length === 0) {
          this.stop();
          return;
        }

        Array.from(newItems).forEach(item => {
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

    stop() {
      this.observer.disconnect();
      this.hideLoader();
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
      .querySelectorAll('.product-grid-container')
      .forEach(container => {
        if (container.querySelector('[data-infinite-scroll]')) {
          new InfiniteScroll(container);
        }
      });
  };

  document.addEventListener('DOMContentLoaded', initInfiniteScroll);
  document.addEventListener('shopify:section:load', initInfiniteScroll);
})();
