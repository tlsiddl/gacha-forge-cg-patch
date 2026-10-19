'use strict';
// Standalone CG-only pipe separator for Gacha Forge 1.8.12.
// Install as --require=/app/gacha-cg-pipe-runtime.cjs. Do not combine with integrated CG v1.2.
const {registerHooks}=require('node:module');
const {fileURLToPath}=require('node:url');
const fs=require('node:fs');
const PATH=/\/capability-runtime-snapshots\/gacha-forge-1\.8\.12-[^/]+\/server\.mjs$/;
const ORIGINAL="function T0({units:e,scene:t,framing:n=\"banner\"},r){let a=r||{},f=oa(a.promptMode),h=Array.isArray(e)?e.filter(Boolean):[],A=Ee=>Da(ve(Ee&&Ee.sceneAction))?ln(ve(Ee.sceneAction)):\"\",T=E0(h.map(Ee=>xc(Ee,a.promptMode)),h.map(Ee=>ve(Ee&&Ee.identitySex)),h.map(A)),R=Da(ve(t))?ln(ve(t)):\"\",C=Hr(...h.map(Ee=>Qs(Ee))),I=R?\"\":xf(h[0]),D=new Set(Fr(T).map(Ee=>Ee.toLowerCase())),G=Fr(C).filter(Ee=>!D.has(Ee.toLowerCase())).concat(Fr(T)).join(\", \"),W=n!==\"scene\",te=W?\"wide shot, full body, dynamic composition, cinematic lighting, detailed background\":\"\",ie=W?\"A wide banner illustration of \":\"An illustration of \",se=f?g0(G,R,I,te,a.positiveTags):[ve(a.styleText),C?Zn(C):\"\",T?Zn(ie+T):\"\",R?Zn(R):\"\",I?Zn(\"Behind them: \"+I):\"\",W?\"Full body, dynamic composition, cinematic lighting.\":\"\",ve(a.positiveTags)].filter(Boolean).join(\" \"),le=\"portrait, close-up, headshot, cropped, out of frame, extra figures\",Ce=h.length>0&&h.every(Ee=>Ee&&Ee.backView===!0)?\"looking at viewer, facing viewer, front view\":\"\";return{prompt:se,negativePrompt:W?Hr(a.negativeTags,le):Hr(a.negativeTags,Ce)}}";
const REPLACEMENT="function __gachaCgOriginalT0({units:e,scene:t,framing:n=\"banner\"},r){let a=r||{},f=oa(a.promptMode),h=Array.isArray(e)?e.filter(Boolean):[],A=Ee=>Da(ve(Ee&&Ee.sceneAction))?ln(ve(Ee.sceneAction)):\"\",T=E0(h.map(Ee=>xc(Ee,a.promptMode)),h.map(Ee=>ve(Ee&&Ee.identitySex)),h.map(A)),R=Da(ve(t))?ln(ve(t)):\"\",C=Hr(...h.map(Ee=>Qs(Ee))),I=R?\"\":xf(h[0]),D=new Set(Fr(T).map(Ee=>Ee.toLowerCase())),G=Fr(C).filter(Ee=>!D.has(Ee.toLowerCase())).concat(Fr(T)).join(\", \"),W=n!==\"scene\",te=W?\"wide shot, full body, dynamic composition, cinematic lighting, detailed background\":\"\",ie=W?\"A wide banner illustration of \":\"An illustration of \",se=f?g0(G,R,I,te,a.positiveTags):[ve(a.styleText),C?Zn(C):\"\",T?Zn(ie+T):\"\",R?Zn(R):\"\",I?Zn(\"Behind them: \"+I):\"\",W?\"Full body, dynamic composition, cinematic lighting.\":\"\",ve(a.positiveTags)].filter(Boolean).join(\" \"),le=\"portrait, close-up, headshot, cropped, out of frame, extra figures\",Ce=h.length>0&&h.every(Ee=>Ee&&Ee.backView===!0)?\"looking at viewer, facing viewer, front view\":\"\";return{prompt:se,negativePrompt:W?Hr(a.negativeTags,le):Hr(a.negativeTags,Ce)}}function T0({units:e,scene:t,framing:n=\"banner\"},r){if(n!==\"scene\")return __gachaCgOriginalT0({units:e,scene:t,framing:n},r);const original=__gachaCgOriginalT0({units:e,scene:t,framing:n},r);const profile=r||{},units=Array.isArray(e)?e.filter(Boolean):[];if(!units.length)return original;const scene=Da(ve(t))?ln(ve(t)):\"\";const shared=[ve(profile.styleText),scene,ve(profile.positiveTags)].filter(Boolean).join(\", \");const blocks=units.map((unit,index)=>{const appearance=xc(unit,profile.promptMode).replace(/(^|,\\s*)solo(?=,|$)/gi,\"\").replace(/\\s*\\\\|\\s*/g,\", \").trim().replace(/^,\\s*|,\\s*$/g,\"\");const action=Da(ve(unit.sceneAction))?ln(ve(unit.sceneAction)):\"\";return [\"Character \"+(index+1)+(ve(unit.name)?\" (\"+ve(unit.name)+\")\":\"\"),appearance,action].filter(Boolean).join(\", \")});return {...original,prompt:[shared,...blocks].filter(Boolean).join(\" | \")}}";
const count=(s,v)=>s.split(v).length-1;
if(Number(process.versions.node.split('.')[0])<22){
 process.stderr.write('[gacha-cg-pipe] Node 22+ required; disabled\\n');
}else{
 registerHooks({load(url,context,nextLoad){
  if(!url.startsWith('file:'))return nextLoad(url,context);
  let file;try{file=fileURLToPath(url)}catch{return nextLoad(url,context)}
  if(!PATH.test(file))return nextLoad(url,context);
  const result=nextLoad(url,context);
  const source=result.source==null?fs.readFileSync(file,'utf8'):Buffer.isBuffer(result.source)?result.source.toString('utf8'):String(result.source);
  if(count(source,ORIGINAL)!==1){
   process.stderr.write('[gacha-cg-pipe] signature mismatch; no modification\\n');
   return result;
  }
  process.stderr.write('[gacha-cg-pipe] pipe-separated story CG prompt enabled\\n');
  return {...result,source:source.replace(ORIGINAL,REPLACEMENT),shortCircuit:true};
 }});
 process.stderr.write('[gacha-cg-pipe] hook registered\\n');
}
