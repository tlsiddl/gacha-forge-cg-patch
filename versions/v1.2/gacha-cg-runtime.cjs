'use strict';
// Gacha Forge 1.8.12 CG v1.2 policy and prompt hook; independent of the Korean patch.
const {registerHooks}=require('node:module');
const {fileURLToPath}=require('node:url');
const fs=require('node:fs');
const PATH=/\/capability-runtime-snapshots\/gacha-forge-1\.8\.12-[^/]+\/server\.mjs$/;
const BEFORE=[
  "ONE KEY IMAGE (CG). This beat MAY carry one illustrated moment: a single picture that replaces the background while its scene plays, like a gacha visual novel's CG.",
  'If -- and only if -- this beat holds a story-defining moment -- whatever THIS story is built around; a confession, a duel\'s climax, a revelation, a sacrifice, a villain\'s entrance are examples, not the list -- add a top-level "cg" object to the JSON:',
  '- Most beats have NO such moment: omit the field entirely for routine dialogue, travel, exposition, scenery or ordinary tension. An image spent on a lesser scene cheapens the real ones.'
];
const AFTER=[
  'ONE KEY IMAGE (CG). This beat MAY include one illustrated moment: a cinematic picture replacing the background during its story segment. Prefer visually meaningful character-focused scenes. Respect the existing CG frequency limit.',
  'When this beat has a visually memorable moment, especially an important character entrance, first meeting, significant reunion, expressive interaction, two-character composition, emotional tension, confrontation, revelation, or major story event, favor adding a top-level "cg" object to the JSON. The moment need not be a plot climax. When the player protagonist is physically present and meaningfully involved, prioritize compositions including the protagonist alongside other participating characters, especially during actual embraces, hand-holding, assistance, exchange of items, and confrontations. Do not invent protagonist actions, consent, touching, feelings, or participation. Illustrate only characters and actions present in the written segments:',
  '- Omit CG for routine travel, exposition-only dialogue, incidental appearances, repeated compositions, and scenes without a meaningful visual moment. Do not invent contact, romance, actions, or emotions merely to justify an image. When a meaningful character moment exists and a CG is permitted, favor illustrating it rather than omitting it solely because it is not a story-defining climax. If the protagonist is actually visible within the CG moment, use the protagonist name exactly as provided in the cast in cg.characters, with a faithful doing description; do not make the camera protagonist-only or exclude the protagonist merely because another character has the dialogue. Characters not in the frame must not be listed.'
];
const count=(s,needle)=>s.split(needle).length-1;
if(Number(process.versions.node.split('.')[0])<22){
 process.stderr.write('[gacha-cg] Node 22+ required; disabled\n');
}else{
 registerHooks({load(url,context,nextLoad){
  if(!url.startsWith('file:'))return nextLoad(url,context);
  let file;try{file=fileURLToPath(url)}catch{return nextLoad(url,context)}
  if(!PATH.test(file))return nextLoad(url,context);
  const result=nextLoad(url,context);
  const source=result.source==null?fs.readFileSync(file,'utf8'):Buffer.isBuffer(result.source)?result.source.toString('utf8'):String(result.source);
  if(BEFORE.some(v=>count(source,v)!==1)){
   process.stderr.write('[gacha-cg] signature mismatch: CG policy NOT changed; check installed version\n');
   return result;
  }
  let updated=source;
  for(let i=0;i<BEFORE.length;i++)updated=updated.replace(BEFORE[i],AFTER[i]);
  const originalT0="function T0({units:e,scene:t,framing:n=\"banner\"},r){let a=r||{},f=oa(a.promptMode),h=Array.isArray(e)?e.filter(Boolean):[],A=Ee=>Da(ve(Ee&&Ee.sceneAction))?ln(ve(Ee.sceneAction)):\"\",T=E0(h.map(Ee=>xc(Ee,a.promptMode)),h.map(Ee=>ve(Ee&&Ee.identitySex)),h.map(A)),R=Da(ve(t))?ln(ve(t)):\"\",C=Hr(...h.map(Ee=>Qs(Ee))),I=R?\"\":xf(h[0]),D=new Set(Fr(T).map(Ee=>Ee.toLowerCase())),G=Fr(C).filter(Ee=>!D.has(Ee.toLowerCase())).concat(Fr(T)).join(\", \"),W=n!==\"scene\",te=W?\"wide shot, full body, dynamic composition, cinematic lighting, detailed background\":\"\",ie=W?\"A wide banner illustration of \":\"An illustration of \",se=f?g0(G,R,I,te,a.positiveTags):[ve(a.styleText),C?Zn(C):\"\",T?Zn(ie+T):\"\",R?Zn(R):\"\",I?Zn(\"Behind them: \"+I):\"\",W?\"Full body, dynamic composition, cinematic lighting.\":\"\",ve(a.positiveTags)].filter(Boolean).join(\" \"),le=\"portrait, close-up, headshot, cropped, out of frame, extra figures\",Ce=h.length>0&&h.every(Ee=>Ee&&Ee.backView===!0)?\"looking at viewer, facing viewer, front view\":\"\";return{prompt:se,negativePrompt:W?Hr(a.negativeTags,le):Hr(a.negativeTags,Ce)}}";
  const imageAnchor="let x=await Mw(u,g,m);return dt(b,";
  if(count(updated,originalT0)!==1||count(updated,imageAnchor)!==1){
   process.stderr.write('[gacha-cg] v1.2 image pipeline signature mismatch; NO changes applied\\n');
   return result;
  }
  updated=updated.replace(originalT0,"function __gachaCgOriginalT0({units:e,scene:t,framing:n=\"banner\"},r){let a=r||{},f=oa(a.promptMode),h=Array.isArray(e)?e.filter(Boolean):[],A=Ee=>Da(ve(Ee&&Ee.sceneAction))?ln(ve(Ee.sceneAction)):\"\",T=E0(h.map(Ee=>xc(Ee,a.promptMode)),h.map(Ee=>ve(Ee&&Ee.identitySex)),h.map(A)),R=Da(ve(t))?ln(ve(t)):\"\",C=Hr(...h.map(Ee=>Qs(Ee))),I=R?\"\":xf(h[0]),D=new Set(Fr(T).map(Ee=>Ee.toLowerCase())),G=Fr(C).filter(Ee=>!D.has(Ee.toLowerCase())).concat(Fr(T)).join(\", \"),W=n!==\"scene\",te=W?\"wide shot, full body, dynamic composition, cinematic lighting, detailed background\":\"\",ie=W?\"A wide banner illustration of \":\"An illustration of \",se=f?g0(G,R,I,te,a.positiveTags):[ve(a.styleText),C?Zn(C):\"\",T?Zn(ie+T):\"\",R?Zn(R):\"\",I?Zn(\"Behind them: \"+I):\"\",W?\"Full body, dynamic composition, cinematic lighting.\":\"\",ve(a.positiveTags)].filter(Boolean).join(\" \"),le=\"portrait, close-up, headshot, cropped, out of frame, extra figures\",Ce=h.length>0&&h.every(Ee=>Ee&&Ee.backView===!0)?\"looking at viewer, facing viewer, front view\":\"\";return{prompt:se,negativePrompt:W?Hr(a.negativeTags,le):Hr(a.negativeTags,Ce)}}function T0({units:e,scene:t,framing:n=\"banner\"},r){if(n!==\"scene\")return __gachaCgOriginalT0({units:e,scene:t,framing:n},r);const original=__gachaCgOriginalT0({units:e,scene:t,framing:n},r);const profile=r||{},units=Array.isArray(e)?e.filter(Boolean):[];if(!units.length)return original;const scene=Da(ve(t))?ln(ve(t)):\"\";const shared=[ve(profile.styleText),scene,ve(profile.positiveTags)].filter(Boolean).join(\", \");const blocks=units.map((unit,index)=>{const appearance=xc(unit,profile.promptMode).replace(/(^|,\\\\s*)solo(?=,|$)/gi,\"\").replace(/\\\\s*\\\\|\\\\s*/g,\", \").trim().replace(/^,\\\\s*|,\\\\s*$/g,\"\");const action=Da(ve(unit.sceneAction))?ln(ve(unit.sceneAction)):\"\";return [\"Character \"+(index+1)+(ve(unit.name)?\" (\"+ve(unit.name)+\")\":\"\"),appearance,action].filter(Boolean).join(\", \")});return {...original,prompt:[shared,...blocks].filter(Boolean).join(\" | \")}}");
  updated=updated.replace(imageAnchor,"for(const unit of _)if(unit.isProtagonist&&!l(unit.appearance)&&u.protagonist&&l(u.protagonist.appearance))unit.appearance=l(u.protagonist.appearance);let x=await Mw(u,g,m);return dt(b,");
  process.stderr.write('[gacha-cg] CG character-focused selection and pipe-separated CG prompt v1.2 applied in memory\n');
  return {...result,source:updated,shortCircuit:true};
 }});
 process.stderr.write('[gacha-cg] hook registered; waiting for story module load\n');
}
