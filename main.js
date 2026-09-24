'use strict';

(() => {
  const WHATSAPP_NUMBER = '593982752956'; // Ecuador, sin "+"
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const hasIO = 'IntersectionObserver' in window;

  /* Footer year */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Header: hairline once the page scrolls (sentinel, no scroll listeners) */
  const header = $('.site-header');
  const sentinel = $('.scroll-sentinel');
  if (header && sentinel && hasIO) {
    new IntersectionObserver(([entry]) => {
      header.classList.toggle('is-scrolled', !entry.isIntersecting);
    }).observe(sentinel);
  }

  /* Mobile navigation (disclosure) */
  const toggle = $('.nav-toggle');
  const nav = $('#site-nav');
  if (toggle && nav) {
    const label = $('.sr-only', toggle);
    const setOpen = (open, { focusToggle = false } = {}) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      if (label) label.textContent = open ? 'Cerrar menú' : 'Abrir menú';
      if (open) {
        const first = $('a', nav);
        if (first) first.focus();
      } else if (focusToggle) {
        toggle.focus();
      }
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, { focusToggle: true });
    });
    document.addEventListener('click', (e) => {
      if (toggle.getAttribute('aria-expanded') === 'true' && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    window.matchMedia('(min-width: 860px)').addEventListener('change', (mq) => { if (mq.matches) setOpen(false); });
  }

  /* Reveal on scroll */
  const reveals = $$('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hasIO || reduceMotion) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  }

  /* Floating WhatsApp button: hidden while the contact section is on screen */
  const fab = $('.wa-fab');
  const contact = $('#contacto');
  if (fab && contact && hasIO) {
    new IntersectionObserver(([entry]) => {
      fab.classList.toggle('is-hidden', entry.isIntersecting);
    }, { threshold: 0.2 }).observe(contact);
  }

  /* WhatsApp form */
  const form = $('#whatsappForm');
  if (!form) return;

  const fields = {
    nombre: $('#nombre'),
    telefono: $('#telefono'),
    plan: $('#plan'),
    objetivo: $('#objetivo'),
  };
  const preview = $('#preview');
  const status = $('#form-status');

  const buildMessage = () => {
    const nombre = fields.nombre.value.trim();
    const telefono = fields.telefono.value.trim();
    const plan = fields.plan.value;
    const objetivo = fields.objetivo.value.trim();
    return [
      `Hola, soy ${nombre || '(tu nombre)'}.`,
      `Estoy interesado en el plan: ${plan}.`,
      objetivo ? `Mi objetivo: ${objetivo}.` : null,
      telefono ? `Mi teléfono: ${telefono}.` : null,
    ].filter(Boolean).join('\n');
  };

  const updatePreview = () => { if (preview) preview.textContent = buildMessage(); };

  const setError = (input, hasError) => {
    const errorEl = document.getElementById(`${input.id}-error`);
    input.setAttribute('aria-invalid', String(hasError));
    if (errorEl) errorEl.hidden = !hasError;
  };

  const validate = () => {
    const required = [fields.nombre, fields.objetivo];
    let firstInvalid = null;
    required.forEach((input) => {
      const invalid = !input.value.trim();
      setError(input, invalid);
      if (invalid && !firstInvalid) firstInvalid = input;
    });
    return firstInvalid;
  };

  Object.values(fields).forEach((input) => {
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true' && input.value.trim()) setError(input, false);
      updatePreview();
    });
    input.addEventListener('change', updatePreview);
  });
  updatePreview();

  /* "o completa el formulario" links preselect the plan */
  $$('[data-plan]').forEach((link) => {
    link.addEventListener('click', () => {
      fields.plan.value = link.getAttribute('data-plan');
      updatePreview();
      fields.plan.classList.remove('is-flash');
      void fields.plan.offsetWidth; // restart animation
      fields.plan.classList.add('is-flash');
      if (status) {
        status.classList.remove('is-error');
        status.textContent = `Plan ${fields.plan.value} seleccionado.`;
      }
      // Move focus to the form once the smooth scroll starts
      window.setTimeout(() => fields.nombre.focus({ preventScroll: true }), 450);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstInvalid = validate();
    if (firstInvalid) {
      status.classList.add('is-error');
      status.textContent = 'Por favor, completa tu nombre y objetivo.';
      firstInvalid.focus();
      return;
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}`;
    const win = window.open(url, '_blank');
    status.classList.remove('is-error');
    if (win) {
      win.opener = null;
      status.textContent = 'Abriendo WhatsApp con tu mensaje…';
    } else {
      // Popup blocked: offer a direct link and navigate in the same tab
      status.innerHTML = '';
      const a = document.createElement('a');
      a.href = url;
      a.rel = 'noopener';
      a.textContent = 'Abrir WhatsApp';
      status.append('Si WhatsApp no se abrió, ', a, '.');
      window.location.href = url;
    }
  });
})();
