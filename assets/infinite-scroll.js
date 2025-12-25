const initCollectionFeatures = () => {
  const container = document.querySelector('#ProductGridContainer');
  const backToTopBtn = document.querySelector('#BackToTop');
  
  if (!container) return;

  // --- 1. Infinite Scroll Logic ---
  const isInfiniteEnabled = container.dataset.infiniteScroll === 'true';
  const grid = document.querySelector('#product-grid');
  let trigger = document.querySelector('#infinite-scroll-trigger');
  let loading = false;

  if (isInfiniteEnabled && trigger) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !loading) {
          loadMore();
        }
      });
    }, { rootMargin: '0px 0px 600px 0px' }); // Pre-loads products 600px before bottom

    observer.observe(trigger);

    async function loadMore() {
      const nextUrl = trigger.dataset.nextUrl;
      if (!nextUrl || loading) return;

      loading = true;
      const loader = trigger.querySelector('.infinite-scroll-loader');
      if (loader) loader.style.display = 'flex';

      try {
        const response = await fetch(nextUrl);
        const text = await response.text();
        const html = new DOMParser().parseFromString(text, 'text/html');
        
        const newProducts = html.querySelectorAll('#product-grid > li');
        const nextPagination = html.querySelector('#infinite-scroll-trigger');

        // Append new items to the grid
        newProducts.forEach(li => grid.appendChild(li));
        
        // Update browser URL for SEO and sharing
        window.history.replaceState({}, '', nextUrl);

        if (nextPagination && nextPagination.dataset.nextUrl) {
          trigger.dataset.nextUrl = nextPagination.dataset.nextUrl;
          loading = false;
        } else {
          trigger.remove(); // No more products to load
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        if (loader) loader.style.display = 'none';
      }
    }
  }

  // --- 2. Back to Top Logic ---
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
};

// Run on initial load
document.addEventListener('DOMContentLoaded', initCollectionFeatures);

// Run when the section is re-rendered in the Theme Editor
document.addEventListener('shopify:section:load', initCollectionFeatures);