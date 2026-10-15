(() => {
  const widget = document.querySelector('#time-zones');
  const button = document.querySelector('#time-zone-toggle');
  const dropdown = document.querySelector('#time-zone-dropdown');
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const aliases = { 'Asia/Calcutta': 'Kolkata', 'UTC': 'UTC', 'Etc/UTC': 'UTC' };
  const localName = aliases[localZone] || localZone.split('/').pop().replaceAll('_', ' ');
  const places = [
    ['Singapore', 'Asia/Singapore'],
    ['NYC', 'America/New_York'],
    ['Vancouver', 'America/Vancouver'],
    ['India', 'Asia/Kolkata']
  ];
  const timeFormat = zone => new Intl.DateTimeFormat('en-GB', {timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23'});
  const offsetFormat = zone => new Intl.DateTimeFormat('en', {timeZone: zone, timeZoneName: 'shortOffset'});
  const getOffset = (format, now) => format.formatToParts(now).find(part => part.type === 'timeZoneName').value.replace('GMT', 'UTC');
  const localFormatter = timeFormat(localZone);
  const localOffset = offsetFormat(localZone);
  const localMatrix = document.querySelector('#local-matrix');
  let localSignature = '';
  const visited = document.querySelector('#visited-time-zones');
  visited.className = 'matrix-board';
  visited.setAttribute('role','img');
  const glyphs = {
    '0':[14,17,19,21,25,17,14], '1':[4,12,4,4,4,4,14],
    '2':[14,17,1,2,4,8,31], '3':[30,1,1,14,1,1,30],
    '4':[2,6,10,18,31,2,2], '5':[31,16,16,30,1,1,30],
    '6':[14,16,16,30,17,17,14], '7':[31,1,2,4,8,8,8],
    '8':[14,17,17,14,17,17,14], '9':[14,17,17,15,1,1,14],
    ':':[0,4,4,0,4,4,0], ' ':[0,0,0,0,0,0,0],
    A:[14,17,17,31,17,17,17], C:[15,16,16,16,16,16,15],
    D:[30,17,17,17,17,17,30], E:[31,16,16,30,16,16,31],
    G:[15,16,16,23,17,17,15], I:[14,4,4,4,4,4,14],
    N:[17,25,25,21,19,19,17], O:[14,17,17,17,17,17,14],
    P:[30,17,17,30,16,16,16], R:[30,17,17,30,20,18,17],
    S:[15,16,16,14,1,1,30], U:[17,17,17,17,17,17,14],
    V:[17,17,17,17,17,10,4], Y:[17,17,10,4,4,4,4],
    B:[30,17,17,30,17,17,30], F:[31,16,16,30,16,16,16],
    H:[17,17,17,31,17,17,17], J:[7,2,2,2,18,18,12],
    K:[17,18,20,24,20,18,17], L:[16,16,16,16,16,16,31],
    M:[17,27,21,21,17,17,17], Q:[14,17,17,17,21,18,13],
    T:[31,4,4,4,4,4,4], W:[17,17,17,21,21,27,17],
    X:[17,17,10,4,10,17,17], Z:[31,1,2,4,8,16,31],
    '-':[0,0,0,31,0,0,0]
  };
  function glyph(character) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 30 44');
    svg.setAttribute('aria-hidden','true');
    const bits = glyphs[character] || glyphs[' '];
    for(let row=0;row<7;row++) for(let col=0;col<5;col++) {
      const dot = document.createElementNS(svg.namespaceURI,'circle');
      dot.setAttribute('cx',String(col*6+3));
      dot.setAttribute('cy',String(row*6+3));
      dot.setAttribute('r','1.95');
      dot.setAttribute('fill','currentColor');
      dot.setAttribute('opacity',bits[row] & (1 << (4-col)) ? '1' : '0.12');
      svg.append(dot);
    }
    return svg;
  }
  const rows = places.map(([name,zone]) => {
    const row = document.createElement('div');
    row.className = 'matrix-row';
    row.setAttribute('aria-hidden','true');
    const cells = Array.from({length:15},() => {
      const cell = document.createElement('span');
      cell.className = 'matrix-cell';
      const reel = document.createElement('span');
      reel.className = 'matrix-reel';
      cell.append(reel);
      row.append(cell);
      return reel;
    });
    visited.append(row);
    return {name,zone,cells,text:' '.repeat(15),formatter:timeFormat(zone),offsetFormatter:offsetFormat(zone)};
  });
  let signature = '';
  function drawBoard(roll = false) {
    const now = new Date();
    const texts = rows.map(row => `${row.formatter.format(now)} ${row.name.toUpperCase()}`.padEnd(15));
    visited.setAttribute('aria-label',rows.map(row => `${row.name}: ${row.formatter.format(now)}, ${getOffset(row.offsetFormatter,now)}`).join('; '));
    const nextSignature = texts.join('|');
    if(!roll && signature === nextSignature) return;
    signature = nextSignature;
    const animate = roll && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alphabet = '0123456789ACDEGINOPRSUVY';
    rows.forEach((row,rowIndex) => {
      row.cells.forEach((reel,column) => {
        reel.getAnimations().forEach(animation => animation.cancel());
        const char = texts[rowIndex][column];
        if(!animate || char===' ' || char===':') {reel.replaceChildren(glyph(char));return;}
        reel.replaceChildren(glyph(row.text[column]),glyph(alphabet[Math.floor(Math.random()*alphabet.length)]),glyph(alphabet[Math.floor(Math.random()*alphabet.length)]),glyph(char));
        const animation = reel.animate([{transform:'translateY(0)'},{transform:'translateY(-75%)'}],{
          duration:600,delay:column*14+rowIndex*45,easing:'cubic-bezier(0.16,1,0.3,1)',fill:'forwards'
        });
        animation.onfinish = () => {reel.replaceChildren(glyph(char));animation.cancel();};
      });
      row.text = texts[rowIndex];
    });
  }
  function update() {
    const now = new Date();
    const value = localFormatter.format(now);
    const offset = getOffset(localOffset,now);
    const localText = `${value} ${localName.toUpperCase()}`.slice(0,24).padEnd(15);
    if (localSignature !== localText) {
      localSignature = localText;
      localMatrix.replaceChildren(...[...localText].map(character => {
        const cell = document.createElement('span');
        cell.className = 'matrix-cell';
        cell.append(glyph(character));
        return cell;
      }));
    }
    button.setAttribute('aria-label', `${localName}, ${value}, ${offset}. Show world times.`);
    drawBoard();
  }
  let pinned = false;
  function setOpen(open) {
    const wasOpen = widget.classList.contains('is-open');
    widget.classList.toggle('is-open',open);
    button.setAttribute('aria-expanded',String(open));
    dropdown.inert = !open;
    if(open && !wasOpen) {
      drawBoard(true);
      window.dispatchEvent(new Event('portfolio-clock-hover'));
    }
  }
  widget.addEventListener('pointerenter',event => {if(event.pointerType !== 'touch') setOpen(true);});
  widget.addEventListener('pointerleave',() => {if(!pinned && !widget.contains(document.activeElement)) setOpen(false);});
  widget.addEventListener('focusin',() => setOpen(true));
  widget.addEventListener('focusout',event => {if(!pinned && !widget.contains(event.relatedTarget)) setOpen(false);});
  button.addEventListener('click',() => {pinned = !pinned; setOpen(pinned);});
  document.addEventListener('pointerdown',event => {if(!widget.contains(event.target)) {pinned=false;setOpen(false);}});
  document.addEventListener('keydown',event => {if(event.key==='Escape') {pinned=false;setOpen(false);}});
  update();
  setInterval(update,1000);
})();
