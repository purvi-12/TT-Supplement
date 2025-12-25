(() => {
  class InfiniteScroll {
    constructor(container) {
      console.log("inside js");
      this.container = container;
      this.sectionId = container.dataset.sectionId;
      this.grid = container.querySelector('#product-grid');
      this.sentinel = container.querySelector('[data-infinite-scroll]');
      this.loader = container.querySelector('#InfiniteScrollLoader');

      this.loading = false;
      this.page = this.getCurrentPage();
      this.reachedEnd = false;

      if (!this.sectionId || !this.grid || !this.sentinel) return;

      this.observer = new IntersectionObserver(
        this.onIntersect.bind(this),
        {
          rootMargin: '600px',
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
      if (!entries[0].isIntersecting || this.loading || this.reachedEnd) return;

      this.loading = true;
      this.showLoader();

      const nextPage = this.page + 1;
      const url = new URL(window.location.href);

      url.searchParams.set('page', nextPage);
      url.searchParams.set('section_id', this.sectionId);

      try {
        const response = await fetch(url.toString(), {
          credentials: 'same-origin'
        });

        if (!response.ok) throw new Error('Network error');

        const htmlText = await response.text();
        const doc = new DOMParser().parseFromString(htmlText, 'text/html');

        const newGrid = doc.querySelector('#product-grid');
        const newItems = newGrid ? newGrid.querySelectorAll('li') : [];

        if (newItems.length === 0) {
          this.finish();
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

    finish() {
      this.reachedEnd = true;
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
      btn.type = 'button';
      btn.textContent = '↑ Back to top';
      btn.className = 'scroll-to-top';

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      document.body.appendChild(btn);
    }
  }

  const initInfiniteScroll = () => {
    document
      .querySelectorAll('#ProductGridContainer[data-section-id]')
      .forEach(container => {
        if (container.querySelector('[data-infinite-scroll]')) {
          new InfiniteScroll(container);
        }
      });
  };

  document.addEventListener('DOMContentLoaded', initInfiniteScroll);
  document.addEventListener('shopify:section:load', initInfiniteScroll);
})();
