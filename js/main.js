/* ═══════════════════════════════════════════════════════
   NOOOK — main.js
   Módulos: Loader · Cursor · Navbar · Hamburger ·
            Marquee · Counters · Scroll Reveals ·
            Magnetic Buttons · Año footer
   ═══════════════════════════════════════════════════════ */
 
'use strict';
 
/* ──────────────────────────────────────────────────────
   UTILIDADES
────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
 
/* Prefiere movimiento reducido */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
/* ══════════════════════════════════════════════════════
   1. LOADER
   Espera a que todo cargue, luego lo oculta con fade.
══════════════════════════════════════════════════════ */
(function initLoader() {
  const loader = $('#loader');
  if (!loader) return;
 
  /* Tiempo mínimo de 1.8s para que se vea la barra completa */
  const minTime = 1800;
  const startTs = Date.now();
  let hidden = false;
 
  function hideLoader() {
    if (hidden) return;
    hidden = true;
    const elapsed = Date.now() - startTs;
    const delay   = Math.max(0, minTime - elapsed);
    setTimeout(() => {
      loader.classList.add('hidden');
      loader.addEventListener('transitionend', () => {
        loader.remove();
      }, { once: true });
    }, delay);
  }
 
  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader, { once: true });
    /* Fallback: ocultar aunque las fuentes no terminen de cargar */
    setTimeout(hideLoader, 3500);
  }
})();
 
/* ══════════════════════════════════════════════════════
   2. CURSOR PERSONALIZADO
   Solo en dispositivos que soporten hover (desktop).
══════════════════════════════════════════════════════ */
(function initCursor() {
  if (prefersReducedMotion()) return;
  if (!window.matchMedia('(hover: hover)').matches) return;
 
  const dot  = $('#cursor-dot');
  const ring = $('#cursor-ring');
  if (!dot || !ring) return;
 
  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
 
  /* Fijar en 0,0 — el movimiento va por transform (no causa reflow) */
  dot.style.left  = '0px';
  dot.style.top   = '0px';
  ring.style.left = '0px';
  ring.style.top  = '0px';
 
  /* Solo guardar coordenadas en mousemove, sin tocar el DOM aquí */
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });
 
  /* Toda la escritura al DOM en un único rAF — manejado por GPU */
  function lerpRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    dot.style.transform  = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    requestAnimationFrame(lerpRing);
  }
  lerpRing();
 
  /* Hover state en elementos interactivos */
  const hoverTargets = 'a, button, .btn, .package-card, .portfolio-card, .social-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.add('cursor-hover');
  }, { passive: true });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.remove('cursor-hover');
  }, { passive: true });
})();
 
/* ══════════════════════════════════════════════════════
   3. NAVBAR — scroll state
══════════════════════════════════════════════════════ */
(function initNavbar() {
  const nav = $('#navbar');
  if (!nav) return;
 
  let lastScroll = 0;
  let ticking = false;
 
  function updateNav() {
    const scrollY = window.scrollY;
 
    if (scrollY > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;
    ticking = false;
  }
 
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });
})();
 
/* ══════════════════════════════════════════════════════
   4. HAMBURGER MENU (mobile)
══════════════════════════════════════════════════════ */
(function initHamburger() {
  const btn  = $('#hamburger');
  const menu = $('#mobile-menu');
  if (!btn || !menu) return;
 
  const mobileLinks = $$('.mobile-link, .mobile-cta', menu);
 
  function openMenu() {
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
 
  function closeMenu() {
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
 
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });
 
  /* Cerrar al hacer click en un link */
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
 
  /* Cerrar con Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
})();
 
/* ══════════════════════════════════════════════════════
   5. MARQUEE STRIP
   Genera los items y aplica animación CSS infinita.
══════════════════════════════════════════════════════ */
(function initMarquee() {
  const track = $('#marquee-track');
  if (!track) return;
 
  const words = [
    'Diseño web premium',
    'Sitios que convierten',
    'Tu negocio en línea',
    'Diseño estratégico',
    'Resultados reales',
    'Experiencias digitales',
    'Noook Studio',
    'Hecho en México',
  ];
 
  /* Crear items suficientes para loop sin salto */
  const totalItems = [...words, ...words, ...words]; // triplicar
 
  totalItems.forEach((word) => {
    const item = document.createElement('span');
    item.className = 'marquee-item';
    item.innerHTML = `${word} <span class="marquee-sep" aria-hidden="true"></span>`;
    track.appendChild(item);
  });
 
  if (prefersReducedMotion()) return;
 
  /* Aplicar animación */
  track.style.animation = 'marquee-scroll 28s linear infinite';
  track.style.animationTimingFunction = 'linear';
 
  /* Ajustar velocidad en mobile */
  if (window.innerWidth < 600) {
    track.style.animationDuration = '18s';
  }
})();
 
/* ══════════════════════════════════════════════════════
   6. SCROLL REVEALS (Intersection Observer)
══════════════════════════════════════════════════════ */
(function initReveal() {
  const targets = $$('.reveal, .reveal-right');
  if (!targets.length) return;
 
  if (prefersReducedMotion()) {
    targets.forEach(el => el.classList.add('visible'));
    return;
  }
 
  /* Fallback: si el Observer falla (file://, browser viejo), mostrar todo */
  const fallback = setTimeout(() => {
    targets.forEach(el => el.classList.add('visible'));
  }, 1200);
 
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
    /* Si ya no quedan elementos observados, cancelar fallback */
    if (targets.every(el => el.classList.contains('visible'))) {
      clearTimeout(fallback);
    }
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px',
  });
 
  targets.forEach(el => observer.observe(el));
})();
 
/* ══════════════════════════════════════════════════════
   7. COUNTERS ANIMADOS (estadísticas del hero)
      Usa IntersectionObserver para disparar cuando
      los números son visibles.
══════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = $$('.stat-num[data-target]');
  if (!counters.length) return;
  if (prefersReducedMotion()) {
    counters.forEach(el => {
      el.firstChild.textContent = el.dataset.target;
    });
    return;
  }
 
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.querySelector('span')?.textContent || '';
    const duration = 1800; /* ms */
    const startTs  = performance.now();
 
    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }
 
    function update(timestamp) {
      const elapsed  = timestamp - startTs;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOutExpo(progress) * target);
 
      /* El textContent del nodo de texto (antes del <span>) */
      el.childNodes[0].textContent = value;
 
      if (progress < 1) requestAnimationFrame(update);
    }
 
    requestAnimationFrame(update);
  }
 
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
 
  counters.forEach(el => obs.observe(el));
})();
 
/* ══════════════════════════════════════════════════════
   8. MAGNETIC BUTTONS
   Los botones se "atraen" ligeramente al cursor.
   Solo en desktop con mouse.
══════════════════════════════════════════════════════ */
(function initMagnetic() {
  if (prefersReducedMotion()) return;
  if (!window.matchMedia('(hover: hover)').matches) return;
 
  const btns = $$('.btn-primary, .btn-whatsapp, .btn-ghost');
 
  btns.forEach(btn => {
    let rect = btn.getBoundingClientRect();
 
    /* Refrescar rect solo al entrar — no en cada mousemove */
    btn.addEventListener('mouseenter', () => {
      rect = btn.getBoundingClientRect();
    }, { passive: true });
 
    btn.addEventListener('mousemove', (e) => {
      const dx = (e.clientX - (rect.left + rect.width  / 2)) * 0.25;
      const dy = (e.clientY - (rect.top  + rect.height / 2)) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-2px)`;
    }, { passive: true });
 
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    }, { passive: true });
  });
})();
 
/* ══════════════════════════════════════════════════════
   9. SMOOTH SCROLL para anchors internos
══════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
 
      const navH = $('#navbar')?.offsetHeight ?? 80;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
 
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
 
/* ══════════════════════════════════════════════════════
   10. AÑO DINÁMICO en el footer
══════════════════════════════════════════════════════ */
(function initYear() {
  const el = $('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();
 
/* ══════════════════════════════════════════════════════
   11. PACKAGE CARDS — highlight on hover via JS
       (refuerzo del efecto CSS con glow dinámico)
══════════════════════════════════════════════════════ */
(function initPackageGlow() {
  if (prefersReducedMotion()) return;
  if (!window.matchMedia('(hover: hover)').matches) return;
 
  const cards = $$('.package-card');
 
  cards.forEach(card => {
    let rect = card.getBoundingClientRect();
 
    /* Refrescar rect solo al entrar — no en cada mousemove */
    card.addEventListener('mouseenter', () => {
      rect = card.getBoundingClientRect();
    }, { passive: true });
 
    card.addEventListener('mousemove', (e) => {
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    }, { passive: true });
  });
})();
 
/* ══════════════════════════════════════════════════════
   12. BROWSER MOCKUP — tilt 3D al mover el ratón
══════════════════════════════════════════════════════ */
(function initMockupTilt() {
  if (prefersReducedMotion()) return;
  if (!window.matchMedia('(hover: hover)').matches) return;
 
  const frame = $('.browser-frame');
  if (!frame) return;
 
  let rect = frame.getBoundingClientRect();
 
  /* Refrescar rect solo al entrar — no en cada mousemove */
  frame.addEventListener('mouseenter', () => {
    rect = frame.getBoundingClientRect();
  }, { passive: true });
 
  frame.addEventListener('mousemove', (e) => {
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const rotY = ((e.clientX - cx) / (rect.width  / 2)) * -6;
    const rotX = ((e.clientY - cy) / (rect.height / 2)) *  4;
    frame.style.transform = `perspective(1200px) rotateY(${rotY}deg) rotateX(${rotX}deg) translateY(-4px)`;
  }, { passive: true });
 
  frame.addEventListener('mouseleave', () => {
    frame.style.transform = '';
  }, { passive: true });
})();
