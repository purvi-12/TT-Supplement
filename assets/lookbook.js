document.addEventListener('click', (e) => {
  const section = e.target.closest('[data-lookbook]');
  if (!section) return;

  const pin = e.target.closest('[data-pin]');
  const popupClicked = e.target.closest('.lookbook__popup');
  const imageClicked = e.target.closest('.lookbook__image');

  const allPopups = section.querySelectorAll('.lookbook__popup');
  const allPins = section.querySelectorAll('[data-pin]');

  const closeAll = () => {
    allPopups.forEach(p => {
      p.style.display = 'none';
      p.style.top = '';
      p.style.left = '';
      p.style.bottom = '';
      p.style.transform = '';
      p.setAttribute('aria-hidden', 'true');
    });
    allPins.forEach(b => {
      b.setAttribute('aria-expanded', 'false');
    });
  };

  /* ----------------------------
     CASE 1: PIN CLICK (TOGGLE)
  ---------------------------- */
  if (pin) {
    const targetPopup = pin.nextElementSibling;
    const isOpen = pin.getAttribute('aria-expanded') === 'true';

    // Toggle off if same pin clicked
    if (isOpen) {
      closeAll();
      return;
    }

    closeAll();
    targetPopup.style.display = 'block';

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile) {
      /* ---------- MOBILE SAFE ---------- */
      targetPopup.style.position = 'fixed';
      targetPopup.style.left = '50%';
      targetPopup.style.bottom = '16px';
      targetPopup.style.top = 'auto';
      targetPopup.style.transform = 'translateX(-50%)';
      targetPopup.style.maxWidth = 'calc(100vw - 32px)';
    } else {
      /* ---------- DESKTOP SAFE ---------- */
      const pinRect = pin.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const popupRect = targetPopup.getBoundingClientRect();

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

      targetPopup.style.position = 'absolute';
      targetPopup.style.top = `${top}px`;
      targetPopup.style.left = `${left}px`;
      targetPopup.style.transform = 'none';
    }

    pin.setAttribute('aria-expanded', 'true');
    targetPopup.setAttribute('aria-hidden', 'false');
    return;
  }

  /* ----------------------------
     CASE 2: CLICK INSIDE POPUP
     → DO NOTHING
  ---------------------------- */
  if (popupClicked) return;

  /* ----------------------------
     CASE 3: CLICK IMAGE AREA
     → CLOSE POPUP
  ---------------------------- */
  if (imageClicked) {
    closeAll();
  }
});
