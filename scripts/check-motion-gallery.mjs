import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const events = new Map();
const reduced = { matches:false, addEventListener:(_, fn) => events.set('reduced',fn) };
const navigator = { connection:{saveData:false} };
const makeVideo = name => {
  const listeners = {};
  const button = { dataset:{}, addEventListener:(name,fn) => listeners[`button.${name}`]=fn, setAttribute(){} };
  return {
    dataset:{src:`/media/${name}.mp4`,name}, paused:true, muted:false, loads:0,
    closest:() => ({querySelector:() => button}),
    addEventListener:(name,fn) => listeners[name]=fn,
    hasAttribute(name) { return !!this[name]; },
    load() { this.loads++; },
    play() { this.paused=false; listeners.playing?.(); return Promise.resolve(); },
    pause() { this.paused=true; listeners.pause?.(); },
    toggle() { listeners['button.click']({stopPropagation(){}}); },
  };
};
const videos = [makeVideo('income'),makeVideo('other'),makeVideo('income')];
const document = { hidden:false, querySelectorAll:() => videos, addEventListener:(name,fn) => events.set(name,fn) };
let observe;
vm.runInNewContext(fs.readFileSync(new URL('../dist/motion-gallery.js',import.meta.url),'utf8'), {
  document,navigator,matchMedia:() => reduced,
  window:{addEventListener:(name,fn) => events.set(name,fn)},
  IntersectionObserver:class { constructor(fn) { observe=fn; } observe(){} },
});
const visibility = (video,on) => observe([{target:video,isIntersecting:on,intersectionRatio:on ? 1 : 0}]);
assert(videos.every(video => video.loads===0 && video.muted), 'No eager video downloads; always silent');
visibility(videos[0],true);
assert(!videos[0].paused && videos[0].loads===1);
assert(videos[1].paused && videos[1].loads===0, 'Offscreen recordings stay unloaded');
events.get('portfolio-media-state')({detail:{open:true}});
assert(videos[0].paused, 'Pause reel when full preview opens');
events.get('portfolio-media-state')({detail:{open:false}});
assert(!videos[0].paused);
videos[0].toggle();
visibility(videos[2],true);
assert(videos[0].paused && videos[2].paused, 'Keep a user pause across infinite reel copies');
videos[2].toggle();
assert(!videos[0].paused && !videos[2].paused);
visibility(videos[0],false);
assert(videos[0].paused && !videos[2].paused, 'Only visible copies play');
document.hidden=true; events.get('visibilitychange')();
assert(videos.every(video=>video.paused));
document.hidden=false; events.get('visibilitychange')();
assert(!videos[2].paused);
reduced.matches=true; events.get('reduced')();
visibility(videos[1],true);
assert(videos[1].paused && videos[1].loads===0, 'Reduced motion starts with a static poster');
videos[1].toggle();
assert(!videos[1].paused, 'Reduced motion still allows intentional playback');
visibility(videos[1],false);
assert(videos[1].paused);
console.log('PASS: video visibility, lazy loading, modal pause, explicit controls, loop copies, hidden tabs and reduced motion.');
