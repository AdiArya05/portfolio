import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const html=fs.readFileSync(path.resolve(import.meta.dirname,'../dist/index.html'),'utf8');
const cards=[...html.matchAll(/<article class="card"[\s\S]*?<\/article>/g)];
const rail=html.match(/<div class="reel-progress" id="reel-progress" aria-hidden="true">([\s\S]*?)<\/div>/);
assert(rail,'Restore the original decorative progress indicator');
assert.equal((rail[1].match(/<span>/g)||[]).length,cards.length);
assert(!html.includes('reel-preview') && !html.includes('previewGallery('),'Remove text previews and navigator hover behavior');
assert(!html.includes('project-notes-heading'),'Keep the two project tabs without a heading');
const match=html.match(/      function updateProgress\([^)]*\) \{[\s\S]*?\n      \}/);
assert(match);
const starts=[0,400,870,1270,1690,2100,2510];
const dots=cards.map(()=>({classes:new Set(),classList:{toggle(name,on){on?this.owner.classes.add(name):this.owner.classes.delete(name);}}}));
dots.forEach(dot=>dot.classList.owner=dot);
const context=vm.createContext({loopStart:500,loopPoint:2870,galleryCardStarts:starts,galleryActiveIndex:-1,progressDots:dots,gallery:{scrollTop:500}});
vm.runInContext(match[0],context);
for(const [top,index] of [[500,0],[1370,2],[1770,3],[3010,6],[3370,0],[499,6],[5880,6]]){
 context.gallery.scrollTop=top;context.updateProgress();
 assert.equal(context.galleryActiveIndex,index);
 assert.equal(dots.filter(dot=>dot.classes.has('is-active')).length,1);
 assert(dots[index].classes.has('is-active'));
}
assert(html.includes("gallery.contains(document.activeElement)"),'Keep the keyboard pause for gallery media');
console.log('PASS: original passive progress bars; correct card/loop tracking; no scroll text popups; project tabs without a heading.');
