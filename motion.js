(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  const play = (element, frames, duration) => {
    if (preference.matches || typeof element.animate !== 'function') return;
    const animation = element.animate(frames, {
      duration,
      easing: 'cubic-bezier(.2,.65,.3,1)'
    });
    running.add(animation);
    animation.finished.then(() => running.delete(animation), () => running.delete(animation));
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (entry.boundingClientRect.top < 0) return;
        play(entry.target, [
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], 420);
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -24px 0px' });
    document.querySelectorAll('.section-intro, .story-card, .schools-heading, .school-card, .school-request, .counselor-section, .home-support')
      .forEach(element => observer.observe(element));
  }

  document.querySelectorAll('.grade-picker > input').forEach(input => {
    input.addEventListener('change', () => {
      if (!input.checked) return;
      const panel = document.querySelector(`.panel-${input.id.replace('grade-', '')}`);
      if (!panel) return;
      panel.getAnimations().forEach(animation => animation.cancel());
      play(panel, [
        { opacity: 0.45, transform: 'translateY(4px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], 180);
    });
  });

  preference.addEventListener('change', () => {
    if (!preference.matches) return;
    running.forEach(animation => animation.cancel());
    running.clear();
  });
})();
