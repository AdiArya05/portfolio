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
let reduced=false, timer, closingCalls=0;
const events={},classes=new Set();
const dialog={open:false,classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)},addEventListener:(name,fn)=>events[name]=fn,
 showModal(){this.open=true;},close(){this.open=false;events.close();}};
const window={};
vm.runInNewContext(fs.readFileSync(new URL('media-dialog.js',dist),'utf8'),{window,matchMedia:()=>({matches:reduced}),
 setTimeout:(fn,ms)=>{assert.equal(ms,320);timer=fn;return 1;},clearTimeout:()=>{timer=null;}});
const motion=window.PortfolioDialogMotion(dialog,()=>closingCalls++);
motion.open();motion.close();motion.close();
assert.equal(closingCalls,1,'rapid dismissal only emits one sound');assert(dialog.open,'keep top layer during exit');assert(classes.has('is-closing'));
timer();assert(!dialog.open);assert(!classes.has('is-closing'));
motion.open();let prevented=false;events.cancel({preventDefault:()=>prevented=true});assert(prevented);timer();assert(!dialog.open);
reduced=true;motion.open();motion.close();assert(!dialog.open,'reduced motion closes immediately');
for (const route of ['work/catch/index.html','work/soja/index.html','explorations/index.html']) {
 const html=fs.readFileSync(new URL(route,dist),'utf8');
 const consumer=route.startsWith('work/')?'/work/case-study.js':'/explorations/explorations.js';
 assert(html.indexOf('/media-dialog.js')<html.indexOf(consumer),`${route}: dialog controller loads before route handler`);
}
console.log('PASS: immediate warm sounds, shared cold activation, stale/failure recovery, animated dismissal, Escape, repeated close and reduced motion.');
