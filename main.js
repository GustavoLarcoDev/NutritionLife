'use strict';

// Year in footer
(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

// Auto-play carousel is already handled via data-bs-ride and intervals.
// Here we only ensure it starts when visible.
document.addEventListener('DOMContentLoaded', () => {
  const carouselEl = document.getElementById('heroCarousel');
  if (carouselEl) {
    try {
      const carousel = new bootstrap.Carousel(carouselEl, { interval: 4000, ride: 'carousel' });
      // no-op, instance created ensures behavior in some browsers
    } catch (e) {
      console.warn('Bootstrap not loaded yet for carousel:', e);
    }
  }

  // Pre-fill plan from plan buttons
  const planSelect = document.getElementById('plan');
  document.querySelectorAll('.btn-whatsapp[data-plan]').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.getAttribute('data-plan');
      if (planSelect) planSelect.value = plan;
      // Scroll to contact form for better UX
      const contact = document.getElementById('contacto');
      if (contact) contact.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // WhatsApp form handling
  const form = document.getElementById('whatsappForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('nombre').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const plan = document.getElementById('plan').value;
      const objetivo = document.getElementById('objetivo').value.trim();

      if (!nombre || !objetivo) {
        alert('Por favor, completa tu nombre y objetivo.');
        return;
      }

      const lineas = [
        `Hola, soy ${nombre}.`,
        `Estoy interesado en el plan: ${plan}.`,
        objetivo ? `Mi objetivo: ${objetivo}.` : null,
        telefono ? `Mi teléfono: ${telefono}.` : null
      ].filter(Boolean);

      const mensaje = encodeURIComponent(lineas.join('\n'));
      const numero = '593982752956'; // Ecuador, ya sin +
      const url = `https://wa.me/${numero}?text=${mensaje}`;
      window.open(url, '_blank', 'noopener');
    });
  }
});
