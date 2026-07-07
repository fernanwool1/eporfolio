(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Language toggle: each toggle group controls its nearest [data-lang] ancestor,
     so this works on the poetry hub page and on individual poem pages alike */
  document.querySelectorAll('.lang-toggle').forEach(group => {
    const scope = group.closest('[data-lang]');
    if (!scope) return;
    const buttons = group.querySelectorAll('.lang-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        scope.dataset.lang = btn.dataset.lang;
        buttons.forEach(b => b.classList.toggle('is-active', b === btn));
      });
    });
  });

  /* Floating card fan: click/tap/keyboard opens a card to reveal its description */
  const fan = document.getElementById('poemFan');
  if (fan) {
    const cards = Array.from(fan.querySelectorAll('.poem-card'));
    let activeCard = null;

    const setActive = (card) => {
      if (activeCard === card) return;
      if (activeCard) activeCard.classList.remove('is-active');
      activeCard = card;
      card.classList.add('is-active');
    };

    const clearActive = () => {
      if (!activeCard) return;
      activeCard.classList.remove('is-active');
      activeCard = null;
    };

    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        setActive(card);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActive(card);
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!fan.contains(e.target) && !e.target.closest('.lang-toggle')) clearActive();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') clearActive();
    });

    if (prefersReducedMotion) {
      cards.forEach(card => {
        const float = card.querySelector('.poem-card-float');
        if (float) float.style.animation = 'none';
      });
    }
  }

  /* Poems library: filter rows by theme category */
  const libraryFilters = document.getElementById('libraryFilters');
  const libraryList = document.getElementById('libraryList');
  if (libraryFilters && libraryList) {
    const rows = Array.from(libraryList.querySelectorAll('.library-row-wrap'));
    libraryFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.library-filter');
      if (!btn) return;
      libraryFilters.querySelectorAll('.library-filter').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.dataset.filter;
      rows.forEach(row => {
        const categories = (row.dataset.categories || '').split(' ');
        const show = filter === 'all' || categories.includes(filter);
        row.classList.toggle('is-hidden', !show);
      });
    });
  }

  /* Poems library: like button + like-based sorting.
     Likes are stored per-browser in localStorage; rows with more likes
     float to the top, ties fall back to the original library order. */
  if (libraryList) {
    const STORAGE_KEY = 'poemLikes';
    const loadLikes = () => {
      try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {}; }
      catch (e) { return {}; }
    };
    const saveLikes = (data) => {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
      catch (e) { /* localStorage unavailable — likes just won't persist */ }
    };

    let likes = loadLikes();
    const rows = Array.from(libraryList.querySelectorAll('.library-row-wrap'));
    rows.forEach((row, i) => { row.dataset.order = i; });

    const getCount = (id) => (likes[id] && likes[id].count) || 0;
    const isLiked = (id) => !!(likes[id] && likes[id].liked);

    const renderLikes = () => {
      rows.forEach(row => {
        const id = row.dataset.poemId;
        const btn = row.querySelector('.library-row-like');
        if (!btn) return;
        btn.querySelector('.library-row-like-count').textContent = getCount(id);
        const liked = isLiked(id);
        btn.classList.toggle('is-liked', liked);
        btn.setAttribute('aria-pressed', String(liked));
      });
    };

    const sortRows = (animate) => {
      let firstRects = null;
      if (animate && !prefersReducedMotion) {
        firstRects = new Map(rows.map(row => [row, row.getBoundingClientRect()]));
      }

      const sorted = [...rows].sort((a, b) => {
        const diff = getCount(b.dataset.poemId) - getCount(a.dataset.poemId);
        return diff !== 0 ? diff : Number(a.dataset.order) - Number(b.dataset.order);
      });
      sorted.forEach(row => libraryList.appendChild(row));
      const moreEl = libraryList.querySelector('.library-more');
      if (moreEl) libraryList.appendChild(moreEl);

      if (firstRects) {
        sorted.forEach(row => {
          const first = firstRects.get(row);
          const last = row.getBoundingClientRect();
          const dy = first.top - last.top;
          if (!dy) return;
          row.style.transition = 'none';
          row.style.transform = `translateY(${dy}px)`;
          requestAnimationFrame(() => {
            row.style.transition = 'transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)';
            row.style.transform = '';
          });
        });
      }
    };

    libraryList.addEventListener('click', (e) => {
      const btn = e.target.closest('.library-row-like');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const id = btn.dataset.poemId;
      const current = likes[id] || { count: 0, liked: false };
      if (current.liked) {
        current.count = Math.max(0, current.count - 1);
        current.liked = false;
      } else {
        current.count += 1;
        current.liked = true;
      }
      likes[id] = current;
      saveLikes(likes);
      renderLikes();
      sortRows(true);
    });

    renderLikes();
    sortRows(false);
  }
})();
