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
})();
