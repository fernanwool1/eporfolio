(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Starfield */
  const starfield = document.getElementById('starfield');
  if (starfield && !prefersReducedMotion) {
    const STAR_COUNT = 320;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < STAR_COUNT; i++) {
      const star = document.createElement('span');
      const isBig = Math.random() < 0.12;
      const size = isBig ? 2.5 + Math.random() * 2.5 : 1 + Math.random() * 1.4;
      star.style.width = `${size.toFixed(1)}px`;
      star.style.height = `${size.toFixed(1)}px`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      star.style.animationDuration = `${3 + Math.random() * 3}s`;
      star.style.opacity = (0.2 + Math.random() * 0.5).toFixed(2);
      if (isBig) star.style.boxShadow = `0 0 ${(size * 2).toFixed(1)}px rgba(255, 255, 255, 0.55)`;
      frag.appendChild(star);
    }
    starfield.appendChild(frag);
  }

  /* Night scene: fixed moonlit mountain backdrop shared across every page */
  if (starfield) {
    const nightScene = document.createElement('div');
    nightScene.className = 'night-scene';
    nightScene.setAttribute('aria-hidden', 'true');
    nightScene.innerHTML = `
      <img class="scene-moon" src="assets/background/bg-moon.png" alt="">
      <img class="scene-cloud scene-cloud-1" src="assets/background/bg-cloud-1.png" alt="">
      <img class="scene-cloud scene-cloud-2" src="assets/background/bg-cloud-2.png" alt="">
      <img class="scene-mist" src="assets/background/bg-mist.png" alt="">
      <img class="scene-mountains-near" src="assets/background/bg-mountains-near.png" alt="">
    `;
    starfield.after(nightScene);
  }

  /* Nav: scrolled state */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Nav: mobile toggle */
  const navToggle = document.getElementById('navToggle');
  const navLinksEl = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    const isOpen = navLinksEl.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinksEl.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinksEl.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* Nav: scrollspy */
  const sections = Array.from(document.querySelectorAll('main .section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(section => spy.observe(section));

  /* Skill bars: animate fill on scroll into view */
  const skillBars = document.querySelectorAll('.skill-bar');
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const fill = bar.querySelector('.skill-fill');
        const percent = bar.dataset.percent || 0;
        requestAnimationFrame(() => {
          fill.style.width = `${percent}%`;
        });
        skillObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.4 });
  skillBars.forEach(bar => skillObserver.observe(bar));

  /* Scroll reveal: split headline text into per-letter spans, grouped by word
     so the browser can only wrap lines between words, never mid-word */
  const splitChars = (el) => {
    let i = 0;
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        const words = node.textContent.split(' ');
        words.forEach((word, wi) => {
          if (word.length) {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'char-word';
            Array.from(word).forEach(ch => {
              const span = document.createElement('span');
              span.className = 'char';
              span.style.setProperty('--i', i++);
              span.textContent = ch;
              wordSpan.appendChild(span);
            });
            frag.appendChild(wordSpan);
          }
          if (wi < words.length - 1) frag.appendChild(document.createTextNode(' '));
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(walk);
      }
    };
    Array.from(el.childNodes).forEach(walk);
  };

  if (!prefersReducedMotion) {
    document.querySelectorAll('.reveal-chars').forEach(splitChars);
  }

  /* Scroll reveal: fade/slide/letter reveal once each target enters view */
  const revealTargets = document.querySelectorAll(
    '.reveal-chars, .reveal-up, .about-text, .timeline, .skill-bars, .language-tags'
  );
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
  revealTargets.forEach(t => revealObserver.observe(t));

  /* Fast smooth-scroll for in-page anchor links (nav, hero buttons, scroll cue) */
  const SCROLL_DURATION = 450;
  const easeInOutQuad = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  const fastScrollTo = (targetY) => {
    const startY = window.scrollY;
    const diff = targetY - startY;
    let startTime = null;
    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const percent = Math.min((timestamp - startTime) / SCROLL_DURATION, 1);
      window.scrollTo({ top: startY + diff * easeInOutQuad(percent), behavior: 'auto' });
      if (percent < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav.offsetHeight;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      if (prefersReducedMotion) {
        window.scrollTo(0, targetY);
      } else {
        fastScrollTo(targetY);
      }
    });
  });

  /* Full-page wheel paging: one wheel gesture advances a whole section.
     Sections taller than the viewport still scroll internally first, so
     nothing gets skipped; only once a section is fully in view does the
     next wheel tick commit to the next/previous section. */
  if (!prefersReducedMotion) {
    const pagerEls = ['#home', '#about', '.motto-strip', '#education', '#skills', '#contact']
      .map(sel => document.querySelector(sel))
      .filter(Boolean);

    const sectionTargetY = (el) => {
      const navHeight = nav.offsetHeight;
      return el.getBoundingClientRect().top + window.scrollY - navHeight + 1;
    };

    const currentPagerIndex = () => {
      const y = window.scrollY + 2;
      let idx = 0;
      pagerEls.forEach((el, i) => {
        if (sectionTargetY(el) <= y) idx = i;
      });
      return idx;
    };

    let isPaging = false;
    const pageTo = (idx) => {
      const target = pagerEls[idx];
      if (!target) return;
      isPaging = true;
      fastScrollTo(sectionTargetY(target));
      setTimeout(() => { isPaging = false; }, SCROLL_DURATION + 60);
    };

    window.addEventListener('wheel', (e) => {
      if (e.ctrlKey) return;
      if (isPaging) { e.preventDefault(); return; }
      const dir = e.deltaY > 0 ? 1 : -1;
      const idx = currentPagerIndex();
      const current = pagerEls[idx];
      if (!current) return;
      const rect = current.getBoundingClientRect();
      if (dir > 0) {
        if (idx + 1 >= pagerEls.length) return;
        if (rect.bottom > window.innerHeight + 4) return;
        e.preventDefault();
        pageTo(idx + 1);
      } else {
        if (idx - 1 < 0) return;
        if (rect.top < -4) return;
        e.preventDefault();
        pageTo(idx - 1);
      }
    }, { passive: false });
  }

  /* Contact form: open a pre-filled email via mailto */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const CONTACT_EMAIL = 'fernawool@gmail.com';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    const body =
      `Name: ${fullName}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\n${message}`;
    const mailtoUrl =
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
    status.textContent = "Opening your email client — thanks for reaching out!";
    form.reset();
  });
})();
