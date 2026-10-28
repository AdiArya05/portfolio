/* Thumbnail-to-viewer motion. Recent-style 360ms, bounce .15 spring.
   Duration-defined underdamped response, as used by Motion (MIT):
   https://github.com/motiondivision/motion/blob/main/packages/motion-dom/src/animation/generators/spring.ts */
(() => {
  const duration = 360;
  const damping = .85;
  const root = Math.sqrt(1 - damping * damping);
  const frequency = -Math.log(.001 * root / damping) / (damping * duration / 1000);
  const springAt = progress => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    const time = progress * duration / 1000;
    const angle = frequency * root * time;
    return 1 - Math.exp(-damping * frequency * time) * (Math.cos(angle) + damping / root * Math.sin(angle));
  };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const contentBox = element => {
    const rect = element.getBoundingClientRect();
    const width = element.videoWidth || element.naturalWidth || element.width;
    const height = element.videoHeight || element.naturalHeight || element.height;
    if (getComputedStyle(element).objectFit !== 'contain' || !width || !height) return rect;
    const scale = Math.min(rect.width / width,rect.height / height);
    const fittedWidth = width * scale, fittedHeight = height * scale;
    return {left:rect.left+(rect.width-fittedWidth)/2,top:rect.top+(rect.height-fittedHeight)/2,width:fittedWidth,height:fittedHeight,bottom:rect.top+(rect.height+fittedHeight)/2};
  };
  const noClip = [0,0,0,0];
  const create = panel => {
    let animation, detailAnimation, timer, generation = 0, source, sourceVisibility, base, mediaBox;
    const details = panel.querySelector('.modal-details');
    const restoreSource = () => {
      if (source) {
        const video = panel.querySelector('#modal-video:not([hidden])');
        if (source.tagName === 'VIDEO' && video) { try { source.currentTime = video.currentTime; } catch {} }
        source.style.visibility = sourceVisibility;
      }
      source = null;
    };
    const stop = () => {
      generation++;
      clearTimeout(timer);
      animation?.cancel();
      detailAnimation?.cancel();
      animation = detailAnimation = null;
    };
    const run = (from, to, clipFrom, clipTo, done) => {
      stop();
      const id = generation;
      if (reduced() || !panel.animate) { done?.(); return; }
      const frames = Array.from({length:61}, (_,index) => {
        const offset = index / 60, progress = springAt(offset);
        const mix = (start,end) => start + (end-start) * progress;
        const clip = clipFrom.map((value,i) => Math.max(0,mix(value,clipTo[i])));
        return {offset, transform:`translate3d(${mix(from.x,to.x)}px,${mix(from.y,to.y)}px,0) scale(${mix(from.sx,to.sx)},${mix(from.sy,to.sy)})`,clipPath:`inset(${clip.map(value=>`${value}px`).join(' ')} round ${mix(from.radius,to.radius)}px)`};
      });
      panel.classList.add('media-morphing');
      animation = panel.animate(frames,{duration,easing:'linear',fill:'both'});
      const finish = () => {
        if (id !== generation) return;
        clearTimeout(timer);
        panel.classList.remove('media-morphing');
        animation?.cancel();
        detailAnimation?.cancel();
        animation = detailAnimation = null;
        done?.();
      };
      animation.finished.then(finish,()=>{});
      timer = setTimeout(finish,duration+60);
    };
    const identity = radius => ({x:0,y:0,sx:1,sy:1,radius});
    const sourceFrame = () => {
      if (!source?.isConnected || !base?.width || !base.height) return null;
      const rect = contentBox(source);
      if (!rect.width || !rect.height || rect.bottom <= 0 || rect.top >= innerHeight) return null;
      const offsetX = mediaBox.left-base.left, offsetY = mediaBox.top-base.top;
      const sx = rect.width/mediaBox.width, sy = rect.height/mediaBox.height;
      const radius = parseFloat(getComputedStyle(source.closest('.card,.preview-open') || source).borderRadius) || 4;
      return {x:rect.left-base.left-offsetX*sx,y:rect.top-base.top-offsetY*sy,sx,sy,radius:radius/Math.min(sx,sy),clip:[offsetY,base.width-offsetX-mediaBox.width,base.height-offsetY-mediaBox.height,offsetX]};
    };
    return {
      open(origin) {
        stop(); restoreSource();
        source = origin;
        sourceVisibility = source?.style.visibility || '';
        base = panel.getBoundingClientRect();
        const media = panel.querySelector('#modal-image:not([hidden]),#modal-video:not([hidden])') || panel;
        mediaBox = contentBox(media);
        const radius = parseFloat(getComputedStyle(panel).borderRadius) || 0;
        const from = sourceFrame();
        if (!from || reduced()) return;
        source.style.visibility = 'hidden';
        run(from,identity(radius),from.clip,noClip);
        if (details) detailAnimation = details.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,delay:90,easing:'cubic-bezier(.2,0,0,1)',fill:'both'});
      },
      close(done) {
        const style = getComputedStyle(panel);
        const matrix = new DOMMatrixReadOnly(style.transform === 'none' ? undefined : style.transform);
        const from = {x:matrix.e,y:matrix.f,sx:matrix.a,sy:matrix.d,radius:parseFloat(style.borderRadius)||0};
        // A close during entry starts at the currently rendered frame.
        const currentRadius = style.clipPath.match(/round\s+([\d.]+)px/);
        if (currentRadius) from.radius = Number(currentRadius[1]);
        const clipMatch = style.clipPath.match(/^inset\(([^)]+?) round/);
        const clipValues = clipMatch ? clipMatch[1].trim().split(/\s+/).map(parseFloat) : noClip;
        const clipFrom = clipValues.length === 4 ? clipValues : [clipValues[0]||0,clipValues[1]||0,clipValues[2]||clipValues[0]||0,clipValues[3]||clipValues[1]||0];
        if (!animation) {
          base = panel.getBoundingClientRect();
          const media = panel.querySelector('#modal-image:not([hidden]),#modal-video:not([hidden])') || panel;
          mediaBox = contentBox(media);
        }
        const to = sourceFrame();
        const finish = () => { restoreSource(); done(); };
        if (!to || reduced()) { stop(); panel.classList.remove('media-morphing'); finish(); return; }
        const detailOpacity = details ? Number(getComputedStyle(details).opacity) : 0;
        run(from,to,clipFrom,to.clip,finish);
        if (details) detailAnimation = details.animate([{opacity:detailOpacity},{opacity:0}],{duration:140,easing:'ease-out',fill:'both'});
      },
      reset() { stop(); restoreSource(); panel.classList.remove('media-morphing'); },
    };
  };
  window.PortfolioMediaMotion = {create,springAt,duration};
})();
