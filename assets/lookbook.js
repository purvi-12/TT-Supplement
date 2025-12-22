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
  popup.style.top = getComputedStyle(pin).top;
  popup.style.left = getComputedStyle(pin).left;

  pin.setAttribute('aria-expanded', 'true');
  popup.setAttribute('aria-hidden', 'false');
});
