
(() => {
"use strict";

/*
 ANÁLISE BETA V6.1
 Atualização da V6.0

 AJUSTES:
 - 12 motores com leitura de direção
 - Crescente e decrescente numérico
 - Direção física horária e anti-horária
 - Saltos curtos, médios e grandes
 - Aceleração e desaceleração dos saltos
 - Espelho e antiespelho: perto / longe
 - Ausência das quatro regiões
 - Sinais aplicados ANTES da geração dos centros
 - Treinador reavaliado a cada giro
 - Troca de adaptativa obrigatória até 3 giros
 - Gale congelado até o encerramento
 - Histórico numérico completo e persistente
 - Histórico de resultados independente da estratégia
 - 28 números: 5 blocos de 5 + 1 bloco de 3
*/

const VERSION="6.1";
const KEY="ANALISE_BETA_V61";
const OLD_KEYS=[
"ANALISE_BETA_V60",
"ANALISE_BETA_V59",
"ANALISE_BETA_V55_COMPLETO"
];

const W=[
32,15,19,4,21,2,25,17,34,6,
27,13,36,11,30,8,23,10,5,24,
16,33,1,20,14,31,9,22,18,29,
7,28,12,35,3,26,0
];

const RED=new Set([
1,3,5,7,9,12,14,16,18,
19,21,23,25,27,30,32,34,36
]);

const FAMILIES=[
"NORMAL",
"DINAMICO",
"RX_NORMAL",
"RX_DINAMICO"
];

const RADII=[4,5,6];

const SECTORS={
TIERS:[27,13,36,11,30,8,23,10,5,24,16,33],
ORFAOS:[17,34,6,1,20,14,31,9],
VOISINS:[22,18,29,7,25,2,21,4,19],
ZERO:[28,12,35,3,26,0,32,15]
};

const SECTOR_ORDER=[
"TIERS","ORFAOS","VOISINS","ZERO"
];

const MIRROR_BASE=[
11,12,13,21,22,23,31,32,33
];

const ADAPTATIVES=[
["A01",10,.05,6,12,0,0,0,false,3],
["A02",10,.10,6,12,0,0,0,false,3],
["A03",10,.15,6,12,0,0,0,false,3],
["A04",20,.05,10,12,0,0,0,false,3],
["A05",20,.10,10,12,0,0,0,false,3],
["A06",20,.15,10,12,0,0,0,false,3],
["A07",30,.05,12,12,0,0,0,false,3],
["A08",30,.10,12,12,0,0,0,false,3],
["A09",20,.08,10,12,.025,0,.4,true,2],
["A10",30,.12,12,6,.02,.04,.3,false,3],
["A11",20,.10,10,4,.03,.05,.5,true,3],
["A12",30,.08,12,8,.015,.08,.35,true,2]
].map(x=>({
id:x[0],
name:"ADAPTATIVA "+x[0].slice(1),
window:x[1],
margin:x[2],
minSamples:x[3],
maxRank:x[4],
lossPenalty:x[5],
consensus:x[6],
recentWeight:x[7],
switchAfterLoss:x[8],
persistence:x[9]
}));

const ORIGINALS=[
["FIXED","AUTO RANKING"],
["GEO","MELHOR GEOMETRIA"],
["BEST","MELHOR DESEMPENHO"],
["STABLE","ESTABILIDADE"],
["SWITCH","TROCA INTELIGENTE"],
["CONSENSUS","CONSENSO"],
["UNION","UNIÃO"]
];

const $=id=>document.getElementById(id);
const mod=n=>(n%37+37)%37;
const idx=n=>W.indexOf(n);
const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
const mean=a=>a.length?a.reduce((s,n)=>s+n,0)/a.length:0;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fmt=n=>Number.isFinite(n)?n.toFixed(2).replace(".",","):"—";
const percent=(a,b)=>b?fmt(a/b*100)+"%":"—";

function escapeHTML(v){
return String(v??"").replace(/[&<>"']/g,c=>({
"&":"&amp;","<":"&lt;",">":"&gt;",
'"':"&quot;","'":"&#39;"
}[c]));
}

function neighbors(n,r=1){
const p=idx(n);
return Array.from({length:2*r+1},(_,i)=>W[mod(p+i-r)]);
}

function physicalDistance(a,b){
const d=Math.abs(idx(a)-idx(b));
return Math.min(d,37-d);
}

function signedDistance(a,b){
const forward=mod(idx(b)-idx(a));
const backward=mod(idx(a)-idx(b));
return forward<=backward?forward:-backward;
}

function sector(n){
return SECTOR_ORDER.find(s=>SECTORS[s].includes(n))||"ZERO";
}

const MIRROR=new Set();

for(const n of MIRROR_BASE){
for(const v of neighbors(n,1)){
MIRROR.add(v);
}
}

function mirrorType(n){
return MIRROR.has(n)?"ESPELHO":"ANTIESPELHO";
}

function jumpType(d){
return d<=4?"CURTO":d<=9?"MÉDIO":"GRANDE";
}

function fresh(){
return {
history:[],
sources:[],
ledger:[],
strategy:"FIXED",
rank:3,
manual:null,
activeAdaptive:"A05",
activeCreated:null,
createdStrategies:[],
g1:true,
galeSkip:false,
secondHouse:false,
phase:"ENTRY",
frozen:null,
cycle:null,
previousMotor:null,
trainerChoice:null,
trainerMotor:null,
trainerStart:0,
trainerChanges:0,
trainerMotorChanges:0,
trainerPending:false,
trainerOperationalTurns:0,
open:{
general:true,
trainer:true,
lab:false,
motors:false,
jumps:false,
mirrors:false,
timeline:true,
virtualRanking:false,
opportunities:false,
coveragePlan:false,
comparisons:false,
created:false
}
};
}

function read(key){
try{
return JSON.parse(localStorage.getItem(key)||"null");
}catch(e){
return null;
}
}

let state=fresh();
let loadedKey=null;

for(const key of [KEY,...OLD_KEYS]){
const data=read(key);
if(data&&Array.isArray(data.history)){
state={
...fresh(),
...data,
open:{...fresh().open,...(data.open||{})}
};
loadedKey=key;
break;
}
}

state.history=state.history.filter(n=>Number.isInteger(n)&&n>=0&&n<=36);
state.sources=Array.isArray(state.sources)?state.sources:[];
state.ledger=Array.isArray(state.ledger)?state.ledger:[];

if(!Number.isInteger(state.trainerOperationalTurns)){
state.trainerOperationalTurns=0;
}

let persistenceWarning=false;

function save(){
try{
localStorage.setItem(KEY,JSON.stringify(state));
persistenceWarning=false;
return true;
}catch(e){
persistenceWarning=true;
console.warn("Falha ao salvar histórico completo:",e);
return false;
}
}

/*
 A migração não apaga a chave antiga.
 O histórico antigo permanece recuperável.
*/
if(loadedKey&&loadedKey!==KEY){
save();
}

/* =====================================================
   ANÁLISE SEQUENCIAL
   ===================================================== */

function sequentialAnalysis(history){

const h=history.slice(-80);
const transitions=[];

for(let i=1;i<h.length;i++){

const from=h[i-1];
const to=h[i];

const numericDelta=to-from;
const physicalDelta=signedDistance(from,to);
const physical=Math.abs(physicalDelta);

transitions.push({
from,
to,
numericDelta,
physicalDelta,
physical,
numericDirection:
numericDelta>0?"CRESCENTE":
numericDelta<0?"DECRESCENTE":"IGUAL",
physicalDirection:
physicalDelta>0?"HORÁRIO":
physicalDelta<0?"ANTI-HORÁRIO":"PARADO",
jump:jumpType(physical),
mirrorFrom:mirrorType(from),
mirrorTo:mirrorType(to),
sectorFrom:sector(from),
sectorTo:sector(to)
});
}

const last=transitions.slice(-12);
const last6=transitions.slice(-6);
const last3=transitions.slice(-3);
const prev3=transitions.slice(-6,-3);

const numericSteps=transitions.slice(-8)
.map(x=>Math.sign(x.numericDelta));

const physicalSteps=transitions.slice(-8)
.map(x=>Math.sign(x.physicalDelta));

function streak(steps){
if(!steps.length)return {direction:0,length:0};
const direction=steps.at(-1);
if(direction===0)return {direction:0,length:0};
let length=0;
for(let i=steps.length-1;i>=0;i--){
if(steps[i]!==direction)break;
length++;
}
return {direction,length};
}

const numericStreak=streak(numericSteps);
const physicalStreak=streak(physicalSteps);

const averageLast3=mean(last3.map(x=>x.physical));
const averagePrev3=mean(prev3.map(x=>x.physical));

const acceleration=averageLast3-averagePrev3;

const regions={};

for(const s of SECTOR_ORDER){

let absence=0;

for(let i=history.length-1;i>=0;i--){
if(sector(history[i])===s)break;
absence++;
}

regions[s]={
absence,
recent:history.slice(-12).filter(n=>sector(n)===s).length
};
}

const mirrorRecent=history.slice(-12)
.filter(n=>MIRROR.has(n)).length;

const mirrorTransitions=last.filter(
x=>x.mirrorFrom!==x.mirrorTo
).length;

const mirrorToMirror=last.filter(
x=>x.mirrorFrom==="ESPELHO"&&
x.mirrorTo==="ESPELHO"
).length;

const antiToAnti=last.filter(
x=>x.mirrorFrom==="ANTIESPELHO"&&
x.mirrorTo==="ANTIESPELHO"
).length;

const mirrorDistances=last.filter(
x=>x.mirrorFrom==="ESPELHO"||
x.mirrorTo==="ESPELHO"
).map(x=>x.physical);

const recentLarge=last.filter(x=>x.jump==="GRANDE").length;
const recentShort=last.filter(x=>x.jump==="CURTO").length;

const physicalDirections={
clockwise:last6.filter(x=>x.physicalDelta>0).length,
counterclockwise:last6.filter(x=>x.physicalDelta<0).length
};

const numericDirections={
up:last6.filter(x=>x.numericDelta>0).length,
down:last6.filter(x=>x.numericDelta<0).length
};

let signal="MISTO";

if(acceleration>=3)signal="SALTOS AUMENTANDO";
else if(acceleration<=-3)signal="SALTOS DIMINUINDO";
else if(recentLarge>=5)signal="PREDOMÍNIO DE SALTOS GRANDES";
else if(recentShort>=6)signal="PREDOMÍNIO DE SALTOS CURTOS";

return {
transitions,
last,
last3,
last6,
numericStreak,
physicalStreak,
averageLast3,
averagePrev3,
acceleration,
regions,
mirrorRecent,
mirrorTransitions,
mirrorToMirror,
antiToAnti,
mirrorDistances,
recentLarge,
recentShort,
physicalDirections,
numericDirections,
signal
};
}

/* =====================================================
   CAMADA DE SINAIS APLICADA AOS 12 MOTORES

   Usa informação anterior ao giro.
   Não usa o resultado futuro.
   ===================================================== */

function sequenceWeights(history,family,radius){

const weights=Array(37).fill(0);

if(history.length<3)return weights;

const analysis=sequentialAnalysis(history);
const last=history.at(-1);

const familyStrength=
family==="NORMAL"?.72:
family==="DINAMICO"?1.00:
family==="RX_NORMAL"?.88:1.12;

const radiusStrength=radius/5;

const add=(n,value)=>{
weights[idx(n)]+=value*familyStrength*radiusStrength;
};

/*
 1. ORDEM NUMÉRICA CRESCENTE / DECRESCENTE
*/

const recentNumeric=analysis.last6.map(x=>x.numericDelta);

const up=recentNumeric.filter(x=>x>0).length;
const down=recentNumeric.filter(x=>x<0).length;

const numericBias=(up-down)/Math.max(1,up+down);

const numericStepSize=clamp(
Math.round(mean(recentNumeric.map(Math.abs))),
1,12
);

for(const n of W){

const delta=n-last;

if(numericBias>0&&delta>0){
add(n,.10*Math.abs(numericBias));
}

if(numericBias<0&&delta<0){
add(n,.10*Math.abs(numericBias));
}

/*
 Mantém o sinal moderado:
 não presume continuação obrigatória.
*/

if(
analysis.numericStreak.length>=2&&
Math.sign(delta)===analysis.numericStreak.direction
){
add(n,.07);
}

const target=clamp(
last+
Math.sign(numericBias)*numericStepSize,
0,36
);

if(Math.abs(n-target)<=2){
add(n,.05);
}
}

/*
 2. DIREÇÃO FÍSICA NA RODA
*/

const cw=analysis.physicalDirections.clockwise;
const ccw=analysis.physicalDirections.counterclockwise;

const physicalBias=(cw-ccw)/Math.max(1,cw+ccw);

const distances=analysis.last6.map(x=>x.physical);

const expectedDistance=clamp(
Math.round(mean(distances)),
1,18
);

for(const n of W){

const delta=signedDistance(last,n);
const distance=Math.abs(delta);

if(
Math.sign(delta)===Math.sign(physicalBias)&&
physicalBias!==0
){
add(n,.12*Math.abs(physicalBias));
}

if(
analysis.physicalStreak.length>=2&&
Math.sign(delta)===analysis.physicalStreak.direction
){
add(n,.07);
}

if(Math.abs(distance-expectedDistance)<=2){
add(n,.09);
}
}

/*
 3. SALTOS CRESCENTES / DECRESCENTES
*/

const lastDistance=analysis.last.at(-1)?.physical||0;

const targetDistance=clamp(
Math.round(
lastDistance+
analysis.acceleration*.5
),
1,18
);

for(const n of W){

const d=physicalDistance(last,n);

if(Math.abs(d-targetDistance)<=2){
add(n,.09);
}

if(
analysis.acceleration>=3&&
d>=10
){
add(n,.07);
}

if(
analysis.acceleration<=-3&&
d<=5
){
add(n,.07);
}
}

/*
 4. ESPELHO / ANTIESPELHO
   Analisa transições e distância.
*/

const lastMirror=mirrorType(last);

const mirrorTransitionRate=
analysis.mirrorTransitions/
Math.max(1,analysis.last.length);

const mirrorDistance=
mean(analysis.mirrorDistances);

for(const n of W){

const candidateMirror=mirrorType(n);
const changes=candidateMirror!==lastMirror;
const d=physicalDistance(last,n);

if(changes){
add(n,.045*mirrorTransitionRate);
}else{
add(n,.045*(1-mirrorTransitionRate));
}

if(
mirrorDistance>0&&
Math.abs(d-mirrorDistance)<=2
){
add(n,.055);
}

if(
analysis.mirrorToMirror>
analysis.antiToAnti&&
candidateMirror==="ESPELHO"
){
add(n,.035);
}

if(
analysis.antiToAnti>
analysis.mirrorToMirror&&
candidateMirror==="ANTIESPELHO"
){
add(n,.035);
}
}

/*
 5. REGIÕES

 Ausência não é interpretada como
 obrigação de retorno.
 O peso favorece distribuição quando
 os saltos recentes estão dispersos.
*/

const dispersion=
analysis.averageLast3>=9||
analysis.recentLarge>=5;

if(dispersion){

for(const n of W){

const s=sector(n);
const represented=analysis.regions[s].recent;

add(n,.045/(1+represented*.2));
}
}

/*
 6. ASSINATURA DOS ÚLTIMOS SALTOS

 Procura sequências semelhantes
 dentro do histórico observado.
*/

const signatures=analysis.transitions.slice(-3);

if(signatures.length===3){

const current=signatures.map(x=>({
numeric:Math.sign(x.numericDelta),
physical:Math.sign(x.physicalDelta),
jump:x.jump,
mirrorChange:x.mirrorFrom!==x.mirrorTo
}));

const matches=[];

for(let i=3;i<history.length-1;i++){

let score=0;

for(let j=0;j<3;j++){

const a=history[i-3+j];
const b=history[i-2+j];

const nd=Math.sign(b-a);
const pd=Math.sign(signedDistance(a,b));
const jt=jumpType(physicalDistance(a,b));
const mc=mirrorType(a)!==mirrorType(b);

const target=current[j];

if(nd===target.numeric)score+=.20;
if(pd===target.physical)score+=.25;
if(jt===target.jump)score+=.35;
if(mc===target.mirrorChange)score+=.20;
}

matches.push({
score:score/3,
next:history[i]
});
}

matches.sort((a,b)=>b.score-a.score);

for(const match of matches.slice(0,12)){

if(match.score<.65)continue;

for(const n of neighbors(match.next,1)){
add(n,.045*match.score);
}
}
}

return weights;
}

/* =====================================================
   MOTORES BASE
   ===================================================== */

function motorWeights(history,family,radius){

const weights=Array(37).fill(.01);
const recent=history.slice(-60);

for(let k=0;k<recent.length;k++){

const n=recent[recent.length-1-k];
const decay=Math.exp(-k/(radius*2.3));
const p=idx(n);

for(let j=0;j<37;j++){

const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=6){
weights[j]+=decay*(7-d)/7;
}
}
}

if(family.includes("DINAMICO")){

for(let k=0;k<Math.min(radius+2,history.length);k++){

const n=history[history.length-1-k];
const p=idx(n);

for(let j=0;j<37;j++){

const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=3){
weights[j]+=(4-d)/(k+2)*1.7;
}
}
}
}

if(family.startsWith("RX")){

const length=Math.min(radius,history.length-2);

if(length>=2){

const current=history.slice(-length);
const matches=[];

for(let i=0;i+length<history.length-1;i++){

let score=0;

for(let j=0;j<length;j++){

score+=Math.max(
0,
6-physicalDistance(current[j],history[i+j])
)/6;
}

matches.push({
score:score/length,
next:history[i+length]
});
}

matches.sort((a,b)=>b.score-a.score);

for(const match of matches.slice(0,Math.max(
3,Math.ceil(matches.length*.2)
))){

const p=idx(match.next);

for(let j=0;j<37;j++){

const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=3){
weights[j]+=(4-d)*match.score*.45;
}
}
}
}
}

/*
 NOVO AJUSTE:
 sinais aplicados a todos os motores
 antes da geração da geometria.
*/

const sequence=sequenceWeights(history,family,radius);

for(let i=0;i<37;i++){
weights[i]+=sequence[i];
}

return weights;
}

/* =====================================================
   GEOMETRIA: 5x5 + 1x3
   ===================================================== */

const BLOCKS5=[];
const BLOCKS3=[];

for(let center=0;center<37;center++){

for(const radius of [1,2]){

const numbers=[];

for(let d=-radius;d<=radius;d++){
numbers.push(W[mod(center+d)]);
}

const mask=numbers.reduce(
(m,n)=>m|(1n<<BigInt(idx(n))),
0n
);

const block={
center:W[center],
radius,
numbers,
mask
};

(radius===1?BLOCKS3:BLOCKS5).push(block);
}
}

function geometry(weights,mandatory=[]){

const required=new Set(mandatory);

const scoreBlock=b=>
b.numbers.reduce(
(s,n)=>s+(weights[idx(n)]||0),0
);

const fives=BLOCKS5.map(b=>({
...b,value:scoreBlock(b)
})).sort((a,b)=>b.value-a.value);

const threes=BLOCKS3.map(b=>({
...b,value:scoreBlock(b)
})).sort((a,b)=>b.value-a.value);

let best=null;

for(const small of threes){

if([...required].some(n=>!small.numbers.includes(n))){
continue;
}

let beam=[{
blocks:[small],
mask:small.mask,
score:small.value
}];

for(let step=0;step<5;step++){

const next=[];

for(const item of beam){

for(const b of fives){

if((item.mask&b.mask)!==0n)continue;

next.push({
blocks:[...item.blocks,b],
mask:item.mask|b.mask,
score:item.score+b.value
});
}
}

if(!next.length){
beam=[];
break;
}

next.sort((a,b)=>b.score-a.score);

const seen=new Set();

beam=[];

for(const item of next){

const signature=item.mask.toString();

if(seen.has(signature))continue;

seen.add(signature);
beam.push(item);

if(beam.length>=10)break;
}
}

for(const item of beam){

if(item.blocks.length!==6)continue;

if(!best||item.score>best.score){
best=item;
}
}
}

if(!best)return null;

const blocks=best.blocks.map(b=>({
center:b.center,
radius:b.radius,
numbers:[...b.numbers]
}));

const numbers=blocks.flatMap(b=>b.numbers);

if(new Set(numbers).size!==28)return null;

return {
score:best.score,
blocks,
numbers,
centers5:blocks.filter(b=>b.radius===2)
.map(b=>b.center),
center3:blocks.find(b=>b.radius===1).center
};
}

/* =====================================================
   12 MOTORES
   ===================================================== */

function candidates(history){

if(history.length<8)return [];

const result=[];

for(const family of FAMILIES){

for(const radius of RADII){

if(
family.startsWith("RX")&&
history.length<radius*2+4
)continue;

const weights=motorWeights(history,family,radius);
const play=geometry(weights);

if(!play)continue;

result.push({
key:family+"_"+radius,
family,
radius,
score:play.score,
play
});
}
}

result.sort((a,b)=>b.score-a.score);

result.forEach((c,i)=>{
c.rank=i+1;
});

return result;
}

let candidateCache={signature:null,value:[]};

function getCandidates(){

const h=state.history.slice(-200);

const signature=
state.history.length+":"+h.join(",");

if(candidateCache.signature===signature){
return candidateCache.value;
}

const value=candidates(h);

candidateCache={signature,value};

return value;
}

function invalidate(){
candidateCache.signature=null;
trainerCache.signature=null;
}

/* =====================================================
   HISTÓRICO VIRTUAL
   ===================================================== */

function motorStats(key,window=20){

const rows=state.ledger.filter(
r=>r.virtual?.some(x=>x.key===key)
).slice(-window);

let hits=0;

for(const row of rows){

const motor=row.virtual.find(x=>x.key===key);

if(motor?.numbers.includes(row.number)){
hits++;
}
}

return {
total:rows.length,
hits,
misses:rows.length-hits,
rate:rows.length?hits/rows.length:null
};
}

function virtualSnapshot(cs){

return cs.map(c=>({
key:c.key,
rank:c.rank,
score:c.score,
numbers:[...c.play.numbers],
centers5:[...c.play.centers5],
center3:c.play.center3
}));
}

/* =====================================================
   ADAPTATIVAS
   ===================================================== */

function adaptiveChoose(cs,config,previous){

if(!cs.length)return null;

const eligible=cs.filter(
c=>c.rank<=config.maxRank
);

const ranked=eligible.map(c=>{

const stats=motorStats(c.key,config.window);

let score=stats.total>=config.minSamples
?stats.rate:.5;

if(config.recentWeight){

const recent=motorStats(
c.key,
Math.max(5,Math.floor(config.window/2))
);

if(recent.rate!==null){

score=
score*(1-config.recentWeight)+
recent.rate*config.recentWeight;
}
}

if(config.lossPenalty){

const recent=motorStats(c.key,5);
score-=recent.misses*config.lossPenalty;
}

if(config.consensus){

let votes=0;

for(const n of c.play.numbers){

votes+=cs.filter(
x=>x.play.numbers.includes(n)
).length;
}

score+=config.consensus*
votes/(28*cs.length);
}

return {c,score,stats};
});

ranked.sort(
(a,b)=>b.score-a.score||a.c.rank-b.c.rank
);

const best=ranked[0];

if(!best)return cs[0];
if(!previous)return best.c;

const old=ranked.find(x=>x.c.key===previous);

if(!old)return best.c;
if(old.c.key===best.c.key)return old.c;

if(config.switchAfterLoss){

const recent=state.ledger
.filter(r=>r.virtual?.length)
.slice(-config.persistence);

if(recent.length===config.persistence){

const failures=recent.every(r=>{

const motor=r.virtual.find(
x=>x.key===previous
);

return motor&&!motor.numbers.includes(r.number);
});

if(failures)return best.c;
}
}

if(
best.stats.total>=config.minSamples&&
old.stats.total>=config.minSamples&&
best.score>=old.score+config.margin
){
return best.c;
}

return old.c;
}

function collective(cs,rule){

const votes=Array(37).fill(0);

const selected=rule==="UNION"
?cs.slice(0,3):cs;

for(const c of selected){

for(const n of c.play.numbers){

votes[idx(n)]+=
rule==="UNION"?1:1/(1+c.rank*.1);
}
}

const play=geometry(votes);

return play?{
key:rule,
family:rule,
radius:0,
rank:0,
score:play.score,
play
}:cs[0];
}

/* =====================================================
   TREINADOR DINÂMICO
   ===================================================== */

let trainerCache={
signature:null,
rows:[],
recommendation:null
};

function trainerAnalysis(cs=getCandidates()){

const signature=
state.history.length+":"+
state.history.slice(-30).join(",")+":"+
state.ledger.length;

if(trainerCache.signature===signature){
return trainerCache;
}

const rows=[];

const sequence=sequentialAnalysis(state.history);

for(const config of ADAPTATIVES){

const eligible=cs.filter(
c=>c.rank<=config.maxRank
);

const ranked=eligible.map(c=>{

const stats=motorStats(c.key,config.window);
const recent=motorStats(c.key,3);

let score=
(recent.rate??.5)*.52+
(stats.rate??.5)*.38;

/*
 Avalia se a cobertura acompanha
 sinais recentes de direção e saltos.
*/

const signal=sequenceWeights(
state.history,
c.family,
c.radius
);

const signalTotal=signal.reduce((a,b)=>a+b,0);

const coveredSignal=c.play.numbers.reduce(
(s,n)=>s+signal[idx(n)],0
);

const signalCoverage=signalTotal
?coveredSignal/signalTotal
:28/37;

score+=signalCoverage*.10;

score-=config.lossPenalty*recent.misses;

return {motor:c,score};
}).sort(
(a,b)=>b.score-a.score||
a.motor.rank-b.motor.rank
);

const best=ranked[0];

const recentRows=state.ledger.filter(
r=>r.virtual?.length
).slice(-3);

let hits=0;
let total=0;

for(const row of recentRows){

const m=row.virtual.filter(
x=>x.rank<=config.maxRank
).sort((a,b)=>a.rank-b.rank)[0];

if(!m)continue;

total++;

if(m.numbers.includes(row.number)){
hits++;
}
}

const recentRate=total?hits/total:.5;

rows.push({
id:config.id,
name:config.name,
config,
motor:best?.motor||null,
hits,
total,
score:(best?.score??.5)*.65+
recentRate*.35
});
}

rows.sort(
(a,b)=>b.score-a.score||
a.id.localeCompare(b.id)
);

trainerCache={
signature,
rows,
recommendation:rows[0]||null
};

return trainerCache;
}

function updateTrainerChoice(cs=getCandidates()){

if(state.strategy!=="TRAINER"||state.manual){
return;
}

if(state.phase!=="ENTRY"){
return;
}

if(!cs.length)return;

const ranking=trainerAnalysis(cs).rows;

if(!ranking.length)return;

const previous=state.trainerChoice;
const elapsed=state.trainerOperationalTurns||0;

const current=ranking.find(x=>x.id===previous);
const best=ranking[0];

let change=!previous;

if(previous){

if(elapsed>=3||state.trainerPending){
change=true;
}

else if(
elapsed>=1&&
best.id!==previous&&
best.score>(current?.score??-1)+.035
){
change=true;
}
}

if(!change)return;

const alternatives=previous
?ranking.filter(x=>x.id!==previous)
:ranking;

const selected=alternatives[0]||best;

if(!selected)return;

if(previous&&selected.id!==previous){
state.trainerChanges++;
}

const previousMotor=state.trainerMotor;

state.trainerChoice=selected.id;
state.trainerMotor=selected.motor?.key||null;
state.trainerStart=state.history.length;
state.trainerOperationalTurns=0;
state.trainerPending=false;

if(
previousMotor&&
state.trainerMotor&&
previousMotor!==state.trainerMotor
){
state.trainerMotorChanges++;
}
}

function activeStrategy(){

if(state.manual){
return {rule:"MANUAL",name:state.manual};
}

if(state.strategy==="TRAINER"){

updateTrainerChoice();

const config=ADAPTATIVES.find(
x=>x.id===state.trainerChoice
)||ADAPTATIVES[4];

return {
rule:"TRAINER",
config,
name:"TREINADOR → "+config.name
};
}

if(state.strategy==="ADAPTIVE"){

const config=ADAPTATIVES.find(
x=>x.id===state.activeAdaptive
)||ADAPTATIVES[4];

return {
rule:"ADAPTIVE",
config,
name:config.name
};
}

if(state.strategy==="CREATED"){

const created=state.createdStrategies.find(
x=>x.id===state.activeCreated
);

if(created){
return {
rule:"ADAPTIVE",
config:created.config,
name:created.name
};
}
}

return {
rule:state.strategy,
name:ORIGINALS.find(
x=>x[0]===state.strategy
)?.[1]||state.strategy
};
}

function selectMotor(cs){

if(!cs.length)return null;

const active=activeStrategy();

const fixed=cs[
clamp(state.rank-1,0,cs.length-1)
];

const previous=state.previousMotor;

if(active.rule==="MANUAL"){
return cs.find(x=>x.key===state.manual)||fixed;
}

if(active.rule==="TRAINER"){

const row=trainerAnalysis(cs).rows.find(
x=>x.id===state.trainerChoice
);

return row?.motor||fixed;
}

if(active.rule==="FIXED")return fixed;
if(active.rule==="GEO")return cs[0];

if(active.rule==="ADAPTIVE"){
return adaptiveChoose(cs,active.config,previous);
}

if(active.rule==="STABLE"){

const old=cs.find(x=>x.key===previous);

return old&&old.rank<=5?old:fixed;
}

if(active.rule==="BEST"){

return [...cs].sort((a,b)=>{

const A=motorStats(a.key);
const B=motorStats(b.key);

return (
(B.total>=8?B.rate:-1)-
(A.total>=8?A.rate:-1)
)||a.rank-b.rank;
})[0];
}

if(active.rule==="SWITCH"){

const old=cs.find(x=>x.key===previous)||fixed;
const oldStats=motorStats(old.key);

const alternatives=cs.map(c=>({
c,stats:motorStats(c.key)
})).filter(x=>x.stats.total>=12)
.sort((a,b)=>b.stats.rate-a.stats.rate);

if(
alternatives.length&&
oldStats.total>=12&&
alternatives[0].stats.rate>
oldStats.rate+.12
){
return alternatives[0].c;
}

return old;
}

if(
active.rule==="CONSENSUS"||
active.rule==="UNION"
){
return collective(cs,active.rule);
}

return fixed;
}

/* =====================================================
   G1 AJUSTE FINO
   ===================================================== */

function tuneG1(original,lastNumber){

if(!original)return null;

const mandatory=neighbors(lastNumber,1);
const weights=Array(37).fill(.01);

for(const n of original.play.numbers){
weights[idx(n)]+=100;
}

for(const n of mandatory){
weights[idx(n)]+=100000;
}

const play=geometry(weights,mandatory);

if(!play||!mandatory.every(
n=>play.numbers.includes(n)
)){
return {
...clone(original),
g1:false,
g1Failed:true,
trigger:lastNumber
};
}

return {
...clone(original),
play,
g1:true,
g1Failed:false,
trigger:lastNumber
};
}

function snapMotor(m){

if(!m)return null;

return {
key:m.key,
family:m.family,
radius:m.radius,
rank:m.rank,
score:m.score,
play:clone(m.play)
};
}

/* =====================================================
   RESULTADOS CONGELADOS
   ===================================================== */

function recordSpin(number,source="TEMPO REAL"){

const cs=getCandidates();
const virtual=virtualSnapshot(cs);
const active=activeStrategy();

const before=state.phase;

let motor=null;
let result="AGUARDANDO";
let played=false;
let covered=false;
let strategyName=active.name;

let cycleSnapshot=clone(state.cycle);

if(state.phase==="ENTRY"){

motor=snapMotor(selectMotor(cs));

if(motor){

state.previousMotor=motor.key;

state.cycle={
start:state.history.length+1,
strategy:active.name,
motor:motor.key,
original:clone(motor),
firstNumber:null,
options:{
g1:state.g1,
galeSkip:state.galeSkip,
secondHouse:state.secondHouse
}
};

cycleSnapshot=clone(state.cycle);

if(state.secondHouse){

state.frozen=clone(motor);
state.phase="SECOND_SKIP";
result="2ª CASA";

}else{

played=true;
covered=motor.play.numbers.includes(number);

if(covered){

result="GREEN";
state.phase="ENTRY";
state.frozen=null;
state.cycle=null;

}else{

result="GALE";

state.cycle.firstNumber=number;

state.frozen=state.g1
?tuneG1(motor,number)
:clone(motor);

state.phase=state.galeSkip
?"GALE_SKIP":"GALE";
}
}
}else{
result="SEM MOTOR";
}
}

else if(state.phase==="SECOND_SKIP"){

motor=clone(state.frozen);
strategyName=state.cycle?.strategy||active.name;
result="CASA PULADA";
state.phase="SECOND_ENTRY";
}

else if(state.phase==="SECOND_ENTRY"){

motor=clone(state.frozen);
strategyName=state.cycle?.strategy||active.name;

played=!!motor;
covered=!!motor?.play.numbers.includes(number);

if(covered){

result="GREEN";
state.phase="ENTRY";
state.frozen=null;
state.cycle=null;

}else{

result="GALE";

if(state.cycle){
state.cycle.firstNumber=number;
}

state.frozen=state.cycle?.options.g1
?tuneG1(motor,number)
:clone(motor);

state.phase=state.cycle?.options.galeSkip
?"GALE_SKIP":"GALE";
}
}

else if(state.phase==="GALE_SKIP"){

motor=clone(state.frozen);
strategyName=state.cycle?.strategy||active.name;
result="GALE PULADO";
state.phase="GALE";
}

else if(state.phase==="GALE"){

motor=clone(state.frozen);
strategyName=state.cycle?.strategy||active.name;

played=!!motor;
covered=!!motor?.play.numbers.includes(number);

result=covered?"GREEN G1":"LOSS";

state.phase="ENTRY";
state.frozen=null;
state.cycle=null;
}

const row={
id:Date.now()+"_"+state.history.length,
turn:state.history.length+1,
number,
source,
strategy:strategyName,
motor:motor?.key||"—",
phase:before,
result,
played,
covered,
g1:!!motor?.g1,
g1Failed:!!motor?.g1Failed,
trigger:motor?.trigger??null,
play:motor?clone(motor.play):null,
cycle:cycleSnapshot,
virtual,
timestamp:Date.now()
};

state.history.push(number);
state.sources.push(source);
state.ledger.push(row);

/*
 O histórico NÃO é cortado.
*/

invalidate();

/*
 Conta giros efetivos da adaptativa.
 A troca é aplicada somente quando
 o ciclo estiver encerrado.
*/

if(
state.strategy==="TRAINER"&&
!state.manual
){

state.trainerOperationalTurns=
(state.trainerOperationalTurns||0)+1;

if(state.phase==="ENTRY"){

updateTrainerChoice();

}else if(state.trainerOperationalTurns>=3){

state.trainerPending=true;
}
}

save();

return row;
}

/* =====================================================
   DESFAZER ÚLTIMO
   ===================================================== */

function undoLast(){

if(!state.history.length)return;

state.history.pop();
state.sources.pop();

const removed=state.ledger.at(-1);

if(removed?.turn===state.history.length+1){
state.ledger.pop();
}

const last=state.ledger.at(-1);

state.phase="ENTRY";
state.frozen=null;
state.cycle=null;

if(last){

if(last.result==="2ª CASA"){

state.phase="SECOND_SKIP";
state.cycle=clone(last.cycle);
state.frozen=clone(last.cycle?.original);
}

else if(last.result==="CASA PULADA"){

state.phase="SECOND_ENTRY";
state.cycle=clone(last.cycle);
state.frozen=clone(last.cycle?.original);
}

else if(last.result==="GALE"){

state.cycle=clone(last.cycle);

if(state.cycle){

state.cycle.firstNumber=last.number;

state.frozen=state.cycle.options.g1
?tuneG1(state.cycle.original,last.number)
:clone(state.cycle.original);

state.phase=state.cycle.options.galeSkip
?"GALE_SKIP":"GALE";
}
}

else if(last.result==="GALE PULADO"){

state.cycle=clone(last.cycle);

if(state.cycle){

state.frozen=state.cycle.options.g1
?tuneG1(
state.cycle.original,
state.cycle.firstNumber
)
:clone(state.cycle.original);

state.phase="GALE";
}
}
}

state.previousMotor=
last?.motor&&last.motor!=="—"
?last.motor:null;

state.trainerOperationalTurns=clamp(
(state.trainerOperationalTurns||0)-1,0,3
);

state.trainerPending=false;

invalidate();
save();
render();
}

/* =====================================================
   INDICADORES
   ===================================================== */

function metrics(rows){

const closed=rows.filter(
r=>["GREEN","GREEN G1","LOSS"].includes(r.result)
);

const green=closed.filter(
r=>r.result==="GREEN"
).length;

const greenG1=closed.filter(
r=>r.result==="GREEN G1"
).length;

const loss=closed.filter(
r=>r.result==="LOSS"
).length;

const gale=rows.filter(
r=>r.result==="GALE"
).length;

return {
total:closed.length,
green,
greenG1,
loss,
gale,
success:green+greenG1
};
}

function metricsHTML(rows){

const m=metrics(rows);

return `
<div class="metrics">

<div class="metric">
<small>CICLOS FECHADOS</small>
<b>${m.total}</b>
</div>

<div class="metric">
<small>GREEN DIRETO</small>
<b class="good">${m.green}</b>
</div>

<div class="metric">
<small>GREEN G1</small>
<b class="good">${m.greenG1}</b>
</div>

<div class="metric">
<small>GALE</small>
<b>${m.gale}</b>
</div>

<div class="metric">
<small>LOSS</small>
<b class="bad">${m.loss}</b>
</div>

<div class="metric">
<small>GREEN TOTAL</small>
<b>${percent(m.success,m.total)}</b>
</div>

</div>`;
}

function sortedBlocks(play){

if(!play)return [];

return [...play.blocks].sort((a,b)=>{

const sa=SECTOR_ORDER.indexOf(sector(a.center));
const sb=SECTOR_ORDER.indexOf(sector(b.center));

return sa-sb||idx(a.center)-idx(b.center);
});
}

function centersHTML(play){

if(!play)return "";

return sortedBlocks(play).map(b=>`
<div class="center ${b.radius===1?"short":""}">
${b.center}
<small>${sector(b.center)} • ${b.radius}V</small>
</div>
`).join("");
}

function resultBorder(result){

if(result==="LOSS")return "result-loss";
if(result.startsWith("GREEN"))return "result-green";

if(result==="GALE"||result==="GALE PULADO"){
return "result-gale";
}

return "";
}

function virtualRankingHTML(){

const rows=[];

for(const family of FAMILIES){

for(const radius of RADII){

const key=family+"_"+radius;

rows.push({key,...motorStats(key,200)});
}
}

rows.sort(
(a,b)=>(b.rate??-1)-(a.rate??-1)
);

return rows.map((m,i)=>`
<div class="listrow">
<b>${i+1}º ${escapeHTML(m.key)}</b>
<div class="muted">
${m.total} GIROS •
${m.hits} COBERTOS •
${m.misses} DESCOBERTOS •
${percent(m.hits,m.total)}
</div>
</div>
`).join("");
}

function opportunities(){

const rows=[];

for(const row of state.ledger){

if(!row.play||row.covered||!row.played){
continue;
}

const alternatives=(row.virtual||[])
.filter(m=>m.numbers.includes(row.number));

rows.push({
turn:row.turn,
number:row.number,
motor:row.motor,
result:row.result,
alternatives:alternatives.map(x=>x.key)
});
}

return rows;
}

function opportunitiesHTML(){

return opportunities().slice(-20).reverse().map(x=>`
<div class="listrow">
<b>GIRO ${x.turn}</b>
• ${x.number}
• ${escapeHTML(x.result)}
<div class="muted">
MOTOR: ${escapeHTML(x.motor)}
<br>
ALTERNATIVAS:
${escapeHTML(x.alternatives.join(", ")||"NENHUMA")}
</div>
</div>
`).join("");
}

function coveragePlanHTML(){

const missed=opportunities();

const alternative=missed.filter(
x=>x.alternatives.length
).length;

const a=sequentialAnalysis(state.history);

return `
<div class="box">

<b>PLANO DE COBERTURA</b>

<p>GIROS DESCOBERTOS: ${missed.length}</p>
<p>OUTRO MOTOR COBRIA: ${alternative}</p>
<p>NENHUM MOTOR COBRIA: ${missed.length-alternative}</p>

</div>

${SECTOR_ORDER.map(s=>`
<div class="listrow">
<b>${s}</b>
• ${a.regions[s].recent} NOS ÚLTIMOS 12
• ${a.regions[s].absence} GIROS DE AUSÊNCIA
</div>
`).join("")}
`;
}

/* =====================================================
   PAINEL NOVO: DIREÇÃO E SALTOS
   ===================================================== */

function sequenceHTML(){

const a=sequentialAnalysis(state.history);

const numeric=
a.numericStreak.direction>0?"CRESCENTE":
a.numericStreak.direction<0?"DECRESCENTE":"MISTA";

const physical=
a.physicalStreak.direction>0?"HORÁRIA":
a.physicalStreak.direction<0?"ANTI-HORÁRIA":"MISTA";

return `
<div class="box">

<b>LEITURA DOS 12 MOTORES</b>

<p>
SEQUÊNCIA NUMÉRICA:
<strong>${numeric}</strong>
• ${a.numericStreak.length} PASSOS
</p>

<p>
DIREÇÃO FÍSICA:
<strong>${physical}</strong>
• ${a.physicalStreak.length} PASSOS
</p>

<p>
NUMÉRICO ÚLTIMOS 6:
${a.numericDirections.up} CRESCENTES /
${a.numericDirections.down} DECRESCENTES
</p>

<p>
FÍSICO ÚLTIMOS 6:
${a.physicalDirections.clockwise} HORÁRIOS /
${a.physicalDirections.counterclockwise} ANTI-HORÁRIOS
</p>

<p>
SINAL DOS SALTOS:
<strong>${escapeHTML(a.signal)}</strong>
</p>

<p>
MÉDIA ÚLTIMOS 3:
${fmt(a.averageLast3)} CASAS
</p>

<p>
MÉDIA 3 ANTERIORES:
${fmt(a.averagePrev3)} CASAS
</p>

<p>
VARIAÇÃO:
${fmt(a.acceleration)} CASAS
</p>

<p>
SALTOS GRANDES ÚLTIMOS 12:
${a.recentLarge}
</p>

</div>

<div class="title">
REGIÕES SEM APARECER
</div>

${SECTOR_ORDER.map(s=>`
<div class="listrow">
<b>${s}</b>
• ${a.regions[s].absence} GIROS
• ${a.regions[s].recent} OCORRÊNCIAS RECENTES
</div>
`).join("")}

<div class="title">
ÚLTIMAS TRANSIÇÕES
</div>

${a.last.slice(-12).reverse().map(x=>`
<div class="listrow">

<b>${x.from} → ${x.to}</b>
• ${x.physical} CASAS
• ${x.jump}

<div class="muted">

NUMÉRICO:
${x.numericDirection}
(${x.numericDelta>0?"+":""}${x.numericDelta})

<br>

FÍSICO:
${x.physicalDirection}
(${x.physicalDelta>0?"+":""}${x.physicalDelta})

<br>

${x.sectorFrom} → ${x.sectorTo}

<br>

${x.mirrorFrom} → ${x.mirrorTo}

</div>

</div>
`).join("")}
`;
}

/* =====================================================
   ESPELHO / ANTIESPELHO
   ===================================================== */

function mirrorHTML(){

const a=sequentialAnalysis(state.history);
const recent=state.history.slice(-20);

const mirrorHits=recent.filter(
n=>MIRROR.has(n)
).length;

const antiHits=recent.length-mirrorHits;

const last=state.history.at(-1);

const mirrorNear=last==null?[]:
W.filter(n=>MIRROR.has(n)&&physicalDistance(last,n)<=4);

const mirrorFar=last==null?[]:
W.filter(n=>MIRROR.has(n)&&physicalDistance(last,n)>=10);

return `
<div class="box">

<b>ESPELHO / ANTIESPELHO</b>

<p>
ESPELHO:
11, 12, 13 • 21, 22, 23 •
31, 32, 33
E SEUS VIZINHOS FÍSICOS
</p>

<p>
ESPELHO NOS ÚLTIMOS 20:
${mirrorHits}
</p>

<p>
ANTIESPELHO NOS ÚLTIMOS 20:
${antiHits}
</p>

<p>
TRANSIÇÕES ESPELHO / ANTIESPELHO:
${a.mirrorTransitions} NOS ÚLTIMOS 12
</p>

<p>
DISTÂNCIA MÉDIA ENVOLVENDO ESPELHO:
${fmt(mean(a.mirrorDistances))} CASAS
</p>

</div>

<div class="title">
ESPELHOS PRÓXIMOS DO ÚLTIMO NÚMERO
</div>

<div class="numberCloud">
${mirrorNear.map(n=>`<span>${n}</span>`).join("")||"—"}
</div>

<div class="title">
ESPELHOS DISTANTES DO ÚLTIMO NÚMERO
</div>

<div class="numberCloud">
${mirrorFar.map(n=>`<span>${n}</span>`).join("")||"—"}
</div>

<div class="title">
TODOS OS ESPELHOS
</div>

<div class="numberCloud">
${W.filter(n=>MIRROR.has(n))
.map(n=>`<span>${n}</span>`).join("")}
</div>

<div class="title">
ANTIESPELHOS
</div>

<div class="numberCloud">
${W.filter(n=>!MIRROR.has(n))
.map(n=>`<span>${n}</span>`).join("")}
</div>
`;
}

/* =====================================================
   TREINADOR
   ===================================================== */

function miniPanel(id,title,content){

const open=!!state.open[id];

return `
<button class="miniHead" data-panel="${id}">
${escapeHTML(title)}
<span>${open?"−":"+"}</span>
</button>
<div id="${id}" class="${open?"":"hide"}">
${open?content:""}
</div>
`;
}

function trainerHTML(){

const analysis=trainerAnalysis();
const rec=analysis.recommendation;

const config=ADAPTATIVES.find(
x=>x.id===state.trainerChoice
);

const elapsed=state.trainerOperationalTurns||0;

return `
<div class="trainerCycle">

<div class="title">
TREINADOR ESTRATÉGICO
</div>

<p>
ADAPTATIVA:
<b>${escapeHTML(config?.name||"AGUARDANDO")}</b>
</p>

<p>
MOTOR:
<b>${escapeHTML(state.trainerMotor||"AGUARDANDO")}</b>
</p>

<p>
GIROS DESDE A ÚLTIMA TROCA:
<b>${elapsed}</b>
</p>

<p>
TROCA:
<b>${state.trainerPending
?"AGUARDANDO FECHAR GALE"
:"DINÂMICA: 1, 2 OU 3 GIROS"
}</b>
</p>

<p>
TROCAS DE ADAPTATIVA:
<b>${state.trainerChanges}</b>
</p>

<p>
TROCAS DE MOTOR:
<b>${state.trainerMotorChanges}</b>
</p>

</div>

<div class="virtualRecommendation">

<div class="title">
MELHOR AVALIAÇÃO ATUAL
</div>

<b>${escapeHTML(rec?.name||"AGUARDANDO")}</b>

<p class="muted">
MOTOR:
${escapeHTML(rec?.motor?.key||"—")}
</p>

<p class="muted">
COBERTURA VIRTUAL:
${percent(rec?.hits||0,rec?.total||0)}
</p>

<button class="virtualButton"
id="activateTrainer">
ATIVAR TREINADOR ESTRATÉGICO
</button>

${rec?`
<button class="virtualButton"
id="activateRecommended">
ATIVAR ${escapeHTML(rec.name)}
</button>
`:""}

</div>

${miniPanel(
"virtualRanking",
"RANKING VIRTUAL DOS 12 MOTORES",
virtualRankingHTML()
)}

${miniPanel(
"opportunities",
"ÚLTIMAS OPORTUNIDADES",
opportunitiesHTML()
)}

${miniPanel(
"coveragePlan",
"PLANO DE COBERTURA",
coveragePlanHTML()
)}
`;
}

function labHTML(){

const analysis=trainerAnalysis();

return `
<div class="box">

<b>LABORATÓRIO DAS 12 ADAPTATIVAS</b>

<p class="muted">
ANÁLISE DE:
DIREÇÃO NUMÉRICA,
DIREÇÃO FÍSICA,
SALTOS,
ESPELHO / ANTIESPELHO,
REGIÕES E COBERTURA VIRTUAL.
</p>

</div>

${miniPanel(
"comparisons",
"COMPARAÇÃO DAS 12 ADAPTATIVAS",
`
<div class="tablewrap">
<table>
<thead>
<tr>
<th>ESTRATÉGIA</th>
<th>MOTOR</th>
<th>COBERTOS</th>
<th>REGISTROS</th>
<th>COBERTURA</th>
</tr>
</thead>
<tbody>
${analysis.rows.map(r=>`
<tr>
<td>${escapeHTML(r.name)}</td>
<td>${escapeHTML(r.motor?.key||"—")}</td>
<td>${r.hits}</td>
<td>${r.total}</td>
<td>${percent(r.hits,r.total)}</td>
</tr>
`).join("")}
</tbody>
</table>
</div>
`
)}

${miniPanel(
"created",
"ESTRATÉGIAS PERSONALIZADAS",
state.createdStrategies.map(c=>`
<div class="listrow">${escapeHTML(c.name)}</div>
`).join("")||'<div class="box">NENHUMA CRIADA.</div>'
)}

<button class="virtualButton" id="createAdaptive">
CRIAR CÓPIA DA RECOMENDADA
</button>
`;
}

function timelineHTML(){

return state.ledger.slice(-80).reverse().map(r=>`
<div class="listrow">

<b>GIRO ${r.turn}</b>
• <b>${r.number}</b>
• <span class="${
r.result.startsWith("GREEN")?"good":
r.result==="LOSS"?"bad":""
}">
${escapeHTML(r.result)}
</span>

<div class="muted">
ESTRATÉGIA: ${escapeHTML(r.strategy)}
• MOTOR: ${escapeHTML(r.motor)}
• FASE: ${escapeHTML(r.phase)}
• REGIÃO: ${sector(r.number)}
• ${mirrorType(r.number)}
</div>

${r.play?`
<div class="muted">
CENTROS:
${sortedBlocks(r.play).map(b=>b.center).join(" • ")}
</div>
`:""}

</div>
`).join("");
}

/* =====================================================
   INTERFACE
   ===================================================== */

const css=`
*{box-sizing:border-box}
body{
margin:0;background:#10151e;color:#f3f7fb;
font-family:Arial,sans-serif
}
.app{max-width:1100px;margin:auto;padding:12px}
h1{text-align:center;font-size:23px;margin:16px 0 5px}
.sub{text-align:center;font-size:11px;color:#9cb3c9;margin-bottom:18px}
.panel{
background:#1c2634;border:1px solid #40546c;
border-radius:11px;padding:12px;margin:10px 0
}
.title{color:#32d9f4;font-size:12px;font-weight:bold;margin:12px 0}
.row{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
.btn{
background:#304056;border:1px solid #69819d;
border-radius:7px;padding:10px;color:white;
font-weight:bold;font-size:11px;cursor:pointer
}
.btn.active{background:#087f9d;border-color:#32d9f4}
.btn.trainer{
background:#0a6653;border:2px solid #2c9f81
}
.btn.trainer.active{
background:#075f4e;border:2px solid #69ffd0;
animation:trainerGlow 1.4s ease-in-out infinite
}
@keyframes trainerGlow{
0%,100%{box-shadow:0 0 5px #19d5a0,0 0 10px #19d5a055}
50%{box-shadow:0 0 12px #69ffd0,0 0 24px #17f0ad}
}
textarea{
width:100%;height:85px;padding:10px;border-radius:8px;
background:#0c1623;border:1px solid #62758b;color:white
}
.centers{
display:grid;grid-template-columns:repeat(6,1fr);gap:5px
}
.center{
padding:13px 2px;border:2px solid #20d7f4;
background:#096a92;border-radius:9px;text-align:center;
font-size:22px;font-weight:bold
}
.center.short{
background:#caa127;border-color:#ffe282;color:#111
}
.center small{display:block;font-size:9px;margin-top:5px}
.keys{
display:grid;grid-template-columns:repeat(6,1fr);gap:5px
}
.key{
height:43px;border:1px solid #697b8f;border-radius:7px;
color:white;font-size:15px;font-weight:bold;cursor:pointer
}
.key.zero{grid-column:span 6}
.metrics{
display:grid;grid-template-columns:repeat(3,1fr);gap:6px
}
.metric{
background:#29384b;padding:12px 5px;
border-radius:8px;text-align:center
}
.metric small{display:block;font-size:9px;color:#b9cad9}
.metric b{display:block;font-size:23px;margin-top:6px}
.good{color:#4ee2a2}
.bad{color:#ff778c}
.muted{font-size:11px;color:#afc0d1;line-height:1.7}
.box{
background:#111d2a;border:1px solid #425a75;
padding:12px;border-radius:9px;margin:9px 0;
font-size:12px;line-height:1.7
}
.head{
display:flex;justify-content:space-between;width:100%;
background:#2c3d51;color:white;border:1px solid #5e7895;
border-radius:8px;padding:12px;font-weight:bold;cursor:pointer
}
.hide{display:none}
.history{display:flex;flex-wrap:wrap;gap:5px}
.chip{
padding:8px;border:2px solid #718397;border-radius:7px;
min-width:47px;text-align:center
}
.chip.result-green{
border:3px solid #24f49a;box-shadow:0 0 6px #24f49a88
}
.chip.result-gale{
border:3px solid #ffda35;box-shadow:0 0 6px #ffda3588
}
.chip.result-loss{
border:3px solid #ff386c;box-shadow:0 0 7px #ff386c99
}
.chip b{display:block;font-size:18px}
.chip small{font-size:9px}
.listrow{
border-bottom:1px solid #35475b;
padding:9px 3px;font-size:11px;line-height:1.7
}
.tablewrap{overflow:auto}
table{
width:100%;border-collapse:collapse;
min-width:600px;font-size:11px
}
td,th{
padding:9px;border-bottom:1px solid #40516a;text-align:left
}
th{color:#50d9ee}
.virtualRecommendation{
background:#102f27;border:1px solid #35a981;
border-radius:10px;padding:14px;margin:10px 0
}
.virtualButton{
width:100%;background:#0b8466;border:1px solid #52e6b5;
color:white;border-radius:9px;padding:14px;
font-size:13px;font-weight:bold;cursor:pointer;margin:8px 0
}
.miniHead{
display:flex;justify-content:space-between;width:100%;
margin:10px 0 0;padding:11px;background:#24364b;
border:1px solid #4c6985;border-radius:8px;color:#d6eafa;
font-size:11px;font-weight:bold;cursor:pointer
}
.strategyGroup{
margin-top:12px;padding-top:8px;border-top:1px solid #34485e
}
.strategyLabel{
font-size:10px;color:#7fe1f3;font-weight:bold;margin:8px 0
}
.status{padding:8px;font-size:11px;color:#81dceb}
.trainerCycle{
background:#102c26;border:1px solid #30bf91;
padding:12px;border-radius:9px;margin:10px 0
}
.trainerCycle b{color:#7fffd2}
.numberCloud{
display:flex;flex-wrap:wrap;gap:5px;margin:10px 0
}
.numberCloud span{
padding:8px;background:#273b50;border:1px solid #60829f;
border-radius:6px;font-size:12px;font-weight:bold
}
.warning{
border-left:3px solid #d9a63c;padding:9px;
background:#2b281f;color:#e8d5a6;
font-size:11px;line-height:1.6
}
@media(max-width:600px){
.center{font-size:18px;padding:12px 1px}
.center small{font-size:8px}
.btn{font-size:10px;padding:9px}
}
`;

document.body.innerHTML=`
<style>${css}</style>

<main class="app">

<h1>ANÁLISE BETA V${VERSION}</h1>

<div class="sub">
12 MOTORES • 12 ADAPTATIVAS •
28 NÚMEROS • DIREÇÃO E SALTOS
</div>

<section class="panel">

<div class="title">IMPORTAR HISTÓRICO</div>

<textarea id="paste"
placeholder="Cole os números do mais antigo ao mais recente"></textarea>

<div class="row">
<button class="btn" id="import">IMPORTAR E ANALISAR</button>
<button class="btn" id="restoreOld">RECUPERAR HISTÓRICO ANTERIOR</button>
<button class="btn" id="undo">APAGAR ÚLTIMO</button>
<button class="btn" id="clear">ZERAR</button>
</div>

<div class="status" id="status"></div>

</section>

<section class="panel">

<div class="title">ESTRATÉGIA ATIVA</div>

<div id="strategies"></div>
<div class="row" id="options"></div>

<div class="muted" id="selected"></div>

<div class="centers" id="centers"></div>

<div class="muted" id="coverage"></div>

</section>

<section class="panel">
<div class="title">TECLADO 0–36</div>
<div class="keys" id="keys"></div>
</section>

<section class="panel">
<div class="title">ÚLTIMOS 14 RESULTADOS</div>
<div class="history" id="last"></div>
</section>

${[
["general","RESULTADO GERAL"],
["trainer","TREINADOR ESTRATÉGICO"],
["lab","LABORATÓRIO DE ESTRATÉGIAS"],
["motors","12 MOTORES E RANKING"],
["jumps","SALTOS • CRESCENTE / DECRESCENTE"],
["mirrors","ESPELHO / ANTIESPELHO"],
["timeline","LINHA DO TEMPO — GREEN / GALE / LOSS"]
].map(([id,title])=>`
<section class="panel">
<button class="head" data-panel="${id}">
${title}<span>−</span>
</button>
<div id="${id}"></div>
</section>
`).join("")}

<div class="warning">
Os sinais são leituras estatísticas do histórico.
Em uma roleta justa, cada giro é independente
e esses padrões não garantem previsão do próximo resultado.
</div>

</main>
`;

/* =====================================================
   CONTROLES
   ===================================================== */

function makeButton(label,fn,parent,extra=""){

const b=document.createElement("button");

b.className="btn "+extra;
b.textContent=label;
b.onclick=fn;

parent.appendChild(b);

return b;
}

function changeStrategy(rule,adaptive=null,created=null){

state.manual=null;
state.strategy=rule;
state.activeAdaptive=adaptive;
state.activeCreated=created;

if(rule==="TRAINER"){

state.trainerChoice=null;
state.trainerMotor=null;
state.trainerStart=state.history.length;
state.trainerOperationalTurns=0;
state.trainerPending=false;

if(state.phase==="ENTRY"){
updateTrainerChoice();
}
}

save();
render();
}

function buildStrategyButtons(){

const root=$("strategies");
root.innerHTML="";

const groups=[
["TREINADOR AUTOMÁTICO",[
["TREINADOR ESTRATÉGICO",()=>changeStrategy("TRAINER"),"trainer"]
]],
["ESTRATÉGIAS ORIGINAIS",
ORIGINALS.map(([key,name])=>[
name,()=>changeStrategy(key),key
])],
["12 ESTRATÉGIAS ADAPTATIVAS",
ADAPTATIVES.map(c=>[
c.name,()=>changeStrategy("ADAPTIVE",c.id),c.id
])]
];

for(const [label,buttons] of groups){

const group=document.createElement("div");
group.className="strategyGroup";

group.innerHTML=`
<div class="strategyLabel">${label}</div>
`;

const row=document.createElement("div");
row.className="row";

for(const [name,fn,key] of buttons){

const b=makeButton(
name,
fn,
row,
key==="trainer"?"trainer":""
);

b.dataset.choice=key;
}

group.appendChild(row);
root.appendChild(group);
}

const ranks=document.createElement("div");
ranks.className="row";

for(let rank=1;rank<=4;rank++){

const b=makeButton(
"AUTO "+rank+"º",
()=>{
state.rank=rank;
changeStrategy("FIXED");
},
ranks
);

b.dataset.rank=rank;
}

root.appendChild(ranks);

if(state.createdStrategies.length){

const group=document.createElement("div");
group.className="strategyGroup";

group.innerHTML=`
<div class="strategyLabel">ESTRATÉGIAS CRIADAS</div>
`;

const row=document.createElement("div");
row.className="row";

for(const c of state.createdStrategies){

const b=makeButton(
c.name,
()=>changeStrategy("CREATED",null,c.id),
row
);

b.dataset.createdChoice=c.id;
}

group.appendChild(row);
root.appendChild(group);
}
}

buildStrategyButtons();

for(const [field,name] of [
["g1","G1 AJUSTE FINO"],
["galeSkip","GALE 2ª RODADA"],
["secondHouse","2ª CASA"]
]){

const b=makeButton(
name,
()=>{
state[field]=!state[field];
save();
render();
},
$("options")
);

b.dataset.option=field;
}

let importing=false;

for(let n=0;n<=36;n++){

const b=document.createElement("button");

b.className="key"+(n===0?" zero":"");
b.textContent=n;

b.style.background=
n===0?"#087b50":
RED.has(n)?"#ac293f":"#12151b";

b.onclick=()=>{

if(importing)return;

recordSpin(n);
render();
};

$("keys").appendChild(b);
}

/* =====================================================
   IMPORTAÇÃO
   ===================================================== */

async function importNumbers(numbers){

if(importing)return;

importing=true;

const selectedStrategy=state.strategy;
const selectedAdaptive=state.activeAdaptive;
const options={
g1:state.g1,
galeSkip:state.galeSkip,
secondHouse:state.secondHouse
};

state=fresh();

state.strategy=selectedStrategy;
state.activeAdaptive=selectedAdaptive;

Object.assign(state,options);

invalidate();

/*
 Todos os números ficam preservados.

 Para grandes importações, a parte
 antiga entra como histórico bruto.
 Os últimos 200 são processados com
 resultados detalhados.
*/

const detailedStart=Math.max(0,numbers.length-200);

state.history=numbers.slice(0,detailedStart);

state.sources=Array(detailedStart).fill("HISTÓRICO");

for(let i=detailedStart;i<numbers.length;i++){

recordSpin(numbers[i],"HISTÓRICO");

if((i-detailedStart)%4===3){

$("status").textContent=
"ANALISANDO "+(i+1)+"/"+numbers.length;

await new Promise(resolve=>setTimeout(resolve,0));
}
}

importing=false;

invalidate();
save();
render();
}

$("import").onclick=()=>{

if(importing)return;

const numbers=(
$("paste").value.match(/\d+/g)||[]
).map(Number).filter(
n=>Number.isInteger(n)&&n>=0&&n<=36
);

if(!numbers.length){
alert("COLE NÚMEROS DE 0 A 36.");
return;
}

if(!confirm(
"IMPORTAR "+numbers.length+
" NÚMEROS E SUBSTITUIR O HISTÓRICO ATUAL?"
))return;

$("paste").value="";

importNumbers(numbers);
};

$("restoreOld").onclick=()=>{

if(importing)return;

let old=null;

for(const key of OLD_KEYS){

const data=read(key);

if(data?.history?.length){
old=data;
break;
}
}

if(!old){
alert("NENHUM HISTÓRICO ANTERIOR ENCONTRADO.");
return;
}

if(!confirm(
"RECUPERAR "+old.history.length+" NÚMEROS?"
))return;

importNumbers(old.history);
};

$("undo").onclick=()=>{

if(importing)return;

undoLast();
};

$("clear").onclick=()=>{

if(importing)return;

if(!confirm("APAGAR TODO O HISTÓRICO?")){
return;
}

state=fresh();

invalidate();
buildStrategyButtons();
save();
render();
};

/* =====================================================
   PAINÉIS
   ===================================================== */

document.addEventListener("click",event=>{

const button=event.target.closest("[data-panel]");

if(!button)return;

const id=button.dataset.panel;

state.open[id]=!state.open[id];

save();
render();
});

function applyOpenState(){

for(const [id,open] of Object.entries(state.open)){

const element=$(id);

if(element){
element.classList.toggle("hide",!open);
}

const button=document.querySelector(
'[data-panel="'+id+'"]'
);

const span=button?.querySelector("span");

if(span){
span.textContent=open?"−":"+";
}
}
}

/* =====================================================
   RENDER
   ===================================================== */

let renderScheduled=false;

function render(){

if(renderScheduled)return;

renderScheduled=true;

requestAnimationFrame(()=>{

renderScheduled=false;

try{
performRender();
}catch(error){

console.error(error);

$("status").textContent=
"ERRO: "+error.message;
}
});
}

function performRender(){

const cs=getCandidates();
const active=activeStrategy();

const selected=state.frozen||
snapMotor(selectMotor(cs));

const play=selected?.play||null;

$("status").textContent=
state.history.length+
" NÚMEROS PRESERVADOS • "+
cs.length+
"/12 MOTORES • "+
state.phase+
(persistenceWarning
?" • ATENÇÃO: ARMAZENAMENTO NÃO SALVO"
:"");

for(const b of document.querySelectorAll(
"[data-choice]"
)){

const choice=b.dataset.choice;

const activeChoice=
state.strategy==="TRAINER"
?choice==="trainer":
state.strategy==="ADAPTIVE"
?choice===state.activeAdaptive:
choice===state.strategy;

b.classList.toggle(
"active",
!state.manual&&activeChoice
);
}

for(const b of document.querySelectorAll(
"[data-created-choice]"
)){

b.classList.toggle(
"active",
state.strategy==="CREATED"&&
state.activeCreated===b.dataset.createdChoice
);
}

for(const b of document.querySelectorAll(
"[data-rank]"
)){

b.classList.toggle(
"active",
state.strategy==="FIXED"&&
state.rank===Number(b.dataset.rank)
);
}

for(const b of document.querySelectorAll(
"[data-option]"
)){

b.classList.toggle(
"active",
!!state[b.dataset.option]
);
}

$("selected").textContent=
(state.phase!=="ENTRY"
?state.cycle?.strategy||active.name
:active.name)+
" • MOTOR "+
(selected?.key||"AGUARDANDO")+
" • "+state.phase;

$("centers").innerHTML=centersHTML(play);

$("coverage").textContent=play
?"28 COBERTOS • 9 DESCOBERTOS"+
(selected?.g1?" • G1 AJUSTADO":"")
:"IMPORTE PELO MENOS 8 NÚMEROS.";

const last=state.history.slice(-14);

$("last").innerHTML=last.map((n,i)=>{

const turn=state.history.length-last.length+i+1;

const row=state.ledger.find(r=>r.turn===turn);

const result=row?.result||"HISTÓRICO";

return `
<div class="chip ${resultBorder(result)}"
style="background:${
n===0?"#087b50":
RED.has(n)?"#a72740":"#14181f"
}">
<b>${n}</b>
<small>${escapeHTML(result)}</small>
</div>
`;
}).reverse().join("");

if(state.open.general){

const historical=state.ledger.filter(
r=>r.source==="HISTÓRICO"
);

const live=state.ledger.filter(
r=>r.source==="TEMPO REAL"
);

$("general").innerHTML=`
<div class="title">HISTÓRICO</div>
${metricsHTML(historical)}

<div class="title">TEMPO REAL</div>
${metricsHTML(live)}

<div class="title">TOTAL ACUMULADO</div>
${metricsHTML(state.ledger)}

<div class="box">
TOTAL DE NÚMEROS ARMAZENADOS:
<b>${state.history.length}</b>
</div>
`;
}

if(state.open.trainer){

$("trainer").innerHTML=trainerHTML();

const activate=$("activateTrainer");

if(activate){
activate.onclick=()=>changeStrategy("TRAINER");
}

const recommended=$("activateRecommended");

if(recommended){

recommended.onclick=()=>{

const rec=trainerAnalysis().recommendation;

if(rec){
changeStrategy("ADAPTIVE",rec.id);
}
};
}
}

if(state.open.lab){

$("lab").innerHTML=labHTML();

const create=$("createAdaptive");

if(create){

create.onclick=()=>{

const rec=trainerAnalysis().recommendation;

if(!rec)return;

const created={
id:"VIRTUAL_"+Date.now(),
name:"ESTRATÉGIA VIRTUAL "+
(state.createdStrategies.length+1),
config:clone(rec.config)
};

state.createdStrategies.push(created);

state.strategy="CREATED";
state.activeCreated=created.id;
state.manual=null;

buildStrategyButtons();
save();
render();
};
}
}

if(state.open.motors){

$("motors").innerHTML=`

<div class="row">

${FAMILIES.flatMap(f=>
RADII.map(r=>`
<button class="btn" data-manual="${f}_${r}">
${f}_${r}
</button>
`)
).join("")}

</div>

${cs.map(c=>`
<div class="listrow">

<b>${c.rank}º</b>
• ${escapeHTML(c.key)}
• SCORE ${fmt(c.score)}

<div class="muted">
CENTROS:
${sortedBlocks(c.play)
.map(b=>b.center).join(" • ")}
</div>

</div>
`).join("")}
`;

for(const b of document.querySelectorAll(
"[data-manual]"
)){

b.onclick=()=>{

state.manual=b.dataset.manual;

save();
render();
};
}
}

if(state.open.jumps){
$("jumps").innerHTML=sequenceHTML();
}

if(state.open.mirrors){
$("mirrors").innerHTML=mirrorHTML();
}

if(state.open.timeline){
$("timeline").innerHTML=timelineHTML();
}

applyOpenState();
}

render();

})();
