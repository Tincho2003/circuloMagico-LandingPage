/* ===========================
   CÍRCULO MÁGICO — MAIN JS
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================
     INTRO SCREEN — solo primer ingreso
  ========================================= */
  const introScreen  = document.getElementById('intro-screen');
  const header       = document.getElementById('header');
  const waFloat      = document.querySelector('.wa-float');
  const siteWrapper  = document.getElementById('site-wrapper');

  if (introScreen) {
    const SEEN_KEY = 'cm_intro_seen';

    /* ── Canvas de partículas doradas (estado inicial) ── */
    const canvas = document.getElementById('intro-canvas');
    let animId;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
      resize();
      window.addEventListener('resize', resize, { passive: true });

      const NUM = 70;
      const pts = Array.from({ length: NUM }, () => ({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        r:  Math.random() * 1.6 + 0.3,
        vy: -(Math.random() * 0.35 + 0.08),
        vx: (Math.random() - 0.5) * 0.15,
        a:  Math.random() * 0.55 + 0.1,
        da: (Math.random() - 0.5) * 0.008,
        gold: Math.random() > 0.45,
      }));

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pts.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.gold ? '#D4AF37' : '#ffffff';
          ctx.globalAlpha = Math.max(0.05, Math.min(0.75, p.a));
          ctx.fill();
          p.y += p.vy; p.x += p.vx;
          p.a += p.da;
          if (p.a < 0.05 || p.a > 0.75) p.da *= -1;
          if (p.y < -4) { p.y = canvas.height + 4; p.x = Math.random() * canvas.width; }
        });
        ctx.globalAlpha = 1;
        animId = requestAnimationFrame(draw);
      };
      draw();
    }

    /* ── ¿Ya visto? ── */
    if (sessionStorage.getItem(SEEN_KEY)) {
      introScreen.style.display = 'none';
      const handL = document.getElementById('hand-left');
      const handR = document.getElementById('hand-right');
      const parts = document.getElementById('intro-particles');
      if (handL) handL.remove();
      if (handR) handR.remove();
      if (parts) parts.remove();
      if (siteWrapper) { siteWrapper.style.opacity = '1'; siteWrapper.style.transform = 'none'; }
    } else {
      /* ── Ocultar header/WA y bloquear scroll ── */
      if (header)  { header.style.opacity  = '0'; header.style.pointerEvents = 'none'; }
      if (waFloat) { waFloat.style.opacity = '0'; waFloat.style.pointerEvents = 'none'; }
      document.body.style.overflow = 'hidden';

      /* ── Estado inicial del site-wrapper (oculto debajo) ── */
      if (siteWrapper) {
        gsap.set(siteWrapper, { opacity: 0, y: 40 });
        /* NO usar filter en site-wrapper: crearía stacking context
           que rompería mix-blend-mode:screen de los logos internos */
      }

      /* ── Estado inicial de las manos ── */
      const handLeft  = document.getElementById('hand-left');
      const handRight = document.getElementById('hand-right');
      const W = window.innerWidth;
      const H = window.innerHeight;

      gsap.set(handLeft,  { y: 320, x: -60, rotation: -30, opacity: 0, transformOrigin: '100% 100%' });
      gsap.set(handRight, { y: 320, x:  60, rotation:  30, opacity: 0, transformOrigin: '0% 100%' });

      /* ── Partículas mágicas ── */
      function spawnMagicParticles() {
        const container = document.getElementById('intro-particles');
        const logoEl    = document.getElementById('intro-logo');
        if (!container || !logoEl) return;

        const rect = logoEl.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const count = 9;

        for (let i = 0; i < count; i++) {
          const p    = document.createElement('div');
          p.className = 'intro-particle';
          const size   = Math.random() * 3 + 3;          // 3–6 px
          const angle  = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
          const radius = Math.random() * 55 + 25;
          const sx     = cx + Math.cos(angle) * radius;
          const sy     = cy + Math.sin(angle) * radius;
          const isGold = Math.random() > 0.38;
          const col    = isGold ? '#f0d080' : '#ffffff';
          const glow   = isGold ? 'rgba(240,208,128,0.8)' : 'rgba(255,255,255,0.7)';

          p.style.cssText = `
            width:${size}px; height:${size}px;
            left:${sx}px; top:${sy}px;
            background:${col};
            box-shadow: 0 0 ${size * 2}px ${glow};
            opacity:0;
          `;
          container.appendChild(p);

          const dur = Math.random() * 0.2 + 0.6;
          const dx  = (Math.random() - 0.5) * 28;
          const dy  = -(Math.random() * 40 + 80);

          gsap.fromTo(p,
            { opacity: 1, x: 0, y: 0 },
            { opacity: 0, x: dx, y: dy, duration: dur, ease: 'power2.out',
              onComplete: () => p.remove() }
          );
        }
      }

      /* ── Timeline GSAP ── */
      let triggered = false;

      function playMagicReveal() {
        if (triggered) return;
        triggered = true;
        sessionStorage.setItem(SEEN_KEY, '1');
        if (animId) cancelAnimationFrame(animId);

        /* Quitar cursor sparkle listener al triggear */
        introScreen.removeEventListener('mousemove', onMouseMove);

        const introLogo    = document.getElementById('intro-logo');
        const introBg      = document.getElementById('intro-bg');
        const introCta     = document.getElementById('intro-cta');
        const introContent = document.getElementById('intro-content');

        /* Detener CSS animations — GSAP toma control total */
        introLogo.style.animation = 'none';
        introCta.style.animation  = 'none'; /* fadeInUp fill-forward sobreescribiría opacity:0 */

        /* ── Parámetros del abanico de cartas ── */
        const cardGap  = Math.min(72, W * 0.066);
        const cardRots = [-18, -6, 6, 18];
        const cardXs   = [-3 * cardGap, -cardGap, cardGap, 3 * cardGap];

        /* ── Parámetros del aplauso (cálculo geométrico) ──────────────
           hand-left  → CSS left: -10px  → necesita moverse DERECHA  (+x)
           hand-right → CSS right: -10px → necesita moverse IZQUIERDA (-x)
           La palma del SVG está en aprox x=115/220, y=130/340
           Objetivo: palmas se encuentran exactamente en W/2, H*0.45
        ──────────────────────────────────────────────────────────────── */
        const handW   = Math.min(300, Math.max(160, W * 0.22)); // igual al CSS clamp
        const handH   = handW * 340 / 220;
        const clapX   =  W / 2 + 10 - handW * 0.523;     // desplazamiento para alcanzar W/2
        const clapY   = -(H - handH * 0.618 + 10 - H * 0.45); // palmas al 45% de altura
        const recoilX =  clapX * 0.72;
        const recoilY =  clapY + 22;

        /* Aparece la carta i desde cerca del centro → posición final en abanico */
        function dropCard(i) {
          const card = document.querySelectorAll('.intro-card')[i];
          if (!card) return;
          gsap.fromTo(card,
            { xPercent: -50, yPercent: -50,
              x: cardXs[i] * 0.12, y: -20,
              rotation: cardRots[i] * 0.25,
              scale: 0.1, opacity: 0 },
            { xPercent: -50, yPercent: -50,
              x: cardXs[i], y: 0,
              rotation: cardRots[i],
              scale: 1, opacity: 1,
              duration: 0.36, ease: 'back.out(1.25)' }
          );
        }

        const tl = gsap.timeline({
          onComplete() {
            introScreen.style.display = 'none';
            if (handLeft)  handLeft.remove();
            if (handRight) handRight.remove();
            const parts = document.getElementById('intro-particles');
            if (parts) parts.remove();
            document.body.style.overflow = '';
            window.scrollTo({ top: 0, behavior: 'instant' });
            if (siteWrapper) gsap.set(siteWrapper, { clearProps: 'all' });
          }
        });

        /* ─────────────────────────────────────────────
           FASE 1 (0.0 → 0.8s)
           Las manos entran con arco desde las esquinas.
           SIMULTÁNEAMENTE el logo se achica y baja
           al centro inferior — como si presintiera la magia
        ───────────────────────────────────────────── */
        tl
          // Fondo: micro-zoom sutil
          .to(introBg, { scale: 1.04, duration: 0.9, ease: 'power1.inOut' }, 0)

          // CTA se retira
          .to(introCta, { opacity: 0, y: 12, duration: 0.3, ease: 'power2.out' }, 0)

          // Logo: escala y baja al centro inferior MIENTRAS las manos entran
          // Solo scale+y para no crear stacking context que rompa mix-blend-mode
          .to(introLogo, {
            scale: 0.38,
            y: H * 0.25,
            duration: 0.78, ease: 'power2.inOut'
          }, 0.05)

          // Mano izquierda — entra en arco desde abajo-izquierda
          .to(handLeft, { y: 140, x: -80, rotation: -22, opacity: 0.6, duration: 0.28, ease: 'power2.out' }, 0.05)
          .to(handLeft, { y:   0, x:   0, rotation: -12, opacity: 1,   duration: 0.42, ease: 'power2.out' }, 0.33)

          // Mano derecha — espejada, micro-stagger
          .to(handRight, { y: 140, x: 80, rotation: 22, opacity: 0.6, duration: 0.28, ease: 'power2.out' }, 0.1)
          .to(handRight, { y:   0, x:  0, rotation: 12, opacity: 1,   duration: 0.42, ease: 'power2.out' }, 0.38)

        /* ─────────────────────────────────────────────
           FASE 2 (0.82 → 1.18s) — Preparación del aplauso
           Pequeño gesto antes de juntar las manos
        ───────────────────────────────────────────── */
          .to(handLeft,  { y: -24, x: 12,  rotation: -7, duration: 0.38, ease: 'power1.inOut' }, 0.82)
          .to(handRight, { y: -18, x: -10, rotation: 18, duration: 0.36, ease: 'power1.inOut' }, 0.85)

        /* ─────────────────────────────────────────────
           FASE 3A (1.18 → 1.44s) — APLAUSO
           Las manos convergen rápido al centro — ¡PAP!
        ───────────────────────────────────────────── */
          // Convergencia al centro: clapX lleva cada palma exactamente a W/2
          .to(handLeft,  { x:  clapX, y: clapY, rotation: -2, duration: 0.24, ease: 'power3.in' }, 1.2)
          .to(handRight, { x: -clapX, y: clapY, rotation:  2, duration: 0.24, ease: 'power3.in' }, 1.2)

          // Impacto: pantalla vibra levemente
          .to(introScreen, { x: -5, duration: 0.05, ease: 'power4.out', yoyo: true, repeat: 3 }, 1.44)

          // Burst de partículas en el momento del golpe
          .add(() => spawnMagicParticles(), 1.44)

          // Recoil — manos rebotan desde el centro hacia atrás
          .to(handLeft,  { x:  recoilX, y: recoilY, rotation: -8, duration: 0.2, ease: 'power2.out' }, 1.46)
          .to(handRight, { x: -recoilX, y: recoilY, rotation:  8, duration: 0.2, ease: 'power2.out' }, 1.46)

        /* ─────────────────────────────────────────────
           FASE 3B (1.68 → 2.68s) — Manos se abren LENTO
           Las cartas aparecen UNA A UNA mientras las
           manos se van abriendo — como si las dejaran caer
           en su posición al pasar por cada lugar
        ───────────────────────────────────────────── */
          // Apertura lenta y teatral (1 segundo completo)
          .to(handLeft,  { x: -W * 0.23, y: -14, rotation: -30, duration: 1.0, ease: 'power1.inOut' }, 1.68)
          .to(handRight, { x:  W * 0.23, y: -14, rotation:  30, duration: 1.0, ease: 'power1.inOut' }, 1.68)

          // ♠ — primera carta, mano izq lleva ~20% del camino
          .add(() => dropCard(0), 1.90)
          // ♥ — segunda, ~40%
          .add(() => dropCard(1), 2.10)
          // ♦ — tercera, ~60%
          .add(() => dropCard(2), 2.30)
          // ♣ — cuarta, mano der casi al final (~80%)
          .add(() => dropCard(3), 2.50)

          // Glow dorado en todas al completarse el abanico
          .add(() => {
            gsap.to('.intro-card', {
              filter: 'drop-shadow(0 0 12px rgba(200,168,75,0.5))',
              duration: 0.45, ease: 'power2.out'
            });
          }, 2.76)

        /* ─────────────────────────────────────────────
           FASE 4 (2.9 → 3.8s) — Revelación del sitio
           Breve pausa para admirar las cartas,
           luego las manos levantan el telón
        ───────────────────────────────────────────── */
          // Manos suben levantando el telón
          .to(handLeft,  { y: '-=245', opacity: 0.5, duration: 0.52, ease: 'power2.in' }, 2.92)
          .to(handRight, { y: '-=245', opacity: 0.5, duration: 0.52, ease: 'power2.in' }, 2.92)

          // Intro screen asciende
          .to(introScreen, { y: '-100vh', duration: 0.92, ease: 'power3.inOut' }, 3.04)
          .to(introScreen, { opacity: 0,  duration: 0.50, ease: 'power2.in'    }, 3.18)

          // Sitio se revela desde abajo
          .to(siteWrapper, { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' }, 3.08)

          // Header y WA
          .add(() => {
            if (header) {
              header.style.transition    = 'opacity 0.65s ease';
              header.style.opacity       = '1';
              header.style.pointerEvents = '';
            }
            if (waFloat) {
              waFloat.style.transition    = 'opacity 0.65s ease 0.25s';
              waFloat.style.opacity       = '1';
              waFloat.style.pointerEvents = '';
            }
          }, 3.25)

        /* ─────────────────────────────────────────────
           FASE 5 (3.52 → 4.05s) — Salida elegante manos
           El mago retira las manos con una rotación final
        ───────────────────────────────────────────── */
          .to(handLeft, {
            x: -W * 0.15, y: '-=170', rotation: -42, opacity: 0,
            duration: 0.53, ease: 'power2.in'
          }, 3.52)
          .to(handRight, {
            x:  W * 0.15, y: '-=170', rotation:  42, opacity: 0,
            duration: 0.53, ease: 'power2.in'
          }, 3.57);
      }

      /* ── Triggers de activación ── */
      introScreen.addEventListener('click',     playMagicReveal, { once: true });
      introScreen.addEventListener('wheel',     playMagicReveal, { once: true, passive: true });
      introScreen.addEventListener('touchmove', playMagicReveal, { once: true, passive: true });
      introScreen.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') playMagicReveal();
      }, { once: true });

      /* ── Cursor sparkle trail ── */
      let lastSparkX = 0, lastSparkY = 0;
      function onMouseMove(e) {
        const dx = e.clientX - lastSparkX;
        const dy = e.clientY - lastSparkY;
        if (Math.hypot(dx, dy) < 10) return;
        lastSparkX = e.clientX;
        lastSparkY = e.clientY;

        const spark = document.createElement('div');
        spark.className = 'intro-spark';
        const size    = Math.random() * 4 + 3;
        const driftX  = (Math.random() - 0.5) * 22;
        const isGold  = Math.random() > 0.38;
        const color   = isGold ? '#D4AF37' : '#ffffff';
        const glowClr = isGold ? 'rgba(212,175,55,0.65)' : 'rgba(255,255,255,0.45)';
        spark.style.cssText = `
          left:${e.clientX}px; top:${e.clientY}px;
          width:${size}px; height:${size}px;
          --drift-x:${driftX}px;
          background:${color};
          box-shadow: 0 0 ${size * 1.8}px ${size * 0.9}px ${glowClr};
        `;
        introScreen.appendChild(spark);
        setTimeout(() => spark.remove(), 760);
      }
      introScreen.addEventListener('mousemove', onMouseMove, { passive: true });
    }
  }

  /* --- HEADER SCROLL --- */
  // header ya declarado arriba (intro screen)
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* --- MOBILE MENU --- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* --- STARS BACKGROUND --- */
  const canvas = document.querySelector('.stars-canvas');
  if (canvas) {
    const count = 120;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() * 2.5 + 0.5;
      const delay = Math.random() * 6;
      const duration = Math.random() * 4 + 3;
      star.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        opacity: ${Math.random() * 0.5 + 0.1};
      `;
      canvas.appendChild(star);
    }
  }

  /* --- ACTIVE NAV LINK --- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* --- SMOOTH SCROLL para anclas --- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* --- AOS INIT --- */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 900,
      once: true,
      offset: 80,
      easing: 'ease-out-quart',
      anchorPlacement: 'top-bottom',
    });
  }

  /* --- GALLERY LIGHTBOX (GLightbox) --- */
  if (typeof GLightbox !== 'undefined') {
    GLightbox({
      selector: '.gallery-item',
      touchNavigation: true,
      loop: true,
      zoomable: false,
      skin: 'clean',
    });
  }

  /* --- CONTADOR ANIMADO --- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'));
          const duration = 1600;
          const step = target / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = Math.floor(current) + (el.dataset.suffix || '');
          }, 16);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
  }

});
