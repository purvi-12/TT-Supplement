
  (function() {
    const initInfiniteScroll = () => {
      const container = document.querySelector('#ProductGridContainer');
      if (!container || container.dataset.infiniteScroll !== 'true') return;

      const grid = document.querySelector('#product-grid');
      let trigger = document.querySelector('#infinite-scroll-trigger');
      let loading = false;

      if (!trigger) return;

      const observerOptions = {
        root: null,
        rootMargin: '0px 0px 600px 0px', // Starts loading 600px before reaching bottom
        threshold: 0.01
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !loading) {
            loadMoreProducts();
          }
        });
      }, observerOptions);

      observer.observe(trigger);

      async function loadMoreProducts() {
        const nextUrl = trigger.dataset.nextUrl;
        if (!nextUrl || loading) return;

        loading = true;
        const spinner = trigger.querySelector('.loading-overlay__spinner');
        if (spinner) spinner.style.display = 'block';

        try {
          const response = await fetch(nextUrl);
          const htmlText = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlText, 'text/html');

          const newProducts = doc.querySelectorAll('#product-grid > li');
          const nextPagination = doc.querySelector('#infinite-scroll-trigger');

          // Append products
          newProducts.forEach(prod => grid.appendChild(prod));

          // Update URL (SEO and Refresh friendly)
          window.history.replaceState({}, '', nextUrl);

          // Update trigger for next batch or remove if last page
          if (nextPagination && nextPagination.dataset.nextUrl) {
            trigger.dataset.nextUrl = nextPagination.dataset.nextUrl;
            loading = false;
          } else {
            trigger.remove();
          }
        } catch (e) {
          console.error('Infinite Scroll Error:', e);
        } finally {
          if (spinner) spinner.style.display = 'none';
        }
      }
    };

    // Initialize on load
    initInfiniteScroll();

    // Listen for Shopify Section Load (for Theme Customizer changes)
    document.addEventListener('shopify:section:load', initInfiniteScroll);
  })();
