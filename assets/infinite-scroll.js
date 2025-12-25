(() => {
  class InfiniteScroll {
    constructor(container) {
      this.container = container;
      this.grid = container.querySelector('#product-grid');
      this.sentinel = container.querySelector('[data-infinite-scroll]');
      this.loader = container.querySelector('#InfiniteScrollLoader');

      this.page = 1;
      this.loading = false;
      this.done = false;

      if (!this.grid || !this.sentinel) return;

      this.observer = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            this.loadNextPage();
          }
        },
        { rootMargin: '600px' }
      );

      this.observer.observe(this.sentinel);
    }

    async loadNextPage() {
      if (this.loading || this.done) return;

      this.loading = true;
      this.showLoader();

      const nextPage = this.page + 1;

      const url = new URL(window.location.pathname, window.location.origin);
      url.search = window.location.search;
      url.searchParams.set('page', nextPage);
      url.searchParams.set('sections', 'main-collection-product-grid');

      try {
        const res = await fetch(url.toString(), {
          credentials: 'same-origin'
        });

        if (!res.ok) throw new Error('Network error');

        const json = await res.json();
        const html = json['main-collection-product-grid'];

        if (!html) {
          this.finish();
          return;
        }

        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newGrid = doc.querySelector('#product-grid');
        const items = newGrid ? newGrid.querySelectorAll('li') : [];

        if (!items.length) {
          this.finish();
          return;
        }

        items.forEach(item => this.grid.appendChild(item));
        this.page = nextPage;
      } catch (err) {
        console.error('[InfiniteScroll]', err);
      } finally {
        this.hideLoader();
        this.loading = false;
      }
    }

    finish() {
      this.done = true;
      this.observer.disconnect();
      this.hideLoader();
      this.addScrollToTop();
    }

    showLoader() {
      if (this.loader) this.loader.hidden = false;
    }

    hideLoader() {
      if (this.loader) this.loader.hidden = true;
    }

    addScrollToTop() {
      if (document.getElementById('ScrollToTop')) return;

      const btn = document.createElement('button');
      btn.id = 'ScrollToTop';
      btn.className = 'scroll-to-top';
      btn.textContent = '↑ Back to top';

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      document.body.appendChild(btn);
    }
  }

  const init = () => {
    document
      .querySelectorAll('#ProductGridContainer')
      .forEach(container => {
        if (container.querySelector('[data-infinite-scroll]')) {
          new InfiniteScroll(container);
        }
      });
  };

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('shopify:section:load', init);
})();
