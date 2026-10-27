import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dist = new URL('../dist/', import.meta.url);
for (const file of ['index.html', 'interface-sounds.js']) {
  const source = fs.readFileSync(new URL(file, dist), 'utf8');
  const from = source.indexOf('function getAudioContext()');
  const to = source.indexOf("['pointerdown'", source.indexOf('function scheduleAudioEffect(', from));
  let now = 0, resumes = 0, resolveResume, rejectResume, options;
  const context = {state:'running',resume() {
    resumes++;
    return new Promise((resolve,reject) => {resolveResume = () => {context.state='running';resolve();}; rejectResume=reject;});
  }};
  const sandbox = {window:{AudioContext:function(input){options=input;return context;}},
    document:{documentElement:{dataset:{}}},navigator:{userActivation:{hasBeenActive:true}},performance:{now:()=>now}};
  vm.createContext(sandbox);
  vm.runInContext(`let audioContext = null, audioResumePromise = null;${source.slice(from,to)}`, sandbox);
  const schedule = sandbox.scheduleAudioEffect;
  let played = 0;
  schedule(() => played++);
  assert.equal(played,1,`${file}: warm effects must start synchronously`);
  assert.equal(options.latencyHint,'interactive');
  context.state='suspended';
  schedule(() => played++);schedule(() => played++);
  assert.equal(resumes,1,`${file}: suspended effects share a resume`);
  resolveResume();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(played,3);
  context.state='suspended';schedule(() => played++);now=601;resolveResume();
  await new Promise(resolve=>setImmediate(resolve));assert.equal(played,3,'discard stale sound after delayed activation');
  context.state='suspended';schedule(() => played++);rejectResume(new Error('blocked'));
  await new Promise(resolve=>setImmediate(resolve));assert.equal(played,3,'failed resume is silent and recoverable');
  schedule(() => played++);resolveResume();await new Promise(resolve=>setImmediate(resolve));assert.equal(played,4);
}
let finishClose, closingCalls=0, resets=0;
const events={},classes=new Set();
const dialog={open:false,classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},addEventListener:(name,fn)=>events[name]=fn,
 showModal(){this.open=true;},close(){this.open=false;events.close();}};
const window={PortfolioMediaMotion:{create:()=>({open(){},close(done){finishClose=done;},reset(){resets++;}})}};
vm.runInNewContext(fs.readFileSync(new URL('media-dialog.js',dist),'utf8'),{window});
const motion=window.PortfolioDialogMotion(dialog,()=>closingCalls++);
motion.open();motion.close();motion.close();
assert.equal(closingCalls,1,'rapid dismissal only emits one sound');assert(dialog.open,'keep top layer during exit');assert(classes.has('is-closing'));
finishClose();assert(!dialog.open);assert(!classes.has('is-closing'));assert.equal(resets,1);
motion.open();let prevented=false;events.cancel({preventDefault:()=>prevented=true});assert(prevented);finishClose();assert(!dialog.open);
// Exercise the actual spring and its cancellation/cleanup with a lightweight WAAPI model.
let reduce=false, latestTimer, sourceBox={left:800,top:200,width:200,height:150,bottom:350};
const animations=[], source={isConnected:true,style:{visibility:''},getBoundingClientRect:()=>sourceBox,closest:()=>null};
const panelClasses=new Set();
const panel={style:{},querySelector:()=>null,classList:{add:x=>panelClasses.add(x),remove:x=>panelClasses.delete(x)},
 getBoundingClientRect:()=>({left:200,top:80,width:800,height:600}),
 animate(frames,options){const animation={frames,options,cancelled:false,finished:new Promise(()=>{}),cancel(){this.cancelled=true;}};animations.push(animation);return animation;}};
vm.runInNewContext(fs.readFileSync(new URL('media-motion.js',dist),'utf8'),{window,innerHeight:900,
 matchMedia:()=>({matches:reduce}),getComputedStyle:()=>({transform:'none',borderRadius:'20px',clipPath:'none',objectFit:'contain'}),
 DOMMatrixReadOnly:function(){return {a:1,d:1,e:0,f:0};},setTimeout:fn=>{latestTimer=fn;return 1;},clearTimeout(){}});
assert.equal(window.PortfolioMediaMotion.duration,450);
assert.equal(window.PortfolioMediaMotion.springAt(0),0);assert.equal(window.PortfolioMediaMotion.springAt(1),1);
assert(window.PortfolioMediaMotion.springAt(.2)>.3,'respond immediately rather than easing in slowly');
let completed=0;const morph=window.PortfolioMediaMotion.create(panel);
morph.open(source);assert.equal(source.style.visibility,'hidden');assert.equal(animations[0].frames.length,61);
assert(animations[0].frames[0].transform.includes('600px,120px'));assert.equal(animations[0].options.duration,450);
const staleFinish=latestTimer;
morph.close(()=>completed++);assert(animations[0].cancelled);staleFinish();assert.equal(completed,0,'cancelled opening cannot finish a closing transition');
latestTimer();assert.equal(completed,1);assert.equal(source.style.visibility,'');
reduce=true;morph.open(source);morph.close(()=>completed++);assert.equal(completed,2,'reduced motion completes immediately');
reduce=false;morph.open(source);sourceBox={...sourceBox,top:-600,bottom:-450};morph.close(()=>completed++);assert.equal(completed,3,'offscreen origin closes without a broken flight');
assert.equal(source.style.visibility,'');
// A portrait recording inside a wide viewer must not squash as it leaves its tile.
sourceBox={left:800,top:200,width:200,height:200*4/3,bottom:200+200*4/3};
source.width=1080;source.height=1440;
const fittedVideo={width:1080,height:1440,getBoundingClientRect:()=>({left:200,top:80,width:800,height:500,bottom:580})};
panel.querySelector=selector=>selector.includes('#modal-')?fittedVideo:null;
const videoMorph=window.PortfolioMediaMotion.create(panel);videoMorph.open(source);
const scales=animations.at(-1).frames[0].transform.match(/scale\(([^,]+),([^\)]+)\)/);
assert(Math.abs(Number(scales[1])-Number(scales[2]))<1e-10,'letterboxed video retains its aspect ratio at the thumbnail');
videoMorph.reset();assert.equal(source.style.visibility,'');
for (const route of ['work/catch/index.html','work/soja/index.html','explorations/index.html']) {
 const html=fs.readFileSync(new URL(route,dist),'utf8');
 const consumer=route.startsWith('work/')?'/work/case-study.js':'/explorations/explorations.js';
 assert(html.indexOf('/media-motion.js')<html.indexOf('/media-dialog.js'),'spring must load before native adapter');
 assert(html.indexOf('/media-dialog.js')<html.indexOf(consumer),`${route}: dialog controller loads before route handler`);
}
console.log('PASS: immediate warm sounds, shared cold activation, stale/failure recovery, thumbnail spring, cancellation, source restoration, Escape and reduced motion.');
