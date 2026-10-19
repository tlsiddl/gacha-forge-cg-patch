'use strict';
// Gacha Forge 1.8.12 CG policy hook; independent of the Korean patch.
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
  'When this beat has a visually memorable moment, especially an important character entrance, first meeting, significant reunion, expressive interaction, two-character composition, emotional tension, confrontation, revelation, or major story event, favor adding a top-level "cg" object to the JSON. The moment need not be a plot climax. Illustrate only characters and actions present in the written segments:',
  '- Omit CG for routine travel, exposition-only dialogue, incidental appearances, repeated compositions, and scenes without a meaningful visual moment. Do not invent contact, romance, actions, or emotions merely to justify an image. When a meaningful character moment exists and a CG is permitted, favor illustrating it rather than omitting it solely because it is not a story-defining climax.'
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
  process.stderr.write('[gacha-cg] CG character-focused selection policy applied in memory\n');
  return {...result,source:updated,shortCircuit:true};
 }});
 process.stderr.write('[gacha-cg] hook registered; waiting for story module load\n');
}
