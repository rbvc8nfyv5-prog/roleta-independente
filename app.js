
(() => {
"use strict";

/*
==========================================================
ANÁLISE BETA V6.3 — TREINADOR GLOBAL + ESTABILIDADE
==========================================================

MANTÉM:
- 12 motores: NORMAL, DINAMICO, RX_NORMAL, RX_DINAMICO
- 12 adaptativas
- 7 estratégias originais
- Estratégias personalizadas
- Geometria: 5 blocos de 5 + 1 bloco de 3
- 28 números cobertos, sem sobreposição
- G1 com ajuste fino
- Gale congelado
- Teclado 0 a 36
- Histórico integral de números
- Últimos 14 resultados
- GREEN / GALE / LOSS coloridos
- Saltos físicos
- Crescente e decrescente
- Espelho e antiespelho
- Regiões TIERS, ÓRFÃOS, VOISINS, ZERO
- Painéis recolhíveis

NOVO:
- Todas as estratégias são avaliadas virtualmente
- Cada previsão é registrada ANTES do resultado
- Cada estratégia virtual tem ciclo próprio de Gale
- Desempenho em 3, 12 e 30 giros
- Resultado líquido em fichas
- Índice de estabilidade
- Penalidade por sequências de LOSS
- Comparação de sobreposição entre motores
- Proteção contra baixa confiança
- Treinador pode trocar após 1 ou 2 giros
- Troca obrigatória ao completar 3 giros operacionais
- Troca adiada se existir Gale em andamento
- Estratégia e jogada histórica congeladas
- Treinador não aumenta apostas após LOSS

IMPORTANTE:
Indicadores históricos não garantem previsão de
resultados independentes de uma roleta justa.
==========================================================
*/

const VERSION="6.3";
const KEY="ANALISE_BETA_V63";

const OLD_KEYS=[
"ANALISE_BETA_V62",
"ANALISE_BETA_V61",
"ANALISE_BETA_V60",
"ANALISE_BETA_V59"
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

const ORIGINALS=[
["FIXED","AUTO RANKING"],
["GEO","MELHOR GEOMETRIA"],
["BEST","MELHOR DESEMPENHO"],
["STABLE","ESTABILIDADE"],
["SWITCH","TROCA INTELIGENTE"],
["CONSENSUS","CONSENSO"],
["UNION","UNIÃO"]
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

const $=id=>document.getElementById(id);
const mod=n=>(n%37+37)%37;
const idx=n=>W.indexOf(n);
const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fmt=n=>Number.isFinite(n)?n.toFixed(2).replace(".",","):"—";
const pct=(a,b)=>b?fmt(a/b*100)+"%":"—";

function esc(x){
return String(x??"").replace(/[&<>"']/g,c=>({
"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#39;"
}[c]));
}

function neighbors(n,r=1){
const p=idx(n);
return Array.from(
{length:r*2+1},
(_,i)=>W[mod(p+i-r)]
);
}

function distance(a,b){
const d=Math.abs(idx(a)-idx(b));
return Math.min(d,37-d);
}

function signedDistance(a,b){
const forward=mod(idx(b)-idx(a));
const backward=mod(idx(a)-idx(b));
return forward<=backward?forward:-backward;
}

function sector(n){
return SECTOR_ORDER.find(
s=>SECTORS[s].includes(n)
)||"ZERO";
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

/* ======================================================
ESTADO
====================================================== */

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
cycle:null,
frozen:null,
previousMotor:null,

trainerChoice:null,
trainerMotor:null,
trainerTurns:0,
trainerPending:false,
trainerChanges:0,
trainerMotorChanges:0,
trainerHistory:[],
trainerProtection:false,

virtualStates:{},
virtualRows:[],

stake:1,
galeMultiplier:1,

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
created:false,
stability:true,
overlap:false,
trainerHistory:false
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

for(const key of [KEY,...OLD_KEYS]){

const old=read(key);

if(old&&Array.isArray(old.history)){

state={
...fresh(),
...old,
open:{
...fresh().open,
...(old.open||{})
}
};

break;
}
}

state.history=state.history.filter(
n=>Number.isInteger(n)&&n>=0&&n<=36
);

state.sources=Array.isArray(state.sources)
?state.sources:[];

state.ledger=Array.isArray(state.ledger)
?state.ledger:[];

state.virtualRows=Array.isArray(state.virtualRows)
?state.virtualRows:[];

state.virtualStates=
state.virtualStates&&typeof state.virtualStates==="object"
?state.virtualStates:{};

state.trainerHistory=Array.isArray(state.trainerHistory)
?state.trainerHistory:[];

let saveError=false;

function save(){

try{

localStorage.setItem(KEY,JSON.stringify(state));

saveError=false;
return true;

}catch(e){

saveError=true;
console.warn("Falha ao salvar histórico:",e);
return false;
}
}

/* ======================================================
ANÁLISE DE SEQUÊNCIAS
====================================================== */

function sequenceAnalysis(history){

const h=history.slice(-80);
const transitions=[];

for(let i=1;i<h.length;i++){

const from=h[i-1];
const to=h[i];

const numericDelta=to-from;
const physicalDelta=signedDistance(from,to);
const d=Math.abs(physicalDelta);

transitions.push({
from,
to,
numericDelta,
physicalDelta,
distance:d,
jump:jumpType(d),
numericDirection:
numericDelta>0?"CRESCENTE":
numericDelta<0?"DECRESCENTE":"IGUAL",
physicalDirection:
physicalDelta>0?"HORÁRIO":
physicalDelta<0?"ANTI-HORÁRIO":"PARADO",
mirrorFrom:mirrorType(from),
mirrorTo:mirrorType(to),
sectorFrom:sector(from),
sectorTo:sector(to)
});
}

const last=transitions.slice(-12);
const last6=transitions.slice(-6);
const last3=transitions.slice(-3);
const previous3=transitions.slice(-6,-3);

function streak(values){

if(!values.length){
return {direction:0,length:0};
}

const direction=Math.sign(values.at(-1));

if(!direction){
return {direction:0,length:0};
}

let length=0;

for(let i=values.length-1;i>=0;i--){

if(Math.sign(values[i])!==direction)break;
length++;
}

return {direction,length};
}

const numericStreak=streak(
transitions.slice(-8).map(x=>x.numericDelta)
);

const physicalStreak=streak(
transitions.slice(-8).map(x=>x.physicalDelta)
);

const averageLast3=mean(
last3.map(x=>x.distance)
);

const averagePrevious3=mean(
previous3.map(x=>x.distance)
);

const acceleration=
averageLast3-averagePrevious3;

const regions={};

for(const s of SECTOR_ORDER){

let absence=0;

for(let i=history.length-1;i>=0;i--){

if(sector(history[i])===s)break;
absence++;
}

regions[s]={
absence,
recent:history.slice(-12)
.filter(n=>sector(n)===s).length
};
}

const mirrorTransitions=last.filter(
x=>x.mirrorFrom!==x.mirrorTo
).length;

const mirrorDistances=last.filter(
x=>x.mirrorFrom==="ESPELHO"||
x.mirrorTo==="ESPELHO"
).map(x=>x.distance);

const physicalDirections={
clockwise:last6.filter(x=>x.physicalDelta>0).length,
counterclockwise:last6.filter(x=>x.physicalDelta<0).length
};

const numericDirections={
up:last6.filter(x=>x.numericDelta>0).length,
down:last6.filter(x=>x.numericDelta<0).length
};

const large=last.filter(x=>x.jump==="GRANDE").length;
const short=last.filter(x=>x.jump==="CURTO").length;

let signal="MISTO";

if(acceleration>=3){
signal="SALTOS AUMENTANDO";
}else if(acceleration<=-3){
signal="SALTOS DIMINUINDO";
}else if(large>=5){
signal="PREDOMÍNIO DE SALTOS GRANDES";
}else if(short>=6){
signal="PREDOMÍNIO DE SALTOS CURTOS";
}

return {
transitions,last,last6,last3,
numericStreak,
physicalStreak,
averageLast3,
averagePrevious3,
acceleration,
regions,
mirrorTransitions,
mirrorDistances,
physicalDirections,
numericDirections,
large,short,signal
};
}

/* ======================================================
PESOS DE SALTOS / DIREÇÃO / ESPELHO
====================================================== */

function sequenceWeights(history,family,radius){

const weights=Array(37).fill(0);

if(history.length<3)return weights;

const a=sequenceAnalysis(history);
const last=history.at(-1);

const strength={
NORMAL:.72,
DINAMICO:1,
RX_NORMAL:.88,
RX_DINAMICO:1.12
}[family]||1;

const add=(n,v)=>{
weights[idx(n)]+=
v*strength*(radius/5);
};

const numeric=a.last6.map(x=>x.numericDelta);

const up=numeric.filter(x=>x>0).length;
const down=numeric.filter(x=>x<0).length;

const numericBias=
(up-down)/Math.max(1,up+down);

const numericStep=clamp(
Math.round(mean(numeric.map(Math.abs))),
1,12
);

const cw=a.physicalDirections.clockwise;
const ccw=a.physicalDirections.counterclockwise;

const physicalBias=
(cw-ccw)/Math.max(1,cw+ccw);

const physicalStep=clamp(
Math.round(mean(a.last6.map(x=>x.distance))),
1,18
);

const previousDistance=
a.last.at(-1)?.distance||0;

const targetDistance=clamp(
Math.round(
previousDistance+a.acceleration*.5
),
1,18
);

const transitionRate=
a.mirrorTransitions/Math.max(1,a.last.length);

const mirrorDistance=mean(a.mirrorDistances);

for(const n of W){

const nd=n-last;
const pd=signedDistance(last,n);
const d=Math.abs(pd);

if(
numericBias!==0&&
Math.sign(nd)===Math.sign(numericBias)
){
add(n,.10*Math.abs(numericBias));
}

if(
a.numericStreak.length>=2&&
Math.sign(nd)===a.numericStreak.direction
){
add(n,.07);
}

const numericTarget=clamp(
last+
Math.sign(numericBias)*numericStep,
0,36
);

if(Math.abs(n-numericTarget)<=2){
add(n,.05);
}

if(
physicalBias!==0&&
Math.sign(pd)===Math.sign(physicalBias)
){
add(n,.12*Math.abs(physicalBias));
}

if(
a.physicalStreak.length>=2&&
Math.sign(pd)===a.physicalStreak.direction
){
add(n,.07);
}

if(Math.abs(d-physicalStep)<=2){
add(n,.09);
}

if(Math.abs(d-targetDistance)<=2){
add(n,.09);
}

if(a.acceleration>=3&&d>=10){
add(n,.07);
}

if(a.acceleration<=-3&&d<=5){
add(n,.07);
}

const changed=
mirrorType(n)!==mirrorType(last);

add(
n,
changed
?.045*transitionRate
:.045*(1-transitionRate)
);

if(
mirrorDistance>0&&
Math.abs(d-mirrorDistance)<=2
){
add(n,.055);
}

if(a.averageLast3>=9||a.large>=5){

const recent=a.regions[sector(n)].recent;

add(n,.045/(1+recent*.2));
}
}

/*
 Assinaturas históricas:
 comparação apenas com transições
 anteriores ao giro avaliado.
*/

const signature=a.transitions.slice(-3);

if(signature.length===3){

const matches=[];

for(let i=3;i<history.length-1;i++){

let score=0;

for(let j=0;j<3;j++){

const from=history[i-3+j];
const to=history[i-2+j];
const target=signature[j];

if(
Math.sign(to-from)===
Math.sign(target.numericDelta)
){
score+=.20;
}

if(
Math.sign(signedDistance(from,to))===
Math.sign(target.physicalDelta)
){
score+=.25;
}

if(
jumpType(distance(from,to))===
target.jump
){
score+=.35;
}

if(
(mirrorType(from)!==mirrorType(to))===
(target.mirrorFrom!==target.mirrorTo)
){
score+=.20;
}
}

matches.push({
score:score/3,
next:history[i]
});
}

matches.sort((a,b)=>b.score-a.score);

for(const m of matches.slice(0,12)){

if(m.score<.65)continue;

for(const n of neighbors(m.next,1)){
add(n,.045*m.score);
}
}
}

return weights;
}

/* ======================================================
12 MOTORES
====================================================== */

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

const length=Math.min(
radius,
history.length-2
);

if(length>=2){

const current=history.slice(-length);
const matches=[];

for(let i=0;i+length<history.length-1;i++){

let score=0;

for(let j=0;j<length;j++){

score+=Math.max(
0,
6-distance(current[j],history[i+j])
)/6;
}

matches.push({
score:score/length,
next:history[i+length]
});
}

matches.sort((a,b)=>b.score-a.score);

for(const m of matches.slice(
0,
Math.max(3,Math.ceil(matches.length*.2))
)){

const p=idx(m.next);

for(let j=0;j<37;j++){

const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=3){
weights[j]+=(4-d)*m.score*.45;
}
}
}
}
}

const signals=sequenceWeights(
history,
family,
radius
);

for(let i=0;i<37;i++){
weights[i]+=signals[i];
}

return weights;
}

/* ======================================================
GEOMETRIA 28 NÚMEROS
====================================================== */

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

const value=b=>b.numbers.reduce(
(s,n)=>s+(weights[idx(n)]||0),0
);

const fives=BLOCKS5.map(b=>({
...b,value:value(b)
})).sort((a,b)=>b.value-a.value);

const threes=BLOCKS3.map(b=>({
...b,value:value(b)
})).sort((a,b)=>b.value-a.value);

let best=null;

for(const small of threes){

if([...required].some(
n=>!small.numbers.includes(n)
)){
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

if((item.mask&b.mask)!==0n){
continue;
}

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

const key=item.mask.toString();

if(seen.has(key))continue;

seen.add(key);
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

if(new Set(numbers).size!==28){
return null;
}

return {
score:best.score,
blocks,
numbers,
centers5:blocks.filter(b=>b.radius===2)
.map(b=>b.center),
center3:blocks.find(b=>b.radius===1).center
};
}

function candidates(history){

if(history.length<8)return [];

const result=[];

for(const family of FAMILIES){

for(const radius of RADII){

if(
family.startsWith("RX")&&
history.length<radius*2+4
){
continue;
}

const weights=motorWeights(
history,
family,
radius
);

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

let candidateCache={
signature:null,
value:[]
};

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

/* ======================================================
SOBREPOSIÇÃO ENTRE MOTORES
====================================================== */

function overlap(a,b){

if(!a?.play||!b?.play)return 0;

const A=new Set(a.play.numbers);

let shared=0;

for(const n of b.play.numbers){

if(A.has(n)){
shared++;
}
}

return shared;
}

function overlapAnalysis(cs){

const pairs=[];

for(let i=0;i<cs.length;i++){

for(let j=i+1;j<cs.length;j++){

const shared=overlap(cs[i],cs[j]);

pairs.push({
a:cs[i].key,
b:cs[j].key,
shared,
different:28-shared,
percent:shared/28
});
}
}

pairs.sort((a,b)=>b.shared-a.shared);

return {
pairs,
average:mean(pairs.map(x=>x.shared)),
mostSimilar:pairs[0]||null,
mostDifferent:pairs.at(-1)||null
};
}

/* ======================================================
MÉTRICAS VIRTUAIS E RESULTADO LÍQUIDO

Aposta reta em 28 números:
- 28 fichas na entrada
- Retorno líquido em GREEN:
  36 fichas recebidas - 28 apostadas = +8
- LOSS: -28 fichas
- GREEN G1: +8 menos custo da entrada anterior

Multiplicador do Gale configurável.
====================================================== */

function stakeConfig(){

return {
stake:Math.max(.01,Number(state.stake)||1),
galeMultiplier:Math.max(
.01,
Number(state.galeMultiplier)||1
)
};
}

function profitFor(result,options=stakeConfig()){

const unit=options.stake;
const gale=options.galeMultiplier;

if(result==="GREEN"){
return 8*unit;
}

if(result==="GREEN G1"){
return (8*gale-28)*unit;
}

if(result==="LOSS"){
return -28*(1+gale)*unit;
}

return 0;
}

function virtualState(key){

if(!state.virtualStates[key]){

state.virtualStates[key]={
phase:"ENTRY",
frozen:null,
original:null,
trigger:null,
lastMotor:null,
results:[],
pending:null
};
}

return state.virtualStates[key];
}

function virtualResults(key){

return state.virtualRows
.filter(r=>r.strategy===key&&r.closed);
}

function virtualMetrics(key,window=30){

const rows=virtualResults(key).slice(-window);

const green=rows.filter(
r=>r.result==="GREEN"
).length;

const greenG1=rows.filter(
r=>r.result==="GREEN G1"
).length;

const loss=rows.filter(
r=>r.result==="LOSS"
).length;

const net=rows.reduce(
(s,r)=>s+r.profit,0
);

let streak=0;
let maxLoss=0;

for(const r of rows){

if(r.result==="LOSS"){
streak++;
maxLoss=Math.max(maxLoss,streak);
}else{
streak=0;
}
}

return {
total:rows.length,
green,
greenG1,
loss,
hits:green+greenG1,
rate:rows.length
?(green+greenG1)/rows.length
:null,
directRate:rows.length
?green/rows.length
:null,
net,
averageNet:rows.length
?net/rows.length
:0,
maxLoss
};
}

/* ======================================================
ÍNDICE DE ESTABILIDADE
====================================================== */

function stabilityScore(key){

const a=virtualMetrics(key,3);
const b=virtualMetrics(key,12);
const c=virtualMetrics(key,30);

const sample=c.total;

if(!sample){

return {
score:0,
confidence:0,
recent:a,
medium:b,
long:c,
label:"SEM DADOS"
};
}

const baseline=28/37;

/*
 Suavização estatística:
 impede que 1 acerto seja tratado
 como taxa de 100% confiável.
*/

function smoothed(m){

const prior=8;

return (
m.hits+prior*baseline
)/(m.total+prior);
}

const r3=smoothed(a);
const r12=smoothed(b);
const r30=smoothed(c);

const consistency=
1-clamp(
(
Math.abs(r3-r12)+
Math.abs(r12-r30)
)/2,
0,1
);

const financial=
clamp(
c.averageNet/56,
-1,1
);

const lossPenalty=
clamp(c.maxLoss/6,0,1);

const score=clamp(
(
r3*.25+
r12*.30+
r30*.20+
consistency*.15+
(financial+1)/2*.10
)-
lossPenalty*.10,
0,1
);

const confidence=clamp(
sample/30,
0,1
);

const label=
sample<12?"AMOSTRA PEQUENA":
score>=.72?"ESTÁVEL":
score>=.60?"INTERMEDIÁRIA":
"INSTÁVEL";

return {
score,
confidence,
recent:a,
medium:b,
long:c,
consistency,
label
};
}

/* ======================================================
SELEÇÃO DAS ESTRATÉGIAS
====================================================== */

function motorStats(key,window=30){

const rows=state.ledger.filter(
r=>r.virtual?.some(x=>x.key===key)
).slice(-window);

let hits=0;

for(const row of rows){

const m=row.virtual.find(x=>x.key===key);

if(m?.numbers.includes(row.number)){
hits++;
}
}

return {
total:rows.length,
hits,
rate:rows.length?hits/rows.length:null
};
}

function chooseAdaptive(cs,config,previous){

const eligible=cs.filter(
c=>c.rank<=config.maxRank
);

if(!eligible.length)return cs[0]||null;

const ranked=eligible.map(c=>{

const recent=motorStats(c.key,3);
const medium=motorStats(c.key,config.window);

const score=
(recent.rate??.5)*.55+
(medium.rate??.5)*.45-
recent.total*
config.lossPenalty*
(1-(recent.rate??.5));

return {c,score};
}).sort(
(a,b)=>b.score-a.score||
a.c.rank-b.c.rank
);

const best=ranked[0];

if(!previous)return best.c;

const old=ranked.find(
x=>x.c.key===previous
);

if(
old&&
best.score<old.score+config.margin
){
return old.c;
}

return best.c;
}

function collective(cs,rule){

const weights=Array(37).fill(0);

const selected=rule==="UNION"
?cs.slice(0,3):cs;

for(const c of selected){

for(const n of c.play.numbers){

weights[idx(n)]+=
rule==="UNION"
?1
:1/(1+c.rank*.1);
}
}

const play=geometry(weights);

return play?{
key:rule,
family:rule,
radius:0,
rank:0,
score:play.score,
play
}:cs[0];
}

function strategyDefinitions(){

const defs=[];

for(const [id,name] of ORIGINALS){

defs.push({
id:"ORIGINAL:"+id,
name,
type:"ORIGINAL",
rule:id
});
}

for(let rank=1;rank<=4;rank++){

defs.push({
id:"RANK:"+rank,
name:"AUTO "+rank+"º",
type:"RANK",
rank
});
}

for(const config of ADAPTATIVES){

defs.push({
id:"ADAPTIVE:"+config.id,
name:config.name,
type:"ADAPTIVE",
config
});
}

for(const c of state.createdStrategies){

defs.push({
id:"CREATED:"+c.id,
name:c.name,
type:"CREATED",
config:c.config
});
}

return defs;
}

function chooseStrategyMotor(def,cs,previous){

if(!cs.length)return null;

const fixed=cs[
clamp(state.rank-1,0,cs.length-1)
];

if(def.type==="RANK"){

return cs[
clamp(def.rank-1,0,cs.length-1)
];
}

if(
def.type==="ADAPTIVE"||
def.type==="CREATED"
){

return chooseAdaptive(
cs,
def.config,
previous
);
}

switch(def.rule){

case "FIXED":
return fixed;

case "GEO":
return cs[0];

case "BEST":

return [...cs].sort((a,b)=>{

const A=motorStats(a.key,30);
const B=motorStats(b.key,30);

return (
(B.rate??-.1)-(A.rate??-.1)
)||a.rank-b.rank;
})[0];

case "STABLE":{

const old=cs.find(
x=>x.key===previous
);

return old&&old.rank<=5
?old:fixed;
}

case "SWITCH":{

const old=cs.find(
x=>x.key===previous
)||fixed;

const oldStats=motorStats(old.key,12);

const better=cs.map(c=>({
c,
stats:motorStats(c.key,12)
})).sort(
(a,b)=>
(b.stats.rate??-.1)-
(a.stats.rate??-.1)
)[0];

if(
better&&
better.stats.total>=8&&
oldStats.total>=8&&
better.stats.rate>
oldStats.rate+.12
){
return better.c;
}

return old;
}

case "CONSENSUS":
return collective(cs,"CONSENSUS");

case "UNION":
return collective(cs,"UNION");

default:
return fixed;
}
}

/* ======================================================
G1 AJUSTE FINO
====================================================== */

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

if(
!play||
!mandatory.every(
n=>play.numbers.includes(n)
)
){

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

/* ======================================================
SIMULAÇÃO VIRTUAL INDEPENDENTE

Cada estratégia:
1. Escolhe antes do número
2. Registra a cobertura
3. Recebe o resultado
4. Mantém Gale próprio
5. Registra lucro ou prejuízo
====================================================== */

function processVirtualSpin(number,cs){

const defs=strategyDefinitions();
const records=[];

for(const def of defs){

const vs=virtualState(def.id);

let motor=null;
let result="AGUARDANDO";
let closed=false;
let profit=0;

if(vs.phase==="ENTRY"){

motor=snapMotor(
chooseStrategyMotor(
def,
cs,
vs.lastMotor
)
);

if(!motor)continue;

vs.lastMotor=motor.key;
vs.original=clone(motor);

if(motor.play.numbers.includes(number)){

result="GREEN";
closed=true;
profit=profitFor(result);

vs.phase="ENTRY";
vs.frozen=null;
vs.original=null;

}else{

result="GALE";

vs.frozen=state.g1
?tuneG1(motor,number)
:clone(motor);

vs.trigger=number;
vs.phase="GALE";
}
}

else if(vs.phase==="GALE"){

motor=clone(vs.frozen);

const hit=!!motor?.play.numbers.includes(number);

result=hit?"GREEN G1":"LOSS";
closed=true;
profit=profitFor(result);

vs.phase="ENTRY";
vs.frozen=null;
vs.original=null;
vs.trigger=null;
}

const row={
turn:state.history.length+1,
number,
strategy:def.id,
strategyName:def.name,
motor:motor?.key||"—",
result,
closed,
profit,
numbers:motor?.play?.numbers
?[...motor.play.numbers]:[],
centers:motor?.play
?motor.play.blocks.map(b=>b.center):[],
timestamp:Date.now()
};

records.push(row);
}

state.virtualRows.push(...records);

return records;
}

/* ======================================================
TREINADOR GLOBAL
====================================================== */

let trainerCache={
signature:null,
rows:[],
recommendation:null,
protection:false
};

function trainerRanking(cs=getCandidates()){

const signature=
state.history.length+":"+
state.virtualRows.length+":"+
state.createdStrategies.length;

if(trainerCache.signature===signature){
return trainerCache;
}

const defs=strategyDefinitions();
const rows=[];

for(const def of defs){

const stable=stabilityScore(def.id);

const vs=virtualState(def.id);

const motor=chooseStrategyMotor(
def,
cs,
vs.lastMotor
);

const m3=stable.recent;
const m12=stable.medium;
const m30=stable.long;

const netScore=clamp(
(m12.averageNet+56)/112,
0,1
);

const score=
stable.score*.55+
netScore*.25+
(m3.rate??28/37)*.15+
(m30.rate??28/37)*.05;

rows.push({
...def,
motor,
stability:stable,
m3,
m12,
m30,
score
});
}

rows.sort(
(a,b)=>b.score-a.score||
a.id.localeCompare(b.id)
);

const available=rows.filter(
r=>r.m30.total>=12
);

const weak=available.filter(
r=>r.m12.net<0&&
r.m12.loss>=2
);

const protection=
available.length>=5&&
weak.length/available.length>=.7;

trainerCache={
signature,
rows,
recommendation:rows[0]||null,
protection
};

return trainerCache;
}

function changeTrainerSelection(cs=getCandidates()){

if(state.strategy!=="TRAINER"||state.manual){
return;
}

if(state.phase!=="ENTRY"){
return;
}

if(!cs.length)return;

const analysis=trainerRanking(cs);
const rows=analysis.rows;

if(!rows.length)return;

state.trainerProtection=analysis.protection;

const previous=state.trainerChoice;
const turns=state.trainerTurns||0;

const current=rows.find(
r=>r.id===previous
);

const best=rows[0];

let switchNow=!previous;
let reason="INICIAL";

if(previous){

if(turns>=3||state.trainerPending){

switchNow=true;
reason="LIMITE DE 3 GIROS";

}else if(
turns>=1&&
best.id!==previous&&
best.score>(current?.score??-1)+.035
){

switchNow=true;
reason="MELHOR DESEMPENHO RECENTE";
}
}

if(!switchNow)return;

const alternatives=previous
?rows.filter(r=>r.id!==previous)
:rows;

const selected=alternatives[0]||best;

if(!selected)return;

const previousMotor=state.trainerMotor;

if(previous&&selected.id!==previous){
state.trainerChanges++;
}

if(
previousMotor&&
selected.motor?.key&&
previousMotor!==selected.motor.key
){
state.trainerMotorChanges++;
}

state.trainerChoice=selected.id;
state.trainerMotor=selected.motor?.key||null;
state.trainerTurns=0;
state.trainerPending=false;

state.trainerHistory.push({
turn:state.history.length,
from:previous,
to:selected.id,
motor:selected.motor?.key||null,
reason,
score:selected.score,
stability:selected.stability.score,
timestamp:Date.now()
});
}

function activeDefinition(){

if(state.manual){

return {
id:"MANUAL:"+state.manual,
name:state.manual,
type:"MANUAL"
};
}

if(state.strategy==="TRAINER"){

changeTrainerSelection();

const def=strategyDefinitions().find(
x=>x.id===state.trainerChoice
);

return def||strategyDefinitions()[0];
}

if(state.strategy==="ADAPTIVE"){

return strategyDefinitions().find(
x=>x.id==="ADAPTIVE:"+state.activeAdaptive
)||strategyDefinitions()[0];
}

if(state.strategy==="CREATED"){

return strategyDefinitions().find(
x=>x.id==="CREATED:"+state.activeCreated
)||strategyDefinitions()[0];
}

return strategyDefinitions().find(
x=>x.id==="ORIGINAL:"+state.strategy
)||strategyDefinitions()[0];
}

function activeMotor(cs){

if(!cs.length)return null;

if(state.manual){

return cs.find(
x=>x.key===state.manual
)||cs[0];
}

const def=activeDefinition();

if(state.strategy==="TRAINER"){

const ranking=trainerRanking(cs);

return ranking.rows.find(
x=>x.id===state.trainerChoice
)?.motor||cs[0];
}

return chooseStrategyMotor(
def,
cs,
state.previousMotor
);
}

/* ======================================================
RESULTADO REAL CONGELADO
====================================================== */

function recordSpin(number,source="TEMPO REAL"){

const cs=getCandidates();

const virtual=cs.map(c=>({
key:c.key,
rank:c.rank,
numbers:[...c.play.numbers]
}));

const definition=activeDefinition();

const virtualRecords=processVirtualSpin(
number,
cs
);

const before=state.phase;

let motor=null;
let result="AGUARDANDO";
let played=false;
let covered=false;

let strategyName=
state.cycle?.strategy||definition.name;

let cycleSnapshot=clone(state.cycle);

if(state.phase==="ENTRY"){

motor=snapMotor(activeMotor(cs));

if(motor){

state.previousMotor=motor.key;

state.cycle={
start:state.history.length+1,
strategy:definition.name,
strategyId:definition.id,
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
result="CASA PULADA";
state.phase="SECOND_ENTRY";
}

else if(state.phase==="SECOND_ENTRY"){

motor=clone(state.frozen);

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
result="GALE PULADO";
state.phase="GALE";
}

else if(state.phase==="GALE"){

motor=clone(state.frozen);

played=!!motor;
covered=!!motor?.play.numbers.includes(number);

result=covered?"GREEN G1":"LOSS";

state.phase="ENTRY";
state.frozen=null;
state.cycle=null;
}

const row={
turn:state.history.length+1,
number,
source,
strategy:strategyName,
strategyId:cycleSnapshot?.strategyId||
definition.id,
motor:motor?.key||"—",
phase:before,
result,
played,
covered,
profit:profitFor(result),
play:motor?clone(motor.play):null,
cycle:cycleSnapshot,
virtual,
virtualStrategies:virtualRecords.map(x=>({
strategy:x.strategy,
result:x.result,
profit:x.profit
})),
timestamp:Date.now()
};

state.history.push(number);
state.sources.push(source);
state.ledger.push(row);

invalidate();

if(
state.strategy==="TRAINER"&&
!state.manual
){

state.trainerTurns++;

if(state.phase==="ENTRY"){

changeTrainerSelection();

}else if(state.trainerTurns>=3){

state.trainerPending=true;
}
}

save();

return row;
}

/* ======================================================
DESFAZER

Para preservar a consistência dos estados
virtuais, a remoção recompõe o trecho
analisado desde o início da sessão.
====================================================== */

async function undoLast(){

if(!state.history.length)return;

const numbers=state.history.slice(0,-1);
const sources=state.sources.slice(0,-1);

await rebuild(numbers,sources);
}

/* ======================================================
IMPORTAÇÃO / RECONSTRUÇÃO
====================================================== */

let importing=false;

async function rebuild(numbers,sources=null){

if(importing)return;

importing=true;

const options={
strategy:state.strategy,
rank:state.rank,
manual:state.manual,
activeAdaptive:state.activeAdaptive,
activeCreated:state.activeCreated,
createdStrategies:clone(state.createdStrategies),
g1:state.g1,
galeSkip:state.galeSkip,
secondHouse:state.secondHouse,
stake:state.stake,
galeMultiplier:state.galeMultiplier,
open:clone(state.open)
};

state=fresh();
Object.assign(state,options);

invalidate();

/*
 Importação longa:
 mantém todos os números.
 Processa virtualmente os últimos 300,
 evitando travamento do navegador.

 Os números anteriores continuam
 disponíveis para consulta.
*/

const start=Math.max(
0,
numbers.length-300
);

state.history=numbers.slice(0,start);

state.sources=(sources||[]).slice(0,start);

while(state.sources.length<start){
state.sources.push("HISTÓRICO");
}

for(let i=start;i<numbers.length;i++){

recordSpin(
numbers[i],
sources?.[i]||"HISTÓRICO"
);

if((i-start)%5===4){

$("status").textContent=
"ANALISANDO "+(i+1)+"/"+numbers.length;

await new Promise(
resolve=>setTimeout(resolve,0)
);
}
}

importing=false;

invalidate();
save();
render();
}

/* ======================================================
INDICADORES
====================================================== */

function metrics(rows){

const closed=rows.filter(
r=>["GREEN","GREEN G1","LOSS"]
.includes(r.result)
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

const net=closed.reduce(
(s,r)=>s+(r.profit||0),0
);

return {
total:closed.length,
green,
greenG1,
loss,
gale,
net,
success:green+greenG1
};
}

function metricsHTML(rows){

const m=metrics(rows);

return `
<div class="metrics">

<div class="metric">
<small>CICLOS</small>
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
<small>ACERTOS</small>
<b>${pct(m.success,m.total)}</b>
</div>

</div>

<div class="box">
RESULTADO LÍQUIDO:
<strong class="${m.net>=0?"good":"bad"}">
${fmt(m.net)} FICHAS
</strong>
</div>
`;
}

function sortedBlocks(play){

if(!play)return [];

return [...play.blocks].sort((a,b)=>{

const sa=SECTOR_ORDER.indexOf(
sector(a.center)
);

const sb=SECTOR_ORDER.indexOf(
sector(b.center)
);

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

function borderClass(result){

if(result==="LOSS"){
return "result-loss";
}

if(result.startsWith("GREEN")){
return "result-green";
}

if(
result==="GALE"||
result==="GALE PULADO"
){
return "result-gale";
}

return "";
}

function miniPanel(id,title,content){

const open=!!state.open[id];

return `
<button class="miniHead" data-panel="${id}">
${esc(title)}
<span>${open?"−":"+"}</span>
</button>

<div id="${id}" class="${open?"":"hide"}">
${open?content:""}
</div>
`;
}

/* ======================================================
TREINADOR — PAINEL
====================================================== */

function trainerHTML(){

const analysis=trainerRanking();
const selected=analysis.rows.find(
r=>r.id===state.trainerChoice
);

const best=analysis.recommendation;

const protection=analysis.protection;

return `
<div class="trainerCycle">

<div class="title">
TREINADOR GLOBAL V6.3
</div>

<p>
ESTRATÉGIAS AVALIADAS:
<b>${analysis.rows.length}</b>
</p>

<p>
ESTRATÉGIA ATIVA:
<b>${esc(selected?.name||"AGUARDANDO")}</b>
</p>

<p>
MOTOR:
<b>${esc(state.trainerMotor||"—")}</b>
</p>

<p>
GIROS DESDE A TROCA:
<b>${state.trainerTurns}</b>
</p>

<p>
REGRA:
<b>1, 2 OU 3 GIROS</b>
</p>

<p>
TROCAS DE ESTRATÉGIA:
<b>${state.trainerChanges}</b>
</p>

<p>
TROCAS DE MOTOR:
<b>${state.trainerMotorChanges}</b>
</p>

<p>
SITUAÇÃO:
<b>${
state.trainerPending
?"TROCA PENDENTE — FECHAR GALE"
:"REAVALIAÇÃO A CADA GIRO"
}</b>
</p>

</div>

<div class="virtualRecommendation">

<div class="title">
MELHOR DESEMPENHO ATUAL
</div>

<b>${esc(best?.name||"AGUARDANDO")}</b>

<p>
MOTOR:
${esc(best?.motor?.key||"—")}
</p>

<p>
ÍNDICE DE ESTABILIDADE:
${pct(
best?.stability?.score||0,
1
)}
</p>

<p>
GREEN VIRTUAL ÚLTIMOS 12 CICLOS:
${pct(
best?.m12?.hits||0,
best?.m12?.total||0
)}
</p>

<p>
RESULTADO LÍQUIDO ÚLTIMOS 12:
${fmt(best?.m12?.net||0)} FICHAS
</p>

<button class="virtualButton"
id="activateTrainer">
ATIVAR TREINADOR GLOBAL
</button>

</div>

<div class="box ${
protection?"dangerBox":""
}">

<b>INDICADOR DE PROTEÇÃO</b>

<p>
${protection
?"BAIXA CONFIANÇA: MUITAS ESTRATÉGIAS APRESENTAM RESULTADO RECENTE NEGATIVO."
:"NÃO FOI DETECTADO O GATILHO COLETIVO DE PROTEÇÃO."
}
</p>

<p class="muted">
A proteção é um alerta estatístico.
Não aumenta a aposta nem promete recuperação.
</p>

</div>

${miniPanel(
"stability",
"RANKING DE ESTABILIDADE — TODAS AS ESTRATÉGIAS",
stabilityHTML()
)}

${miniPanel(
"overlap",
"SOBREPOSIÇÃO ENTRE OS 12 MOTORES",
overlapHTML()
)}

${miniPanel(
"trainerHistory",
"HISTÓRICO DE TROCAS DO TREINADOR",
trainerHistoryHTML()
)}

${miniPanel(
"virtualRanking",
"DESEMPENHO VIRTUAL EM 3 / 12 / 30",
virtualRankingHTML()
)}
`;
}

function stabilityHTML(){

const rows=trainerRanking().rows;

return `
<div class="tablewrap">

<table>

<thead>
<tr>
<th>#</th>
<th>ESTRATÉGIA</th>
<th>MOTOR</th>
<th>ESTABILIDADE</th>
<th>AMOSTRA</th>
<th>CLASSIFICAÇÃO</th>
</tr>
</thead>

<tbody>

${rows.map((r,i)=>`
<tr>
<td>${i+1}</td>
<td>${esc(r.name)}</td>
<td>${esc(r.motor?.key||"—")}</td>
<td>${pct(r.stability.score,1)}</td>
<td>${r.m30.total}</td>
<td>${esc(r.stability.label)}</td>
</tr>
`).join("")}

</tbody>
</table>
</div>
`;
}

function virtualRankingHTML(){

return `
<div class="tablewrap">

<table>

<thead>
<tr>
<th>ESTRATÉGIA</th>
<th>3 GIROS</th>
<th>12 GIROS</th>
<th>30 GIROS</th>
<th>LÍQUIDO 12</th>
<th>LOSS MÁX.</th>
</tr>
</thead>

<tbody>

${trainerRanking().rows.map(r=>`
<tr>

<td>${esc(r.name)}</td>

<td>${pct(r.m3.hits,r.m3.total)}</td>

<td>${pct(r.m12.hits,r.m12.total)}</td>

<td>${pct(r.m30.hits,r.m30.total)}</td>

<td>${fmt(r.m12.net)}</td>

<td>${r.m30.maxLoss}</td>

</tr>
`).join("")}

</tbody>

</table>
</div>
`;
}

function overlapHTML(){

const analysis=overlapAnalysis(
getCandidates()
);

return `
<div class="box">

<b>MÉDIA DE SOBREPOSIÇÃO</b>

<p>
${fmt(analysis.average)} DOS 28 NÚMEROS
</p>

<p>
MAIS PARECIDOS:
${esc(analysis.mostSimilar?.a||"—")}
/
${esc(analysis.mostSimilar?.b||"—")}
</p>

<p>
NÚMEROS IGUAIS:
${analysis.mostSimilar?.shared??0}
</p>

<p>
MAIS DIFERENTES:
${esc(analysis.mostDifferent?.a||"—")}
/
${esc(analysis.mostDifferent?.b||"—")}
</p>

<p>
NÚMEROS DIFERENTES:
${analysis.mostDifferent?.different??0}
</p>

</div>

${analysis.pairs.slice(0,20).map(x=>`
<div class="listrow">

<b>${esc(x.a)} / ${esc(x.b)}</b>

<div class="muted">
${x.shared} IGUAIS •
${x.different} DIFERENTES
</div>

</div>
`).join("")}
`;
}

function trainerHistoryHTML(){

return state.trainerHistory.slice(-30).reverse()
.map(x=>`
<div class="listrow">

<b>GIRO ${x.turn}</b>

<div class="muted">
${esc(x.from||"INÍCIO")}
→
${esc(x.to)}

<br>

MOTOR: ${esc(x.motor)}

<br>

MOTIVO: ${esc(x.reason)}

<br>

ESTABILIDADE:
${pct(x.stability,1)}
</div>

</div>
`).join("")||
'<div class="box">NENHUMA TROCA REGISTRADA.</div>';
}

/* ======================================================
OUTROS PAINÉIS
====================================================== */

function jumpsHTML(){

const a=sequenceAnalysis(state.history);

const numeric=
a.numericStreak.direction>0?"CRESCENTE":
a.numericStreak.direction<0?"DECRESCENTE":"MISTA";

const physical=
a.physicalStreak.direction>0?"HORÁRIA":
a.physicalStreak.direction<0?"ANTI-HORÁRIA":"MISTA";

return `
<div class="box">

<b>LEITURA DOS SALTOS</b>

<p>
SEQUÊNCIA NUMÉRICA:
${numeric}
• ${a.numericStreak.length} PASSOS
</p>

<p>
DIREÇÃO FÍSICA:
${physical}
• ${a.physicalStreak.length} PASSOS
</p>

<p>
SINAL:
${esc(a.signal)}
</p>

<p>
MÉDIA ÚLTIMOS 3:
${fmt(a.averageLast3)} CASAS
</p>

<p>
MÉDIA 3 ANTERIORES:
${fmt(a.averagePrevious3)} CASAS
</p>

<p>
VARIAÇÃO:
${fmt(a.acceleration)} CASAS
</p>

<p>
SALTOS GRANDES ÚLTIMOS 12:
${a.large}
</p>

</div>

<div class="title">AUSÊNCIA DAS REGIÕES</div>

${SECTOR_ORDER.map(s=>`
<div class="listrow">
<b>${s}</b>
• ${a.regions[s].absence} GIROS
• ${a.regions[s].recent} OCORRÊNCIAS RECENTES
</div>
`).join("")}

<div class="title">ÚLTIMOS SALTOS</div>

${a.last.slice().reverse().map(x=>`
<div class="listrow">

<b>${x.from} → ${x.to}</b>
• ${x.distance} CASAS
• ${x.jump}

<div class="muted">

NUMÉRICO:
${x.numericDirection}

<br>

FÍSICO:
${x.physicalDirection}

<br>

${x.sectorFrom} → ${x.sectorTo}

<br>

${x.mirrorFrom} → ${x.mirrorTo}

</div>
</div>
`).join("")}
`;
}

function mirrorsHTML(){

const a=sequenceAnalysis(state.history);
const recent=state.history.slice(-20);

const mirrorHits=recent.filter(
n=>MIRROR.has(n)
).length;

const last=state.history.at(-1);

const near=last==null?[]:
W.filter(n=>MIRROR.has(n)&&distance(last,n)<=4);

const far=last==null?[]:
W.filter(n=>MIRROR.has(n)&&distance(last,n)>=10);

return `
<div class="box">

<b>ESPELHO / ANTIESPELHO</b>

<p>
ESPELHO:
11,12,13 • 21,22,23 • 31,32,33
E VIZINHOS FÍSICOS
</p>

<p>
ESPELHO ÚLTIMOS 20:
${mirrorHits}
</p>

<p>
ANTIESPELHO ÚLTIMOS 20:
${recent.length-mirrorHits}
</p>

<p>
TRANSIÇÕES RECENTES:
${a.mirrorTransitions}
</p>

<p>
DISTÂNCIA MÉDIA:
${fmt(mean(a.mirrorDistances))}
</p>

</div>

<div class="title">ESPELHOS PRÓXIMOS</div>

<div class="numberCloud">
${near.map(n=>`<span>${n}</span>`).join("")||"—"}
</div>

<div class="title">ESPELHOS DISTANTES</div>

<div class="numberCloud">
${far.map(n=>`<span>${n}</span>`).join("")||"—"}
</div>

<div class="title">TODOS OS ESPELHOS</div>

<div class="numberCloud">
${W.filter(n=>MIRROR.has(n))
.map(n=>`<span>${n}</span>`).join("")}
</div>

<div class="title">ANTIESPELHOS</div>

<div class="numberCloud">
${W.filter(n=>!MIRROR.has(n))
.map(n=>`<span>${n}</span>`).join("")}
</div>
`;
}

function labHTML(){

return `
<div class="box">

<b>LABORATÓRIO GLOBAL</b>

<p>
ESTRATÉGIAS ORIGINAIS,
ADAPTATIVAS E PERSONALIZADAS
SÃO COMPARADAS PELO TREINADOR.
</p>

</div>

${miniPanel(
"comparisons",
"COMPARAÇÃO GERAL",
virtualRankingHTML()
)}

${miniPanel(
"created",
"ESTRATÉGIAS CRIADAS",
state.createdStrategies.map(c=>`
<div class="listrow">
${esc(c.name)}
</div>
`).join("")||
'<div class="box">NENHUMA CRIADA.</div>'
)}

<button class="virtualButton"
id="createAdaptive">
CRIAR CÓPIA DA MELHOR ADAPTATIVA
</button>
`;
}

function timelineHTML(){

return state.ledger.slice(-80).reverse()
.map(r=>`
<div class="listrow">

<b>GIRO ${r.turn}</b>
• <b>${r.number}</b>
• <span class="${
r.result.startsWith("GREEN")?"good":
r.result==="LOSS"?"bad":""
}">
${esc(r.result)}
</span>

<div class="muted">

ESTRATÉGIA:
${esc(r.strategy)}

<br>

MOTOR:
${esc(r.motor)}

• FASE:
${esc(r.phase)}

<br>

REGIÃO:
${sector(r.number)}

• ${mirrorType(r.number)}

</div>

${r.play?`
<div class="muted">
CENTROS:
${sortedBlocks(r.play)
.map(b=>b.center).join(" • ")}
</div>
`:""}

</div>
`).join("");
}

/* ======================================================
INTERFACE
====================================================== */

const css=`

*{box-sizing:border-box}

body{
margin:0;
background:#10151e;
color:#f3f7fb;
font-family:Arial,sans-serif
}

.app{
max-width:1100px;
margin:auto;
padding:12px
}

h1{
text-align:center;
font-size:23px;
margin:16px 0 5px
}

.sub{
text-align:center;
font-size:11px;
color:#9cb3c9;
margin-bottom:18px
}

.panel{
background:#1c2634;
border:1px solid #40546c;
border-radius:11px;
padding:12px;
margin:10px 0
}

.title{
color:#32d9f4;
font-size:12px;
font-weight:bold;
margin:12px 0
}

.row{
display:flex;
flex-wrap:wrap;
gap:6px;
margin:8px 0
}

.btn{
background:#304056;
border:1px solid #69819d;
border-radius:7px;
padding:10px;
color:white;
font-weight:bold;
font-size:11px;
cursor:pointer
}

.btn.active{
background:#087f9d;
border-color:#32d9f4
}

.btn.trainer{
background:#0a6653;
border:2px solid #2c9f81
}

.btn.trainer.active{
background:#075f4e;
border:2px solid #69ffd0;
animation:trainerGlow 1.4s ease-in-out infinite
}

@keyframes trainerGlow{

0%,100%{
box-shadow:0 0 5px #19d5a0,0 0 10px #19d5a055
}

50%{
box-shadow:0 0 12px #69ffd0,0 0 24px #17f0ad
}
}

textarea{
width:100%;
height:85px;
padding:10px;
border-radius:8px;
background:#0c1623;
border:1px solid #62758b;
color:white
}

.centers{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:5px
}

.center{
padding:13px 2px;
border:2px solid #20d7f4;
background:#096a92;
border-radius:9px;
text-align:center;
font-size:22px;
font-weight:bold
}

.center.short{
background:#caa127;
border-color:#ffe282;
color:#111
}

.center small{
display:block;
font-size:9px;
margin-top:5px
}

.keys{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:5px
}

.key{
height:43px;
border:1px solid #697b8f;
border-radius:7px;
color:white;
font-size:15px;
font-weight:bold;
cursor:pointer
}

.key.zero{
grid-column:span 6
}

.metrics{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:6px
}

.metric{
background:#29384b;
padding:12px 5px;
border-radius:8px;
text-align:center
}

.metric small{
display:block;
font-size:9px;
color:#b9cad9
}

.metric b{
display:block;
font-size:23px;
margin-top:6px
}

.good{color:#4ee2a2}
.bad{color:#ff778c}

.muted{
font-size:11px;
color:#afc0d1;
line-height:1.7
}

.box{
background:#111d2a;
border:1px solid #425a75;
padding:12px;
border-radius:9px;
margin:9px 0;
font-size:12px;
line-height:1.7
}

.head{
display:flex;
justify-content:space-between;
width:100%;
background:#2c3d51;
color:white;
border:1px solid #5e7895;
border-radius:8px;
padding:12px;
font-weight:bold;
cursor:pointer
}

.hide{display:none}

.history{
display:flex;
flex-wrap:wrap;
gap:5px
}

.chip{
padding:8px;
border:2px solid #718397;
border-radius:7px;
min-width:47px;
text-align:center
}

.chip.result-green{
border:3px solid #24f49a;
box-shadow:0 0 6px #24f49a88
}

.chip.result-gale{
border:3px solid #ffda35;
box-shadow:0 0 6px #ffda3588
}

.chip.result-loss{
border:3px solid #ff386c;
box-shadow:0 0 7px #ff386c99
}

.chip b{
display:block;
font-size:18px
}

.chip small{
font-size:9px
}

.listrow{
border-bottom:1px solid #35475b;
padding:9px 3px;
font-size:11px;
line-height:1.7
}

.tablewrap{
overflow:auto
}

table{
width:100%;
border-collapse:collapse;
min-width:700px;
font-size:11px
}

td,th{
padding:9px;
border-bottom:1px solid #40516a;
text-align:left
}

th{
color:#50d9ee
}

.virtualRecommendation{
background:#102f27;
border:1px solid #35a981;
border-radius:10px;
padding:14px;
margin:10px 0
}

.virtualButton{
width:100%;
background:#0b8466;
border:1px solid #52e6b5;
color:white;
border-radius:9px;
padding:14px;
font-size:13px;
font-weight:bold;
cursor:pointer;
margin:8px 0
}

.miniHead{
display:flex;
justify-content:space-between;
width:100%;
margin:10px 0 0;
padding:11px;
background:#24364b;
border:1px solid #4c6985;
border-radius:8px;
color:#d6eafa;
font-size:11px;
font-weight:bold;
cursor:pointer
}

.strategyGroup{
margin-top:12px;
padding-top:8px;
border-top:1px solid #34485e
}

.strategyLabel{
font-size:10px;
color:#7fe1f3;
font-weight:bold;
margin:8px 0
}

.status{
padding:8px;
font-size:11px;
color:#81dceb
}

.trainerCycle{
background:#102c26;
border:1px solid #30bf91;
padding:12px;
border-radius:9px;
margin:10px 0
}

.trainerCycle b{
color:#7fffd2
}

.numberCloud{
display:flex;
flex-wrap:wrap;
gap:5px;
margin:10px 0
}

.numberCloud span{
padding:8px;
background:#273b50;
border:1px solid #60829f;
border-radius:6px;
font-size:12px;
font-weight:bold
}

.warning{
border-left:3px solid #d9a63c;
padding:9px;
background:#2b281f;
color:#e8d5a6;
font-size:11px;
line-height:1.6
}

.dangerBox{
border:2px solid #ff5679;
background:#38212a
}

input[type=number]{
background:#0c1623;
color:white;
border:1px solid #62758b;
border-radius:7px;
padding:9px;
width:110px
}

@media(max-width:600px){

.center{
font-size:18px;
padding:12px 1px
}

.center small{
font-size:8px
}

.btn{
font-size:10px;
padding:9px
}
}
`;

document.body.innerHTML=`
<style>${css}</style>

<main class="app">

<h1>ANÁLISE BETA V${VERSION}</h1>

<div class="sub">
12 MOTORES • TREINADOR GLOBAL •
ESTABILIDADE • 28 NÚMEROS
</div>

<section class="panel">

<div class="title">IMPORTAR HISTÓRICO</div>

<textarea id="paste"
placeholder="Cole os números do mais antigo ao mais recente"></textarea>

<div class="row">

<button class="btn" id="import">
IMPORTAR E ANALISAR
</button>

<button class="btn" id="restoreOld">
RECUPERAR HISTÓRICO ANTERIOR
</button>

<button class="btn" id="undo">
APAGAR ÚLTIMO
</button>

<button class="btn" id="clear">
ZERAR
</button>

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

<div class="title">CONFIGURAÇÃO DAS FICHAS</div>

<div class="row">

<label>
VALOR DA FICHA
<input type="number"
id="stake"
min="0.01"
step="0.01">
</label>

<label>
MULTIPLICADOR G1
<input type="number"
id="galeMultiplier"
min="0.01"
step="0.01">
</label>

</div>

<div class="muted">
O cálculo considera uma ficha por número
coberto na entrada e o multiplicador
configurado no Gale.
</div>

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
["trainer","TREINADOR GLOBAL E ESTABILIDADE"],
["lab","LABORATÓRIO DE ESTRATÉGIAS"],
["motors","12 MOTORES E RANKING"],
["jumps","SALTOS • CRESCENTE / DECRESCENTE"],
["mirrors","ESPELHO / ANTIESPELHO"],
["timeline","LINHA DO TEMPO — GREEN / GALE / LOSS"]
].map(([id,title])=>`
<section class="panel">

<button class="head" data-panel="${id}">
${title}
<span>−</span>
</button>

<div id="${id}"></div>

</section>
`).join("")}

<div class="warning">
A comparação virtual mede o desempenho observado.
Não garante acertos futuros nem elimina a vantagem
matemática da casa.
</div>

</main>
`;

/* ======================================================
BOTÕES
====================================================== */

function makeButton(label,fn,parent,extra=""){

const b=document.createElement("button");

b.className="btn "+extra;
b.textContent=label;
b.onclick=fn;

parent.appendChild(b);

return b;
}

function changeStrategy(
rule,
adaptive=null,
created=null
){

state.manual=null;
state.strategy=rule;
state.activeAdaptive=adaptive;
state.activeCreated=created;

if(rule==="TRAINER"){

state.trainerChoice=null;
state.trainerMotor=null;
state.trainerTurns=0;
state.trainerPending=false;

if(state.phase==="ENTRY"){
changeTrainerSelection();
}
}

save();
render();
}

function buildStrategyButtons(){

const root=$("strategies");

root.innerHTML="";

const groups=[
[
"TREINADOR GLOBAL",
[
[
"TREINADOR ESTRATÉGICO",
()=>changeStrategy("TRAINER"),
"trainer"
]
]
],
[
"ESTRATÉGIAS ORIGINAIS",
ORIGINALS.map(([key,name])=>[
name,
()=>changeStrategy(key),
key
])
],
[
"12 ADAPTATIVAS",
ADAPTATIVES.map(c=>[
c.name,
()=>changeStrategy("ADAPTIVE",c.id),
c.id
])
]
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
<div class="strategyLabel">
ESTRATÉGIAS PERSONALIZADAS
</div>
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

$("stake").value=state.stake;

$("galeMultiplier").value=
state.galeMultiplier;

$("stake").onchange=()=>{

state.stake=Math.max(
.01,
Number($("stake").value)||1
);

save();
render();
};

$("galeMultiplier").onchange=()=>{

state.galeMultiplier=Math.max(
.01,
Number($("galeMultiplier").value)||1
);

save();
render();
};

/* ======================================================
TECLADO
====================================================== */

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

/* ======================================================
IMPORTAÇÃO
====================================================== */

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
)){
return;
}

$("paste").value="";

rebuild(numbers);
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
)){
return;
}

rebuild(old.history);
};

$("undo").onclick=()=>{

if(importing)return;

undoLast();
};

$("clear").onclick=()=>{

if(importing)return;

if(!confirm(
"APAGAR TODO O HISTÓRICO?"
)){
return;
}

state=fresh();

invalidate();
buildStrategyButtons();
save();
render();
};

/* ======================================================
PAINÉIS
====================================================== */

document.addEventListener("click",event=>{

const button=event.target.closest(
"[data-panel]"
);

if(!button)return;

const id=button.dataset.panel;

state.open[id]=!state.open[id];

save();
render();
});

function applyOpenState(){

for(const [id,open] of Object.entries(
state.open
)){

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

/* ======================================================
RENDERIZAÇÃO
====================================================== */

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
const definition=activeDefinition();

const selected=state.frozen||
snapMotor(activeMotor(cs));

const play=selected?.play||null;

$("status").textContent=
state.history.length+
" NÚMEROS PRESERVADOS • "+
cs.length+
"/12 MOTORES • "+
state.phase+
(saveError
?" • ARMAZENAMENTO NÃO SALVO"
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
?state.cycle?.strategy||definition.name
:definition.name)+
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

const turn=
state.history.length-last.length+i+1;

const row=state.ledger.find(
r=>r.turn===turn
);

const result=row?.result||"HISTÓRICO";

return `
<div class="chip ${borderClass(result)}"
style="background:${
n===0?"#087b50":
RED.has(n)?"#a72740":"#14181f"
}">

<b>${n}</b>
<small>${esc(result)}</small>

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
NÚMEROS ARMAZENADOS:
<b>${state.history.length}</b>
</div>

`;
}

if(state.open.trainer){

$("trainer").innerHTML=trainerHTML();

const activate=$("activateTrainer");

if(activate){

activate.onclick=()=>{
changeStrategy("TRAINER");
};
}
}

if(state.open.lab){

$("lab").innerHTML=labHTML();

const create=$("createAdaptive");

if(create){

create.onclick=()=>{

const ranking=trainerRanking();

const best=ranking.rows.find(
r=>r.type==="ADAPTIVE"
);

if(!best)return;

const created={
id:"VIRTUAL_"+Date.now(),
name:"ESTRATÉGIA VIRTUAL "+
(state.createdStrategies.length+1),
config:clone(best.config)
};

state.createdStrategies.push(created);

state.strategy="CREATED";
state.activeCreated=created.id;
state.manual=null;

buildStrategyButtons();
invalidate();
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
• ${esc(c.key)}
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
$("jumps").innerHTML=jumpsHTML();
}

if(state.open.mirrors){
$("mirrors").innerHTML=mirrorsHTML();
}

if(state.open.timeline){
$("timeline").innerHTML=timelineHTML();
}

applyOpenState();
}

/* ======================================================
INICIALIZAÇÃO
====================================================== */

render();

})();
