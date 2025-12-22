document.addEventListener('click', (e) => {
  const section = e.target.closest('[data-lookbook]');
  if (!section) return;

  const pin = e.target.closest('[data-pin]');

  // Close all popups
  section.querySelectorAll('.lookbook__popup').forEach(popup => {
    popup.style.display = 'none';
    popup.setAttribute('aria-hidden', 'true');
  });

  section.querySelectorAll('[data-pin]').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
  });

  if (!pin) return;

  const popup = pin.nextElementSibling;
  popup.style.display = 'block';

  // --- SMART POSITIONING ---
  const pinRect = pin.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();
  const containerRect = section.getBoundingClientRect();

  let top =
    pinRect.top -
    containerRect.top -
    popupRect.height -
    10;

  let left =
    pinRect.left -
    containerRect.left +
    pinRect.width / 2 -
    popupRect.width / 2;

  // Clamp horizontally
  const minLeft = 8;
  const maxLeft = containerRect.width - popupRect.width - 8;
  left = Math.max(minLeft, Math.min(left, maxLeft));

  // If not enough space above → show below
  if (top < 8) {
    top =
      pinRect.bottom -
      containerRect.top +
      10;
  }

  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;

  pin.setAttribute('aria-expanded', 'true');
  popup.setAttribute('aria-hidden', 'false');
});
