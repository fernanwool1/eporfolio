document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('instrumentsTrack');
  if (!track) return;

  const prevBtn = document.getElementById('instrumentsPrev');
  const nextBtn = document.getElementById('instrumentsNext');
  const scrollStep = () => Math.min(track.clientWidth * 0.6, 420);

  prevBtn && prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -scrollStep(), behavior: 'smooth' });
  });
  nextBtn && nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: scrollStep(), behavior: 'smooth' });
  });

  track.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    track.scrollLeft += e.deltaY;
  }, { passive: false });

  let isDragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragMoved = false;

  track.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragMoved = false;
    dragStartX = e.pageX;
    dragStartScroll = track.scrollLeft;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const delta = e.pageX - dragStartX;
    if (Math.abs(delta) > 4) dragMoved = true;
    track.scrollLeft = dragStartScroll - delta;
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  track.addEventListener('click', (e) => {
    if (dragMoved) { e.preventDefault(); e.stopPropagation(); }
  }, true);
});
