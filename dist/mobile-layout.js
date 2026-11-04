(() => {
  const mobile = matchMedia('(max-width:700px)');
  const root = document.documentElement;
  const story = document.querySelector('.story');
  const intro = document.querySelector('#intro-heading');
  const widget = document.querySelector('#time-zones');
  const theme = document.querySelector('#theme-toggle');
  let frame = 0;

  function fit() {
    frame = 0;
    if (!mobile.matches) {
      ['--mobile-story-top','--mobile-intro-size','--mobile-intro-leading'].forEach(name=>root.style.removeProperty(name));
      story.style.overflowY = '';
      return;
    }
    const headerBottom = Math.max(theme.getBoundingClientRect().bottom,
      widget.querySelector('button').getBoundingClientRect().bottom);
    // The clock is an overlay: opening it must never reflow the paragraph.
    const top = headerBottom+20;
    root.style.setProperty('--mobile-story-top',`${Math.ceil(top)}px`);
    const style = getComputedStyle(story);
    const notes = story.querySelector('.notes-links');
    const notesHeight = notes ? notes.getBoundingClientRect().height + parseFloat(getComputedStyle(notes).marginTop) : 0;
    const available = Math.max(80,story.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom)-notesHeight-3);
    root.style.setProperty('--mobile-intro-leading','1.68');
    let low = 12;
    let high = Math.min(36,innerWidth*.09);
    // Fit once per layout change, never on a continuously running animation.
    for(let i=0;i<11;i++) {
      const size=(low+high)/2;
      root.style.setProperty('--mobile-intro-size',`${size}px`);
      const fitsWidth = intro.scrollWidth <= intro.clientWidth;
      if(intro.getBoundingClientRect().height<=available && fitsWidth) low=size; else high=size;
    }
    root.style.setProperty('--mobile-intro-size',`${low}px`);
    // Fill the remaining room with uniform leading, never sentence gaps.
    let leadingLow = 1.68;
    let leadingHigh = Math.max(leadingLow, available / low);
    for(let i=0;i<14;i++) {
      const leading = (leadingLow + leadingHigh) / 2;
      root.style.setProperty('--mobile-intro-leading', `${leading}`);
      if(intro.getBoundingClientRect().height <= available) leadingLow = leading;
      else leadingHigh = leading;
    }
    root.style.setProperty('--mobile-intro-leading', `${leadingLow}`);
    // One line-height throughout; size fits both the height and unbroken link rows.
    // Very short landscape viewports retain access to all text, never clipping it.
    story.style.overflowY=story.scrollHeight>story.clientHeight+3?'auto':'hidden';
  }
  function schedule() {if(!frame) frame=requestAnimationFrame(fit);}
  window.addEventListener('resize',schedule,{passive:true});
  window.visualViewport?.addEventListener('resize',schedule,{passive:true});
  mobile.addEventListener('change',schedule);
  document.fonts.ready.then(schedule);
  schedule();
})();
