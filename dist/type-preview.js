/* A query-only comparison: the normal portfolio retains its approved font. */
(() => {
  const options = {
    original:{label:'Original',name:'Space Grotesk',fonts:[]},
    sans:{label:'Sans',name:'Timeless Sans',fonts:['Timeless Sans']},
    serif:{label:'Serif',name:'Timeless Serif',fonts:['Timeless Serif']},
    editorial:{label:'Mixed',name:'Serif + Sans',fonts:['Timeless Sans','Timeless Serif']},
  };
  let choice = new URL(location.href).searchParams.get('type');
  if (!Object.hasOwn(options,choice)) return;
  const root = document.documentElement;
  root.dataset.typePreview = choice;
  let panel,details,currentName;

  function apply(next) {
    choice = next;
    root.dataset.typePreview = choice;
    const url = new URL(location.href);
    url.searchParams.set('type',choice);
    history.replaceState(null,'',url);
    if (panel) {
      currentName.textContent = options[choice].name;
      panel.querySelectorAll('[data-type]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.type === choice)));
      if (matchMedia('(max-width:700px)').matches) details.open = false;
    }
    // Refit the phone paragraph and selection after the chosen font is ready.
    Promise.all(options[choice].fonts.map(font => document.fonts.load(`500 24px "${font}"`)))
      .then(() => window.dispatchEvent(new Event('resize')));
  }

  function followPreview(event) {
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || link.getAttribute('href').startsWith('#')) return;
    const url = new URL(link.href,location.href);
    if (url.origin !== location.origin || !['/','/work/catch','/work/catch/','/work/soja','/work/soja/','/explorations','/explorations/'].includes(url.pathname)) return;
    url.searchParams.set('type',choice);
    link.href = url.href;
  }

  function mount() {
    panel = document.createElement('aside');
    panel.className = 'type-preview';
    panel.setAttribute('aria-label','Typography comparison');
    details = document.createElement('details');
    details.open = !matchMedia('(max-width:700px)').matches;
    const summary = document.createElement('summary');
    summary.append('Typography');
    currentName = document.createElement('span');
    summary.append(currentName);
    const controls = document.createElement('div');
    controls.className = 'type-preview-options';
    controls.setAttribute('role','group');
    controls.setAttribute('aria-label','Compare typefaces');
    for (const [key,option] of Object.entries(options)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.type = key;
      button.textContent = option.label;
      button.setAttribute('aria-label',option.name);
      button.addEventListener('click',() => apply(key));
      controls.append(button);
    }
    details.append(summary,controls);
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'type-preview-close';
    close.setAttribute('aria-label','Exit typography preview');
    close.textContent = '×';
    close.addEventListener('click',() => {
      delete root.dataset.typePreview;
      const url = new URL(location.href);
      url.searchParams.delete('type');
      history.replaceState(null,'',url);
      document.querySelectorAll('a[href]').forEach(link => {
        const target = new URL(link.href,location.href);
        if (target.origin === location.origin && target.searchParams.has('type')) {
          target.searchParams.delete('type');
          link.href = target.href;
        }
      });
      document.removeEventListener('click',followPreview,true);
      panel.remove();
      window.dispatchEvent(new Event('resize'));
    });
    panel.append(details,close);
    document.body.append(panel);
    document.addEventListener('click',followPreview,true);
    apply(choice);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
