document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('projectsGrid');
  const slot = document.getElementById('featuredSlot');
  const pool = document.getElementById('featuredPool');
  if (!grid || !slot || !pool) return;

  function showFeatured(id, opts) {
    const scroll = !opts || opts.scroll !== false;

    const currentFeatured = slot.firstElementChild;
    if (currentFeatured) {
      const prevId = currentFeatured.dataset.project;
      if (prevId === id) return;
      currentFeatured.hidden = true;
      pool.appendChild(currentFeatured);
      const prevCard = pool.querySelector(`.project-card[data-project="${prevId}"]`);
      if (prevCard) {
        prevCard.hidden = false;
        grid.appendChild(prevCard);
      }
    }

    const card = grid.querySelector(`.project-card[data-project="${id}"]`);
    const featured = pool.querySelector(`.project-featured[data-project="${id}"]`);
    if (!featured) return;

    if (card) {
      card.hidden = true;
      pool.appendChild(card);
    }
    featured.hidden = false;
    slot.appendChild(featured);

    if (scroll) {
      slot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  grid.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-project-trigger]');
    if (!trigger) return;
    showFeatured(trigger.dataset.projectTrigger);
  });

  const hashId = (window.location.hash || '').replace('#', '');
  if (hashId && grid.querySelector(`.project-card[data-project="${hashId}"]`)) {
    showFeatured(hashId, { scroll: false });
  }
});
