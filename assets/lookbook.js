document.addEventListener('click', (e) => {
  const section = e.target.closest('[data-lookbook]');
  if (!section) return;

  const pin = e.target.closest('[data-pin]');
  const popupClicked = e.target.closest('.lookbook__popup');
  const imageClicked = e.target.closest('.lookbook__image');

  const allPopups = section.querySelectorAll('.lookbook__popup');
  const allPins = section.querySelectorAll('[data-pin]');

  const closeAll = () => {
    allPopups.forEach(popup => {
      popup.style.display = 'none';
      popup.style.position = '';
      popup.style.top = '';
      popup.style.left = '';
      popup.style.bottom = '';
      popup.style.transform = '';
      popup.style.maxWidth = '';
      popup.style.zIndex = '';
      popup.setAttribute('aria-hidden', 'true');
    });

    allPins.forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
    });
  };

  /* ---------------------------------
     CASE 1: PIN CLICK (TOGGLE)
  --------------------------------- */
  if (pin) {
    const popup = pin.nextElementSibling;
    const isOpen = pin.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      closeAll();
      return;
    }

    closeAll();
    popup.style.display = 'block';

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile) {
      /* ---------- MOBILE: MODAL-LIKE ---------- */
      popup.style.position = 'fixed';
      popup.style.top = '50%';
      popup.style.left = '50%';
      popup.style.bottom = 'auto';
      popup.style.transform = 'translate(-50%, -50%)';
      popup.style.maxWidth = 'calc(100vw - 32px)';
      popup.style.zIndex = '9999';
    } else {
      /* ---------- DESKTOP: SMART TOOLTIP ---------- */
      const pinRect = pin.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();

      let top =
        pinRect.top -
        sectionRect.top -
        popupRect.height -
        10;

      let left =
        pinRect.left -
        sectionRect.left +
        pinRect.width / 2 -
        popupRect.width / 2;

      // Clamp horizontally
      const minLeft = 8;
      const maxLeft = sectionRect.width - popupRect.width - 8;
      left = Math.max(minLeft, Math.min(left, maxLeft));

      // If not enough space above → show below
      if (top < 8) {
        top =
          pinRect.bottom -
          sectionRect.top +
          10;
      }

      popup.style.position = 'absolute';
      popup.style.top = `${top}px`;
      popup.style.left = `${left}px`;
      popup.style.transform = 'none';
      popup.style.zIndex = '20';
    }

    pin.setAttribute('aria-expanded', 'true');
    popup.setAttribute('aria-hidden', 'false');
    return;
  }

  /* ---------------------------------
     CASE 2: CLICK INSIDE POPUP
     → DO NOTHING
  --------------------------------- */
  if (popupClicked) return;

  /* ---------------------------------
     CASE 3: CLICK IMAGE AREA
     → CLOSE POPUP
  --------------------------------- */
  if (imageClicked) {
    closeAll();
  }
});
