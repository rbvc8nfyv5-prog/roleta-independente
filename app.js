
(() => {
"use strict";

/* ======================================================
 ANÁLISE BETA V6.3.3

 BASE V6.3.2 PRESERVADA
 ALTERAÇÃO V6.3.3:
 NÚMEROS DA JOGADA MAIORES E CENTRALIZADOS
 REGIÃO E VIZINHOS ABAIXO DO NÚMERO

 12 MOTORES
 7 ESTRATÉGIAS ORIGINAIS
 12 ADAPTATIVAS
 ESTRATÉGIAS PERSONALIZADAS
 TREINADOR GLOBAL
 TREINADOR GLOBAL G1
 G1 CONGELADO
 G1 AJUSTE FINO
 G1 RECONSTRUÇÃO
 HISTÓRICO E SIMULAÇÃO VIRTUAL
 28 NÚMEROS SEM SOBREPOSIÇÃO
====================================================== */

const VERSION="6.3.3";
const KEY="ANALISE_BETA_V633";

const OLD_KEYS=[
"ANALISE_BETA_V632",
"ANALISE_BETA_V631",
"ANALISE_BETA_V63",
"ANALISE_BETA_V62",
"ANALISE_BETA_V61",
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

const REGIONS={
TIERS:[27,13,36,11,30,8,23,10,5,24,16,33],
ORFAOS:[17,34,6,1,20,14,31,9],
VOISINS:[22,18,29,7,25,2,21,4,19],
ZERO:[28,12,35,3,26,0,32,15]
};

const REGION_NAMES=[
"TIERS","ORFAOS","VOISINS","ZERO"
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

const ADAPTATIVES=Array.from(
{length:12},
(_,i)=>({
id:"A"+String(i+1).padStart(2,"0"),
name:"ADAPTATIVA "+String(i+1).padStart(2,"0"),
window:[10,10,10,20,20,20,30,30,20,30,20,30][i],
margin:[.05,.10,.15,.05,.10,.15,.05,.10,.08,.12,.10,.08][i],
maxRank:[12,12,12,12,12,12,12,12,12,6,4,8][i]
})
);

const G1_MODES=[
"CONGELADO",
"AJUSTE FINO",
"RECONSTRUÇÃO"
];

const $=id=>document.getElementById(id);
const mod=n=>(n%37+37)%37;
const idx=n=>W.indexOf(n);
const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
const avg=a=>a.length?a.reduce((s,n)=>s+n,0)/a.length:0;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fmt=n=>Number.isFinite(n)?n.toFixed(2).replace(".",","):"—";
const pct=(a,b)=>b?fmt(100*a/b)+"%":"—";

function esc(v){
return String(v??"").replace(/[&<>"']/g,c=>({
"&":"&amp;","<":"&lt;",">":"&gt;",
'"':"&quot;","'":"&#39;"
}[c]));
}

function neighbors(n,r){
const p=idx(n);
return Array.from(
{length:2*r+1},
(_,i)=>W[mod(p+i-r)]
);
}

function distance(a,b){
const d=Math.abs(idx(a)-idx(b));
return Math.min(d,37-d);
}

function direction(a,b){
const forward=mod(idx(b)-idx(a));
const backward=mod(idx(a)-idx(b));
return forward<=backward?forward:-backward;
}

function region(n){
return REGION_NAMES.find(
s=>REGIONS[s].includes(n)
)||"ZERO";
}

const MIRROR=new Set();

for(const n of [11,12,13,21,22,23,31,32,33]){
for(const x of neighbors(n,1)){
MIRROR.add(x);
}
}

function mirror(n){
return MIRROR.has(n)?"ESPELHO":"ANTIESPELHO";
}

function jump(d){
return d<=4?"CURTO":d<=9?"MÉDIO":"GRANDE";
}

/* ======================================================
 ESTADO E ARMAZENAMENTO
====================================================== */

function fresh(){
return {
history:[],
sources:[],
ledger:[],
virtualRows:[],
virtualCycles:{},
createdStrategies:[],

strategy:"TRAINER",
rank:3,
manual:null,
activeAdaptive:"A05",
activeCreated:null,

g1:true,
galeSkip:false,
secondHouse:false,

g1Trainer:false,
g1Mode:"AUTO",
g1Decision:null,
g1History:[],
g1Virtual:[],

phase:"ENTRY",
cycle:null,
frozen:null,
previousMotor:null,

trainerChoice:null,
trainerMotor:null,
trainerTurns:0,
trainerPending:false,
trainerChanges:0,
trainerHistory:[],
protection:false,

stake:1,
galeMultiplier:1,

open:{
general:true,
trainer:true,
motors:false,
jumps:false,
mirrors:false,
timeline:true,
lab:false,
ranking:false,
overlap:false,
changes:false
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
let loadedFrom=null;

for(const key of [KEY,...OLD_KEYS]){
const data=read(key);

if(data&&Array.isArray(data.history)){
state={
...fresh(),
...data,
open:{
...fresh().open,
...(data.open||{})
}
};
loadedFrom=key;
break;
}
}

state.history=state.history.filter(
n=>Number.isInteger(n)&&n>=0&&n<=36
);

state.ledger=Array.isArray(state.ledger)
?state.ledger:[];

state.sources=Array.isArray(state.sources)
?state.sources:[];

state.virtualRows=Array.isArray(state.virtualRows)
?state.virtualRows:[];

state.virtualCycles={};

state.trainerHistory=Array.isArray(state.trainerHistory)
?state.trainerHistory:[];

state.createdStrategies=Array.isArray(
state.createdStrategies
)?state.createdStrategies:[];

state.g1History=Array.isArray(state.g1History)
?state.g1History:[];

state.g1Virtual=Array.isArray(state.g1Virtual)
?state.g1Virtual:[];

state.g1Trainer=!!state.g1Trainer;

let storageWarning=false;

function save(){
try{
localStorage.setItem(KEY,JSON.stringify(state));
storageWarning=false;
return true;
}catch(e){
storageWarning=true;
return false;
}
}

if(loadedFrom&&loadedFrom!==KEY){
save();
}

/* ======================================================
 LEITURA FÍSICA E SEQUENCIAL
====================================================== */

function analyze(history){

const h=history.slice(-45);
const transitions=[];

for(let i=1;i<h.length;i++){

const a=h[i-1];
const b=h[i];
const pd=direction(a,b);

transitions.push({
from:a,
to:b,
numeric:b-a,
physical:pd,
distance:Math.abs(pd),
jump:jump(Math.abs(pd)),
mirrorFrom:mirror(a),
mirrorTo:mirror(b)
});
}

const last6=transitions.slice(-6);
const last3=transitions.slice(-3);
const prev3=transitions.slice(-6,-3);

function streak(field){

const last=transitions.at(-1);
if(!last)return {dir:0,length:0};

const dir=Math.sign(last[field]);
if(!dir)return {dir:0,length:0};

let length=0;

for(let i=transitions.length-1;i>=0;i--){
if(Math.sign(transitions[i][field])!==dir)break;
length++;
}

return {dir,length};
}

const regions={};

for(const s of REGION_NAMES){

let absence=0;

for(let i=history.length-1;i>=0;i--){
if(region(history[i])===s)break;
absence++;
}

regions[s]={
absence,
recent:history.slice(-12)
.filter(n=>region(n)===s).length
};
}

return {
transitions,
last6,
numericStreak:streak("numeric"),
physicalStreak:streak("physical"),
mean3:avg(last3.map(x=>x.distance)),
previous3:avg(prev3.map(x=>x.distance)),
acceleration:
avg(last3.map(x=>x.distance))-
avg(prev3.map(x=>x.distance)),
regions,
mirrorTransitions:last6.filter(
x=>x.mirrorFrom!==x.mirrorTo
).length,
mirrorDistance:avg(
last6.filter(x=>
x.mirrorFrom==="ESPELHO"||
x.mirrorTo==="ESPELHO"
).map(x=>x.distance)
)
};
}

/* ======================================================
 PESOS DOS 12 MOTORES
====================================================== */

function weightsFor(history,family,radius){

const weights=Array(37).fill(.01);
const recent=history.slice(-50);

for(let k=0;k<recent.length;k++){

const p=idx(recent[recent.length-1-k]);
const decay=Math.exp(-k/(radius*2.3));

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

const p=idx(history[history.length-1-k]);

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

const start=Math.max(
0,
history.length-160-length
);

for(let i=start;i+length<history.length-1;i++){

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

for(const match of matches.slice(0,12)){

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

if(history.length>=3){

const a=analyze(history);
const last=history.at(-1);

const nUp=a.last6.filter(x=>x.numeric>0).length;
const nDown=a.last6.filter(x=>x.numeric<0).length;

const numericBias=
(nUp-nDown)/Math.max(1,nUp+nDown);

const cw=a.last6.filter(x=>x.physical>0).length;
const ccw=a.last6.filter(x=>x.physical<0).length;

const physicalBias=
(cw-ccw)/Math.max(1,cw+ccw);

const expected=clamp(
Math.round(avg(a.last6.map(x=>x.distance))),
1,18
);

const lastJump=a.last6.at(-1)?.distance||0;

const target=clamp(
Math.round(lastJump+a.acceleration*.5),
1,18
);

const strength={
NORMAL:.72,
DINAMICO:1,
RX_NORMAL:.88,
RX_DINAMICO:1.12
}[family]||1;

for(const n of W){

const nd=n-last;
const pd=direction(last,n);
const d=Math.abs(pd);

let bonus=0;

if(
numericBias&&
Math.sign(nd)===Math.sign(numericBias)
){
bonus+=.10*Math.abs(numericBias);
}

if(
a.numericStreak.length>=2&&
Math.sign(nd)===a.numericStreak.dir
){
bonus+=.07;
}

if(
physicalBias&&
Math.sign(pd)===Math.sign(physicalBias)
){
bonus+=.12*Math.abs(physicalBias);
}

if(
a.physicalStreak.length>=2&&
Math.sign(pd)===a.physicalStreak.dir
){
bonus+=.07;
}

if(Math.abs(d-expected)<=2){
bonus+=.09;
}

if(Math.abs(d-target)<=2){
bonus+=.09;
}

if(a.acceleration>=3&&d>=10){
bonus+=.07;
}

if(a.acceleration<=-3&&d<=5){
bonus+=.07;
}

const change=mirror(n)!==mirror(last);
const rate=a.mirrorTransitions/
Math.max(1,a.last6.length);

bonus+=change
?.045*rate
:.045*(1-rate);

if(
a.mirrorDistance&&
Math.abs(d-a.mirrorDistance)<=2
){
bonus+=.055;
}

if(a.mean3>=9){
bonus+=.045/
(1+a.regions[region(n)].recent*.2);
}

weights[idx(n)]+=bonus*strength*radius/5;
}
}

return weights;
}

/* ======================================================
 GEOMETRIA RÁPIDA
 5 BLOCOS DE 5 + 1 BLOCO DE 3
====================================================== */

const FIVE=[];
const THREE=[];

for(let p=0;p<37;p++){

for(const radius of [1,2]){

const numbers=neighbors(W[p],radius);

const block={
center:W[p],
radius,
numbers,
mask:numbers.reduce(
(s,n)=>s|(1n<<BigInt(idx(n))),
0n
)
};

(radius===1?THREE:FIVE).push(block);
}
}

function geometry(weights,mandatory=[]){

const scored=b=>({
...b,
value:b.numbers.reduce(
(s,n)=>s+weights[idx(n)],0
)
});

const fives=FIVE.map(scored)
.sort((a,b)=>b.value-a.value);

const threes=THREE.map(scored)
.sort((a,b)=>b.value-a.value);

const allowed=threes.filter(b=>
mandatory.every(n=>b.numbers.includes(n))
);

let best=null;

for(const small of allowed){

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

next.sort((a,b)=>b.score-a.score);

const seen=new Set();
beam=[];

for(const item of next){

const key=item.mask.toString();

if(seen.has(key))continue;

seen.add(key);
beam.push(item);

if(beam.length>=5)break;
}

if(!beam.length)break;
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
centers5:blocks.filter(
b=>b.radius===2
).map(b=>b.center),
center3:blocks.find(
b=>b.radius===1
).center
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
)continue;

const weights=weightsFor(
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

let cacheKey=null;
let cacheValue=[];

function getCandidates(){

const h=state.history.slice(-200);

const key=state.history.length+
":"+h.slice(-30).join(",");

if(key===cacheKey)return cacheValue;

cacheKey=key;
cacheValue=candidates(h);

return cacheValue;
}

function invalidate(){
cacheKey=null;
}

/* ======================================================
 ESTRATÉGIAS
====================================================== */

function definitions(){

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

function recentMotorRate(key,window=12){

const rows=state.ledger.filter(
r=>r.virtual?.some(v=>v.key===key)
).slice(-window);

let hits=0;

for(const row of rows){

const v=row.virtual.find(x=>x.key===key);

if(v?.numbers.includes(row.number)){
hits++;
}
}

return rows.length?hits/rows.length:null;
}

function chooseMotor(def,cs,previous){

if(!cs.length)return null;

const fixed=cs[
clamp(state.rank-1,0,cs.length-1)
];

if(def.type==="RANK"){
return cs[clamp(def.rank-1,0,cs.length-1)];
}

if(
def.type==="ADAPTIVE"||
def.type==="CREATED"
){

const config=def.config||ADAPTATIVES[4];

const eligible=cs.filter(
c=>c.rank<=config.maxRank
);

const ranked=eligible.map(c=>{

const short=recentMotorRate(c.key,3);
const medium=recentMotorRate(
c.key,config.window
);

return {
c,
score:
(short??.5)*.55+
(medium??.5)*.45
};
}).sort((a,b)=>
b.score-a.score||
a.c.rank-b.c.rank
);

const best=ranked[0];

const old=ranked.find(
x=>x.c.key===previous
);

if(
old&&best&&
best.score<old.score+config.margin
){
return old.c;
}

return best?.c||fixed;
}

if(def.rule==="GEO")return cs[0];

if(def.rule==="BEST"){

return [...cs].sort((a,b)=>
(recentMotorRate(b.key,20)??-.1)-
(recentMotorRate(a.key,20)??-.1)
||a.rank-b.rank
)[0];
}

if(def.rule==="STABLE"){

const old=cs.find(
c=>c.key===previous
);

return old&&old.rank<=5?old:fixed;
}

if(def.rule==="SWITCH"){

const old=cs.find(
c=>c.key===previous
)||fixed;

const best=[...cs].sort((a,b)=>
(recentMotorRate(b.key,12)??-.1)-
(recentMotorRate(a.key,12)??-.1)
)[0];

return (
(recentMotorRate(best.key,12)??0)>
(recentMotorRate(old.key,12)??0)+.12
)?best:old;
}

if(
def.rule==="CONSENSUS"||
def.rule==="UNION"
){

const weights=Array(37).fill(0);

const selected=def.rule==="UNION"
?cs.slice(0,3):cs;

for(const c of selected){

for(const n of c.play.numbers){

weights[idx(n)]+=
def.rule==="UNION"
?1:1/(1+c.rank*.1);
}
}

const play=geometry(weights);

if(play){

return {
key:def.rule,
rank:0,
score:play.score,
play
};
}
}

return fixed;
}

function snap(m){

return m?{
key:m.key,
rank:m.rank,
score:m.score,
play:clone(m.play)
}:null;
}

function tuneG1(original,n){

if(!original)return null;

const mandatory=neighbors(n,1);
const weights=Array(37).fill(.01);

for(const x of original.play.numbers){
weights[idx(x)]+=100;
}

for(const x of mandatory){
weights[idx(x)]+=100000;
}

const play=geometry(weights,mandatory);

if(!play)return clone(original);

return {
...clone(original),
play,
g1:true,
trigger:n
};
}

/* ======================================================
 TREINADOR GLOBAL G1
 LÓGICA V6.3.2 PRESERVADA
====================================================== */

function validG1Play(play){
return !!play&&
Array.isArray(play.numbers)&&
play.numbers.length===28&&
new Set(play.numbers).size===28;
}

function g1Options(original,trigger,cs){

const options=[];

if(validG1Play(original?.play)){

options.push({
mode:"CONGELADO",
key:original.key,
rank:original.rank||0,
motor:clone(original)
});
}

const fine=tuneG1(original,trigger);

if(validG1Play(fine?.play)){

options.push({
mode:"AJUSTE FINO",
key:original.key,
rank:original.rank||0,
motor:clone(fine)
});
}

for(const c of cs){

if(!validG1Play(c.play))continue;

options.push({
mode:"RECONSTRUÇÃO",
key:c.key,
rank:c.rank,
motor:snap(c)
});
}

return options;
}

function g1Evidence(option,strategyId){

const events=state.g1Virtual.filter(
e=>e.mode===option.mode&&
e.key===option.key
);

const same=events.filter(
e=>e.strategyId===strategyId
);

const sample=same.length>=5?same:events;

const last3=sample.slice(-3);
const last12=sample.slice(-12);
const last30=sample.slice(-30);

const rate=rows=>rows.length
?rows.filter(x=>x.hit).length/rows.length
:null;

const r3=rate(last3);
const r12=rate(last12);
const r30=rate(last30);

let losses=0;

for(let i=sample.length-1;i>=0;i--){

if(sample[i].hit)break;
losses++;
}

const baseline=28/37;

const smooth=(r,n)=>r===null
?baseline
:(r*n+baseline*8)/(n+8);

const a=smooth(r3,last3.length);
const b=smooth(r12,last12.length);
const c=smooth(r30,last30.length);

const consistency=1-clamp(
(Math.abs(a-b)+Math.abs(b-c))/2,
0,1
);

const score=
a*.25+
b*.35+
c*.25+
consistency*.15-
Math.min(losses,5)*.018;

return {
score,
sample:sample.length,
r3,r12,r30,
losses
};
}

function g1Decision(original,trigger,cs){

const options=g1Options(original,trigger,cs);

if(!options.length){
return null;
}

const strategyId=
state.cycle?.strategyId||
activeDefinition().id;

const ranked=options.map(option=>{

const evidence=g1Evidence(
option,
strategyId
);

const originalCoverage=
new Set(original.play.numbers);

let retained=0;

for(const n of option.motor.play.numbers){

if(originalCoverage.has(n)){
retained++;
}
}

const continuity=retained/28;

const rankScore=option.rank>0
?1-(option.rank-1)/12
:.5;

const score=
evidence.score*.78+
continuity*.12+
rankScore*.10;

return {
...option,
evidence,
score
};
});

ranked.sort((a,b)=>
b.score-a.score||
a.rank-b.rank
);

const chosen=ranked[0];

return {
mode:chosen.mode,
key:chosen.key,
rank:chosen.rank,
motor:clone(chosen.motor),
score:chosen.score,
strategyId,
trigger,
turn:state.history.length,
alternatives:ranked.map(x=>({
mode:x.mode,
key:x.key,
rank:x.rank,
score:x.score,
sample:x.evidence.sample
}))
};
}

function chooseG1(original,trigger){

const cs=getCandidates();

if(!state.g1Trainer){

const motor=state.g1
?tuneG1(original,trigger)
:clone(original);

state.g1Decision={
mode:state.g1?"AJUSTE FINO":"CONGELADO",
key:motor?.key||original?.key||"—",
rank:motor?.rank||0,
strategyId:state.cycle?.strategyId||"",
trigger,
turn:state.history.length,
trainer:false
};

return motor;
}

const decision=g1Decision(
original,
trigger,
cs
);

if(!decision){

const fallback=state.g1
?tuneG1(original,trigger)
:clone(original);

return fallback;
}

state.g1Decision={
mode:decision.mode,
key:decision.key,
rank:decision.rank,
score:decision.score,
strategyId:decision.strategyId,
trigger:decision.trigger,
turn:decision.turn,
trainer:true
};

return clone(decision.motor);
}

function registerG1Virtual(
original,
trigger,
strategyId,
resultNumber,
csBefore
){

const options=g1Options(
original,
trigger,
csBefore
);

for(const option of options){

state.g1Virtual.push({
turn:state.history.length+1,
strategyId,
mode:option.mode,
key:option.key,
rank:option.rank,
trigger,
outcome:resultNumber,
hit:option.motor.play.numbers.includes(
resultNumber
)
});
}

if(state.g1Virtual.length>3000){

state.g1Virtual.splice(
0,
state.g1Virtual.length-3000
);
}
}

/* ======================================================
 AVALIAÇÃO VIRTUAL
====================================================== */

function profit(result){

const unit=Number(state.stake)||1;
const g=Number(state.galeMultiplier)||1;

if(result==="GREEN")return 8*unit;

if(result==="GREEN G1"){
return (8*g-28)*unit;
}

if(result==="LOSS"){
return -28*(1+g)*unit;
}

return 0;
}

function virtualCycle(id){

if(!state.virtualCycles[id]){

state.virtualCycles[id]={
phase:"ENTRY",
frozen:null,
previous:null
};
}

return state.virtualCycles[id];
}

function processVirtual(number,cs){

const defs=definitions();

for(const def of defs){

const v=virtualCycle(def.id);

let motor=null;
let result="AGUARDANDO";
let closed=false;

if(v.phase==="ENTRY"){

motor=snap(chooseMotor(
def,cs,v.previous
));

if(!motor)continue;

v.previous=motor.key;

if(motor.play.numbers.includes(number)){

result="GREEN";
closed=true;

}else{

result="GALE";

v.frozen=state.g1
?tuneG1(motor,number)
:clone(motor);

v.phase="GALE";
}
}

else{

motor=clone(v.frozen);

result=motor?.play.numbers.includes(number)
?"GREEN G1":"LOSS";

closed=true;
v.phase="ENTRY";
v.frozen=null;
}

state.virtualRows.push({
turn:state.history.length+1,
strategy:def.id,
number,
motor:motor?.key||"—",
result,
closed,
profit:profit(result)
});
}

if(state.virtualRows.length>9000){

state.virtualRows.splice(
0,
state.virtualRows.length-9000
);
}
}

/* ======================================================
 ESTABILIDADE
====================================================== */

function virtualMetrics(id,window){

const rows=state.virtualRows.filter(
r=>r.strategy===id&&r.closed
).slice(-window);

let green=0;
let g1=0;
let loss=0;
let streak=0;
let maxLoss=0;
let net=0;

for(const r of rows){

net+=r.profit;

if(r.result==="GREEN"){
green++;
streak=0;
}

if(r.result==="GREEN G1"){
g1++;
streak=0;
}

if(r.result==="LOSS"){
loss++;
streak++;
maxLoss=Math.max(maxLoss,streak);
}
}

return {
total:rows.length,
green,g1,loss,
hits:green+g1,
net,maxLoss,
rate:rows.length
?(green+g1)/rows.length:null,
average:rows.length?net/rows.length:0
};
}

function stability(id){

const m3=virtualMetrics(id,3);
const m12=virtualMetrics(id,12);
const m30=virtualMetrics(id,30);

const baseline=28/37;

const smooth=m=>(
m.hits+8*baseline
)/(m.total+8);

const a=smooth(m3);
const b=smooth(m12);
const c=smooth(m30);

const consistency=1-clamp(
(Math.abs(a-b)+Math.abs(b-c))/2,
0,1
);

const finance=clamp(
(m12.average+56)/112,
0,1
);

const score=clamp(
a*.25+
b*.30+
c*.20+
consistency*.15+
finance*.10-
Math.min(m30.maxLoss,6)*.015,
0,1
);

return {
m3,m12,m30,
score,
label:
m30.total<12?"AMOSTRA PEQUENA":
score>=.72?"ESTÁVEL":
score>=.60?"INTERMEDIÁRIA":
"INSTÁVEL"
};
}

/* ======================================================
 TREINADOR GLOBAL ORIGINAL
====================================================== */

let rankingCacheKey=null;
let rankingCache=null;

function trainerRanking(cs=getCandidates()){

const key=
state.history.length+":"+
state.virtualRows.length+":"+
state.createdStrategies.length;

if(rankingCacheKey===key&&rankingCache){
return rankingCache;
}

const rows=definitions().map(def=>{

const s=stability(def.id);
const v=virtualCycle(def.id);

const motor=chooseMotor(
def,cs,v.previous
);

const score=
s.score*.70+
clamp((s.m12.average+56)/112,0,1)*.20+
(s.m3.rate??28/37)*.10;

return {
...def,
motor,
stability:s,
score
};
});

rows.sort(
(a,b)=>b.score-a.score||
a.id.localeCompare(b.id)
);

const qualified=rows.filter(
r=>r.stability.m30.total>=12
);

const bad=qualified.filter(
r=>r.stability.m12.net<0&&
r.stability.m12.loss>=2
);

const protection=
qualified.length>=5&&
bad.length/qualified.length>=.7;

rankingCacheKey=key;

rankingCache={
rows,
best:rows[0]||null,
protection
};

return rankingCache;
}

function trainerUpdate(cs=getCandidates()){

if(
state.strategy!=="TRAINER"||
state.manual||
state.phase!=="ENTRY"||
!cs.length
)return;

const ranking=trainerRanking(cs);

state.protection=ranking.protection;

const previous=state.trainerChoice;
const turns=state.trainerTurns;

const current=ranking.rows.find(
r=>r.id===previous
);

const best=ranking.best;

if(!best)return;

let shouldChange=!previous;
let reason="INICIAL";

if(previous){

if(turns>=3||state.trainerPending){

shouldChange=true;
reason="LIMITE DE 3 GIROS";

}else if(
turns>=1&&
best.id!==previous&&
best.score>(current?.score??0)+.035
){

shouldChange=true;
reason="DESEMPENHO RECENTE";
}
}

if(!shouldChange)return;

const alternatives=previous
?ranking.rows.filter(r=>r.id!==previous)
:ranking.rows;

const chosen=alternatives[0]||best;

if(previous&&chosen.id!==previous){
state.trainerChanges++;
}

state.trainerChoice=chosen.id;
state.trainerMotor=chosen.motor?.key||null;
state.trainerTurns=0;
state.trainerPending=false;

state.trainerHistory.push({
turn:state.history.length,
from:previous,
to:chosen.id,
motor:chosen.motor?.key||null,
reason,
score:chosen.score
});

if(state.trainerHistory.length>300){
state.trainerHistory.shift();
}
}

function activeDefinition(){

const defs=definitions();

if(state.strategy==="TRAINER"){

return defs.find(
d=>d.id===state.trainerChoice
)||defs[0];
}

if(state.strategy==="ADAPTIVE"){

return defs.find(
d=>d.id==="ADAPTIVE:"+state.activeAdaptive
)||defs[0];
}

if(state.strategy==="CREATED"){

return defs.find(
d=>d.id==="CREATED:"+state.activeCreated
)||defs[0];
}

return defs.find(
d=>d.id==="ORIGINAL:"+state.strategy
)||defs[0];
}

function activeMotor(cs){

if(state.manual){

return cs.find(
c=>c.key===state.manual
)||cs[0]||null;
}

const def=activeDefinition();

if(state.strategy==="TRAINER"){

return trainerRanking(cs).rows.find(
r=>r.id===state.trainerChoice
)?.motor||cs[0]||null;
}

return chooseMotor(
def,cs,state.previousMotor
);
}

/* ======================================================
 GIRO REAL
====================================================== */

function recordSpin(
number,
source="TEMPO REAL",
persist=true
){

const cs=getCandidates();

const virtual=cs.map(c=>({
key:c.key,
rank:c.rank,
numbers:[...c.play.numbers]
}));

if(state.strategy==="TRAINER"&&
state.phase==="ENTRY"){
trainerUpdate(cs);
}

const def=activeDefinition();

let motor=null;
let result="AGUARDANDO";

const before=state.phase;
const cycleBefore=clone(state.cycle);
const decisionBefore=clone(state.g1Decision);

if(state.phase==="ENTRY"){

motor=snap(activeMotor(cs));

if(motor){

state.previousMotor=motor.key;

state.cycle={
strategy:def.name,
strategyId:def.id,
motor:motor.key,
original:clone(motor),
firstNumber:null,
options:{
g1:state.g1,
galeSkip:state.galeSkip,
secondHouse:state.secondHouse
}
};

state.g1Decision=null;

if(state.secondHouse){

state.frozen=clone(motor);
state.phase="SECOND_SKIP";
result="2ª CASA";

}else if(motor.play.numbers.includes(number)){

result="GREEN";
state.phase="ENTRY";
state.cycle=null;
state.frozen=null;

}else{

result="GALE";

state.cycle.firstNumber=number;

state.history.push(number);
state.sources.push(source);
invalidate();

state.frozen=chooseG1(
motor,
number
);

state.history.pop();
state.sources.pop();
invalidate();

state.phase=state.galeSkip
?"GALE_SKIP":"GALE";
}
}
}

else if(state.phase==="SECOND_SKIP"){

motor=clone(state.frozen);
result="CASA PULADA";
state.phase="SECOND_ENTRY";
}

else if(state.phase==="SECOND_ENTRY"){

motor=clone(state.frozen);

if(motor?.play.numbers.includes(number)){

result="GREEN";
state.phase="ENTRY";
state.cycle=null;
state.frozen=null;

}else{

result="GALE";

state.cycle.firstNumber=number;

state.history.push(number);
state.sources.push(source);
invalidate();

state.frozen=chooseG1(
motor,
number
);

state.history.pop();
state.sources.pop();
invalidate();

state.phase=state.cycle.options.galeSkip
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

result=motor?.play.numbers.includes(number)
?"GREEN G1":"LOSS";

if(state.cycle?.original){

registerG1Virtual(
state.cycle.original,
state.cycle.firstNumber,
state.cycle.strategyId,
number,
cs
);
}

state.g1History.push({
turn:state.history.length+1,
strategyId:state.cycle?.strategyId||"",
mode:state.g1Decision?.mode||"—",
motor:state.g1Decision?.key||"—",
trigger:state.cycle?.firstNumber,
outcome:number,
result
});

if(state.g1History.length>500){
state.g1History.shift();
}

state.phase="ENTRY";
state.cycle=null;
state.frozen=null;
state.g1Decision=null;
}

processVirtual(number,cs);

state.history.push(number);
state.sources.push(source);

state.ledger.push({
turn:state.history.length,
number,
source,
strategy:cycleBefore?.strategy||def.name,
strategyId:cycleBefore?.strategyId||def.id,
motor:motor?.key||"—",
phase:before,
result,
profit:profit(result),
play:motor?clone(motor.play):null,
virtual,
cycle:cycleBefore,
g1Decision:decisionBefore,
timestamp:Date.now()
});

if(state.ledger.length>2500){
state.ledger.shift();
}

invalidate();
rankingCacheKey=null;

if(
state.strategy==="TRAINER"&&
!state.manual
){

state.trainerTurns++;

if(state.phase==="ENTRY"){
trainerUpdate(getCandidates());
}else if(state.trainerTurns>=3){
state.trainerPending=true;
}
}

if(persist)save();
}

/* ======================================================
 IMPORTAÇÃO LEVE
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
g1Trainer:state.g1Trainer,
g1Mode:state.g1Mode,
stake:state.stake,
galeMultiplier:state.galeMultiplier,
open:clone(state.open)
};

state=fresh();
Object.assign(state,options);

invalidate();
rankingCacheKey=null;

const start=Math.max(0,numbers.length-120);

state.history=numbers.slice(0,start);

state.sources=(sources||[]).slice(0,start);

while(state.sources.length<start){
state.sources.push("HISTÓRICO");
}

for(let i=start;i<numbers.length;i++){

recordSpin(
numbers[i],
sources?.[i]||"HISTÓRICO",
false
);

if((i-start)%5===4){

const status=$("status");

if(status){
status.textContent=
"PROCESSANDO "+(i+1)+"/"+numbers.length;
}

await new Promise(resolve=>setTimeout(resolve,0));
}
}

importing=false;

save();
render();
}

async function undo(){

if(!state.history.length)return;

await rebuild(
state.history.slice(0,-1),
state.sources.slice(0,-1)
);
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
box-shadow:0 0 12px #17f0ad
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

/* ======================================================
 V6.3.3 — VISUAL DOS NÚMEROS
====================================================== */

.centers{
display:grid;
grid-template-columns:repeat(6,minmax(0,1fr));
gap:5px;
margin:12px 0
}

.center{
min-width:0;
min-height:88px;
padding:9px 2px 7px;
border:2px solid #20d7f4;
background:#096a92;
border-radius:9px;
text-align:center;
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
gap:5px
}

.center.short{
background:#caa127;
border-color:#ffe282;
color:#111
}

.centerNumber{
display:block;
width:100%;
font-size:clamp(28px,5vw,44px);
font-weight:900;
line-height:1;
letter-spacing:-1px;
color:#ffffff;
text-align:center;
font-variant-numeric:tabular-nums
}

.center.short .centerNumber{
color:#111111
}

.centerInfo{
display:block;
width:100%;
font-size:9px;
line-height:1.25;
font-weight:bold;
color:#e4f6ff;
text-align:center;
white-space:normal;
overflow-wrap:anywhere
}

.center.short .centerInfo{
color:#111111
}

/* ======================================================
 DEMAIS ESTILOS PRESERVADOS
====================================================== */

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

.chip.green{
border:3px solid #24f49a
}

.chip.gale{
border:3px solid #ffda35
}

.chip.loss{
border:3px solid #ff386c
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

.tablewrap{overflow:auto}

table{
width:100%;
border-collapse:collapse;
min-width:620px;
font-size:11px
}

td,th{
padding:9px;
border-bottom:1px solid #40516a;
text-align:left
}

th{color:#50d9ee}

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

.danger{
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
min-height:80px;
padding:8px 1px 6px;
gap:5px
}

.centerNumber{
font-size:clamp(26px,7vw,37px);
letter-spacing:-1px
}

.centerInfo{
font-size:8px;
line-height:1.15
}

.btn{
font-size:10px;
padding:9px
}

}

@media(max-width:380px){

.centerNumber{
font-size:28px
}

.centerInfo{
font-size:7px
}

}
`;

document.body.innerHTML=`
<style>${css}</style>
<main class="app">

<h1>ANÁLISE BETA V${VERSION}</h1>

<div class="sub">
12 MOTORES • TREINADOR GLOBAL •
TREINADOR G1 • ESTABILIDADE • 28 NÚMEROS
</div>

<section class="panel">
<div class="title">IMPORTAR HISTÓRICO</div>

<textarea id="paste"
placeholder="Cole os números do mais antigo ao mais recente"></textarea>

<div class="row">
<button class="btn" id="import">IMPORTAR</button>
<button class="btn" id="restore">RECUPERAR ANTERIOR</button>
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
["trainer","TREINADOR GLOBAL"],
["lab","LABORATÓRIO"],
["motors","12 MOTORES"],
["jumps","SALTOS E DIREÇÃO"],
["mirrors","ESPELHO / ANTIESPELHO"],
["timeline","LINHA DO TEMPO"]
].map(([id,title])=>`
<section class="panel">
<button class="head" data-panel="${id}">
${title}<span>−</span>
</button>
<div id="${id}"></div>
</section>
`).join("")}

<section class="panel">
<div class="title">FICHAS</div>

<div class="row">
<label>
VALOR DA FICHA
<input id="stake" type="number" min=".01" step=".01">
</label>

<label>
MULTIPLICADOR G1
<input id="multiplier" type="number" min=".01" step=".01">
</label>
</div>
</section>

<div class="warning">
Os indicadores avaliam resultados anteriores.
Não garantem acertos futuros.
</div>

</main>
`;

/* ======================================================
 COMPONENTES VISUAIS
====================================================== */

function button(label,fn,parent,extra=""){

const b=document.createElement("button");

b.className="btn "+extra;
b.textContent=label;
b.onclick=fn;

parent.appendChild(b);

return b;
}

function changeStrategy(rule,adaptive=null,created=null){

state.strategy=rule;
state.activeAdaptive=adaptive;
state.activeCreated=created;
state.manual=null;

if(rule==="TRAINER"){

state.trainerChoice=null;
state.trainerMotor=null;
state.trainerTurns=0;
state.trainerPending=false;

trainerUpdate();
}

save();
render();
}

function buildStrategies(){

const root=$("strategies");
root.innerHTML="";

const groups=[
[
"TREINADOR",
[
["TREINADOR GLOBAL",()=>changeStrategy("TRAINER"),"TRAINER"]
]
],
[
"ORIGINAIS",
ORIGINALS.map(([key,name])=>[
name,()=>changeStrategy(key),key
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

for(const [label,items] of groups){

const group=document.createElement("div");
group.className="strategyGroup";

group.innerHTML=`
<div class="strategyLabel">${label}</div>
`;

const row=document.createElement("div");
row.className="row";

for(const [name,fn,key] of items){

const b=button(
name,fn,row,
key==="TRAINER"?"trainer":""
);

b.dataset.choice=key;
}

group.appendChild(row);
root.appendChild(group);
}

const ranks=document.createElement("div");
ranks.className="row";

for(let i=1;i<=4;i++){

const b=button(
"AUTO "+i+"º",
()=>{
state.rank=i;
changeStrategy("FIXED");
},
ranks
);

b.dataset.rank=i;
}

root.appendChild(ranks);

if(state.createdStrategies.length){

const group=document.createElement("div");
group.className="strategyGroup";

group.innerHTML=`
<div class="strategyLabel">PERSONALIZADAS</div>
`;

const row=document.createElement("div");
row.className="row";

for(const c of state.createdStrategies){

const b=button(
c.name,
()=>changeStrategy("CREATED",null,c.id),
row
);

b.dataset.created=c.id;
}

group.appendChild(row);
root.appendChild(group);
}
}

buildStrategies();

for(const [field,label] of [
["g1","G1 AJUSTE FINO"],
["g1Trainer","TREINADOR GLOBAL G1"],
["galeSkip","GALE 2ª RODADA"],
["secondHouse","2ª CASA"]
]){

const b=button(
label,
()=>{
state[field]=!state[field];
save();
render();
},
$("options"),
field==="g1Trainer"?"trainer":""
);

b.dataset.option=field;
}

$("stake").value=state.stake;
$("multiplier").value=state.galeMultiplier;

$("stake").onchange=()=>{

state.stake=Math.max(
.01,
Number($("stake").value)||1
);

save();
render();
};

$("multiplier").onchange=()=>{

state.galeMultiplier=Math.max(
.01,
Number($("multiplier").value)||1
);

save();
render();
};

for(let n=0;n<=36;n++){

const b=document.createElement("button");

b.className="key"+(n===0?" zero":"");
b.textContent=n;

b.style.background=
n===0?"#087b50":
RED.has(n)?"#ac293f":"#12151b";

b.onclick=()=>{

if(importing)return;

try{
recordSpin(n);
render();
}catch(e){
showError(e);
}
};

$("keys").appendChild(b);
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

rebuild(numbers);
};

$("restore").onclick=()=>{

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

rebuild(old.history);
};

$("undo").onclick=()=>{

if(importing)return;
undo();
};

$("clear").onclick=()=>{

if(importing)return;

if(!confirm("APAGAR O HISTÓRICO ATUAL?")){
return;
}

state=fresh();
invalidate();
rankingCacheKey=null;
buildStrategies();
save();
render();
};

document.addEventListener("click",event=>{

const b=event.target.closest("[data-panel]");

if(!b)return;

const id=b.dataset.panel;

state.open[id]=!state.open[id];

save();
render();
});

/* ======================================================
 RENDERIZAÇÃO
====================================================== */

function showError(e){

const status=$("status");

if(status){
status.textContent=
"ERRO CONTROLADO: "+String(e?.message||e);
}

console.error("ANÁLISE BETA:",e);
}

function sortedBlocks(play){

if(!play)return [];

return [...play.blocks].sort((a,b)=>
REGION_NAMES.indexOf(region(a.center))-
REGION_NAMES.indexOf(region(b.center))
);
}

/* ======================================================
 V6.3.3 — NÚMEROS GRANDES
 REGIÃO E VIZINHOS EMBAIXO
====================================================== */

function centersHTML(play){

if(!play)return "";

return sortedBlocks(play).map(b=>`
<div class="center ${b.radius===1?"short":""}">

<strong class="centerNumber">
${b.center}
</strong>

<small class="centerInfo">
${region(b.center)}
</small>

<small class="centerInfo">
${b.radius} ${b.radius===1?"VIZINHO":"VIZINHOS"}
</small>

</div>
`).join("");
}

/* ======================================================
 MÉTRICAS
====================================================== */

function metrics(rows){

const closed=rows.filter(r=>
["GREEN","GREEN G1","LOSS"].includes(r.result)
);

const green=closed.filter(
r=>r.result==="GREEN"
).length;

const g1=closed.filter(
r=>r.result==="GREEN G1"
).length;

const loss=closed.filter(
r=>r.result==="LOSS"
).length;

const net=closed.reduce(
(s,r)=>s+(r.profit||0),0
);

return {closed,green,g1,loss,net};
}

function metricsHTML(rows){

const m=metrics(rows);

return `
<div class="metrics">

<div class="metric">
<small>CICLOS</small>
<b>${m.closed.length}</b>
</div>

<div class="metric">
<small>GREEN</small>
<b class="good">${m.green}</b>
</div>

<div class="metric">
<small>GREEN G1</small>
<b class="good">${m.g1}</b>
</div>

<div class="metric">
<small>LOSS</small>
<b class="bad">${m.loss}</b>
</div>

<div class="metric">
<small>ACERTOS</small>
<b>${pct(m.green+m.g1,m.closed.length)}</b>
</div>

<div class="metric">
<small>LÍQUIDO</small>
<b class="${m.net>=0?"good":"bad"}">
${fmt(m.net)}
</b>
</div>

</div>
`;
}

function trainerHTML(){

const ranking=trainerRanking();

const active=ranking.rows.find(
r=>r.id===state.trainerChoice
);

const best=ranking.best;

return `
<div class="box">

<b>TREINADOR GLOBAL</b>

<p>
ESTRATÉGIAS AVALIADAS:
${ranking.rows.length}
</p>

<p>
ATIVA:
<strong>${esc(active?.name||"AGUARDANDO")}</strong>
</p>

<p>
MOTOR:
<strong>${esc(state.trainerMotor||"—")}</strong>
</p>

<p>
GIROS DESDE A TROCA:
${state.trainerTurns}
</p>

<p>
TROCAS:
${state.trainerChanges}
</p>

<p>
REGRA:
1, 2 OU 3 GIROS
</p>

<p>
${state.trainerPending
?"TROCA PENDENTE — FECHAR GALE"
:"AVALIAÇÃO A CADA GIRO"}
</p>

</div>

<div class="box">

<b>MELHOR AVALIAÇÃO ATUAL</b>

<p>${esc(best?.name||"—")}</p>

<p>
ESTABILIDADE:
${pct(best?.stability.score||0,1)}
</p>

<p>
LÍQUIDO VIRTUAL ÚLTIMOS 12:
${fmt(best?.stability.m12.net||0)}
</p>

</div>

<div class="box ${ranking.protection?"danger":""}">

<b>PROTEÇÃO</b>

<p>
${ranking.protection
?"ALERTA: DESEMPENHO RECENTE NEGATIVO EM GRANDE PARTE DAS ESTRATÉGIAS."
:"SEM ALERTA COLETIVO ATIVO."
}
</p>

</div>

<button class="virtualButton" id="activateTrainer">
ATIVAR TREINADOR GLOBAL
</button>

<div class="title">
RANKING DE ESTABILIDADE
</div>

<div class="tablewrap">
<table>

<thead>
<tr>
<th>#</th>
<th>ESTRATÉGIA</th>
<th>MOTOR</th>
<th>3</th>
<th>12</th>
<th>30</th>
<th>LÍQUIDO 12</th>
</tr>
</thead>

<tbody>

${ranking.rows.map((r,i)=>`
<tr>
<td>${i+1}</td>
<td>${esc(r.name)}</td>
<td>${esc(r.motor?.key||"—")}</td>
<td>${pct(r.stability.m3.hits,r.stability.m3.total)}</td>
<td>${pct(r.stability.m12.hits,r.stability.m12.total)}</td>
<td>${pct(r.stability.m30.hits,r.stability.m30.total)}</td>
<td>${fmt(r.stability.m12.net)}</td>
</tr>
`).join("")}

</tbody>
</table>
</div>

<div class="title">ÚLTIMAS TROCAS</div>

${state.trainerHistory.slice(-12).reverse().map(x=>`
<div class="listrow">

GIRO ${x.turn} •
${esc(x.from||"INÍCIO")}
→ ${esc(x.to)}

<div class="muted">
${esc(x.reason)} •
${esc(x.motor)}
</div>

</div>
`).join("")}
`;
}

function jumpsHTML(){

const a=analyze(state.history);

return `
<div class="box">

<b>LEITURA SEQUENCIAL</b>

<p>
NUMÉRICO:
${a.numericStreak.dir>0?"CRESCENTE":
a.numericStreak.dir<0?"DECRESCENTE":"MISTO"}
• ${a.numericStreak.length} PASSOS
</p>

<p>
FÍSICO:
${a.physicalStreak.dir>0?"HORÁRIO":
a.physicalStreak.dir<0?"ANTI-HORÁRIO":"MISTO"}
• ${a.physicalStreak.length} PASSOS
</p>

<p>
MÉDIA ÚLTIMOS 3:
${fmt(a.mean3)} CASAS
</p>

<p>
MÉDIA ANTERIOR:
${fmt(a.previous3)} CASAS
</p>

<p>
VARIAÇÃO:
${fmt(a.acceleration)}
</p>

</div>

<div class="title">AUSÊNCIA POR REGIÃO</div>

${REGION_NAMES.map(s=>`
<div class="listrow">
<b>${s}</b>
• ${a.regions[s].absence} GIROS
• ${a.regions[s].recent} NOS ÚLTIMOS 12
</div>
`).join("")}

<div class="title">ÚLTIMAS TRANSIÇÕES</div>

${a.transitions.slice(-12).reverse().map(x=>`
<div class="listrow">

<b>${x.from} → ${x.to}</b>
• ${x.distance} CASAS
• ${x.jump}

<div class="muted">
NUMÉRICO:
${x.numeric>0?"CRESCENTE":
x.numeric<0?"DECRESCENTE":"IGUAL"}

<br>

FÍSICO:
${x.physical>0?"HORÁRIO":
x.physical<0?"ANTI-HORÁRIO":"PARADO"}

<br>

${x.mirrorFrom} → ${x.mirrorTo}
</div>

</div>
`).join("")}
`;
}

function mirrorsHTML(){

const last=state.history.at(-1);

const near=last==null?[]:
W.filter(n=>MIRROR.has(n)&&distance(last,n)<=4);

const far=last==null?[]:
W.filter(n=>MIRROR.has(n)&&distance(last,n)>=10);

const recent=state.history.slice(-20);

return `
<div class="box">

<b>ESPELHO / ANTIESPELHO</b>

<p>
ESPELHO ÚLTIMOS 20:
${recent.filter(n=>MIRROR.has(n)).length}
</p>

<p>
ANTIESPELHO ÚLTIMOS 20:
${recent.filter(n=>!MIRROR.has(n)).length}
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

function timelineHTML(){

return state.ledger.slice(-80).reverse().map(r=>`
<div class="listrow">

<b>GIRO ${r.turn}</b>
• <b>${r.number}</b>
• ${esc(r.result)}

<div class="muted">
${esc(r.strategy)}
• ${esc(r.motor)}
• ${region(r.number)}
• ${mirror(r.number)}
</div>

${r.play?`
<div class="muted">
CENTROS:
${sortedBlocks(r.play).map(
b=>b.center
).join(" • ")}
</div>
`:""}

</div>
`).join("");
}

let renderPending=false;

function render(){

if(renderPending)return;

renderPending=true;

requestAnimationFrame(()=>{

renderPending=false;

try{
performRender();
}catch(e){
showError(e);
}
});
}

function performRender(){

const cs=getCandidates();

if(
state.strategy==="TRAINER"&&
!state.trainerChoice&&
state.phase==="ENTRY"
){
trainerUpdate(cs);
}

const def=activeDefinition();

const motor=state.frozen||
snap(activeMotor(cs));

const play=motor?.play||null;

$("status").textContent=
state.history.length+
" NÚMEROS • "+
cs.length+
"/12 MOTORES • "+
state.phase+
(storageWarning?" • FALHA AO SALVAR":"");

for(const b of document.querySelectorAll(
"[data-choice]"
)){

const choice=b.dataset.choice;

const active=
state.strategy==="TRAINER"
?choice==="TRAINER":
state.strategy==="ADAPTIVE"
?choice===state.activeAdaptive:
choice===state.strategy;

b.classList.toggle(
"active",
!state.manual&&active
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

const g1Active=[
"GALE",
"GALE_SKIP"
].includes(state.phase);

const g1Label=g1Active&&state.g1Decision
?" • G1 "+state.g1Decision.mode+
" • "+state.g1Decision.key
:"";

$("selected").textContent=
(state.cycle?.strategy||def.name)+
" • MOTOR "+
(motor?.key||"AGUARDANDO")+
" • "+state.phase+
g1Label;

$("centers").innerHTML=centersHTML(play);

$("coverage").textContent=play
?"28 COBERTOS • 9 DESCOBERTOS"
:"IMPORTE PELO MENOS 8 NÚMEROS.";

const last=state.history.slice(-14);

const resultMap=new Map(
state.ledger.slice(-20).map(r=>[r.turn,r.result])
);

$("last").innerHTML=last.map((n,i)=>{

const turn=
state.history.length-last.length+i+1;

const result=resultMap.get(turn)||"HISTÓRICO";

const color=
result==="LOSS"?"loss":
result.startsWith("GREEN")?"green":
result==="GALE"?"gale":"";

return `
<div class="chip ${color}"
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

$("general").innerHTML=`

<div class="title">HISTÓRICO</div>

${metricsHTML(
state.ledger.filter(r=>r.source==="HISTÓRICO")
)}

<div class="title">TEMPO REAL</div>

${metricsHTML(
state.ledger.filter(r=>r.source==="TEMPO REAL")
)}

<div class="title">TOTAL</div>

${metricsHTML(state.ledger)}

<div class="box">
NÚMEROS ARMAZENADOS:
<b>${state.history.length}</b>
</div>
`;
}

if(state.open.trainer){

$("trainer").innerHTML=trainerHTML();

$("activateTrainer").onclick=()=>{
changeStrategy("TRAINER");
};
}

if(state.open.lab){

$("lab").innerHTML=`
<div class="box">
7 ESTRATÉGIAS ORIGINAIS •
12 ADAPTATIVAS •
4 POSIÇÕES AUTO •
ESTRATÉGIAS PERSONALIZADAS
</div>

<button class="virtualButton" id="create">
CRIAR CÓPIA DA MELHOR ADAPTATIVA
</button>
`;

$("create").onclick=()=>{

const best=trainerRanking().rows.find(
r=>r.type==="ADAPTIVE"
);

if(!best)return;

const created={
id:"CUSTOM_"+Date.now(),
name:"ESTRATÉGIA VIRTUAL "+
(state.createdStrategies.length+1),
config:clone(best.config)
};

state.createdStrategies.push(created);

buildStrategies();
rankingCacheKey=null;
save();
render();
};
}

if(state.open.motors){

$("motors").innerHTML=`

<div class="row">

${cs.map(c=>`
<button class="btn" data-manual="${c.key}">
${esc(c.key)}
</button>
`).join("")}

</div>

${cs.map(c=>`
<div class="listrow">

<b>${c.rank}º ${esc(c.key)}</b>

<div class="muted">
CENTROS:
${sortedBlocks(c.play).map(
b=>b.center
).join(" • ")}
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

for(const [id,open] of Object.entries(state.open)){

const el=$(id);

if(el){
el.classList.toggle("hide",!open);
}

const b=document.querySelector(
'[data-panel="'+id+'"]'
);

const span=b?.querySelector("span");

if(span){
span.textContent=open?"−":"+";
}
}
}

/* ======================================================
 INICIALIZAÇÃO
====================================================== */

render();

})();
