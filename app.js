(() => {
"use strict";

/*
========================================================
 ANÁLISE BETA V6.3.6
 BASE: V6.3.5

 ATUALIZAÇÕES:
 - CONTINUIDADE / DESLOCAMENTO / RUPTURA
 - QUANTIDADE E PERCENTUAL POR COMPORTAMENTO
 - ESTATÍSTICAS POR MOTOR
 - ESTATÍSTICAS POR ESTRATÉGIA VIRTUAL
 - ESTATÍSTICAS DO TREINADOR G1
 - GALES NECESSÁRIOS / GREEN G1 / LOSS
 - COMPARAÇÃO DAS TRÊS DEFESAS
 - RECONSTRUÇÃO INDEPENDENTE
 - DECISÃO VIRTUAL APLICADA NO GALE
 - SOMENTE ESTRATÉGIAS EM GALE GERAM
   SIMULAÇÕES DE DEFESA
 - REGISTRO CRONOLÓGICO SEM RESULTADO FUTURO
 - HISTÓRICO COMPLETO PRESERVADO
 - IMPORTAÇÃO E REPROCESSAMENTO CRONOLÓGICO
 - MIGRAÇÃO DA V6.3.5
========================================================
*/

const VERSION = "6.3.6";
const KEY = "ANALISE_BETA_V636";
const BACKUP_KEY = KEY + "_BACKUP";

const OLD_KEYS = [
"ANALISE_BETA_V635",
"ANALISE_BETA_V634",
"ANALISE_BETA_V633",
"ANALISE_BETA_V632",
"ANALISE_BETA_V631",
"ANALISE_BETA_V63",
"ANALISE_BETA_V62",
"ANALISE_BETA_V61",
"ANALISE_BETA_V60",
"ANALISE_BETA_V59",
"ANALISE_BETA_V55_COMPLETO"
];

const W = [
32,15,19,4,21,2,25,17,34,6,
27,13,36,11,30,8,23,10,5,24,
16,33,1,20,14,31,9,22,18,29,
7,28,12,35,3,26,0
];

const RED = new Set([
1,3,5,7,9,12,14,16,18,
19,21,23,25,27,30,32,34,36
]);

const REGIONS = {
TIERS:[27,13,36,11,30,8,23,10,5,24,16,33],
ORFAOS:[17,34,6,1,20,14,31,9],
VOISINS:[22,18,29,7,25,2,21,4,19],
ZERO:[28,12,35,3,26,0,32,15]
};

const REGION_NAMES = Object.keys(REGIONS);

const FAMILIES = [
"NORMAL",
"DINAMICO",
"RX_NORMAL",
"RX_DINAMICO"
];

const RADII = [4,5,6];

const ORIGINALS = [
["FIXED","AUTO RANKING"],
["GEO","MELHOR GEOMETRIA"],
["BEST","MELHOR DESEMPENHO"],
["STABLE","ESTABILIDADE"],
["SWITCH","TROCA INTELIGENTE"],
["CONSENSUS","CONSENSO"],
["UNION","UNIÃO"]
];

const ADAPTATIVES = Array.from(
{length:12},
(_,i)=>({
id:"A"+String(i+1).padStart(2,"0"),
name:"ADAPTATIVA "+String(i+1).padStart(2,"0"),
window:[10,10,10,20,20,20,30,30,20,30,20,30][i],
margin:[.05,.10,.15,.05,.10,.15,.05,.10,.08,.12,.10,.08][i],
maxRank:[12,12,12,12,12,12,12,12,12,6,4,8][i]
})
);

const G1_MODES = [
"CONGELADO",
"AJUSTE FINO",
"RECONSTRUÇÃO"
];

const BEHAVIORS = [
"CONTINUIDADE",
"DESLOCAMENTO",
"RUPTURA"
];

const $ = id => document.getElementById(id);

const mod = n => (n%37+37)%37;
const idx = n => W.indexOf(n);
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
const clone = x => x==null ? x : JSON.parse(JSON.stringify(x));
const avg = a => a.length ? a.reduce((s,n)=>s+n,0)/a.length : 0;
const fmt = n => Number.isFinite(n) ? n.toFixed(2).replace(".",",") : "—";
const pct = (a,b) => b ? fmt(100*a/b)+"%" : "—";

function esc(v) {
return String(v??"").replace(/[&<>"']/g,c=>({
"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#39;"
}[c]));
}

function neighbors(n,r) {
const p=idx(n);
if(p<0)return [];
return Array.from(
{length:r*2+1},
(_,i)=>W[mod(p+i-r)]
);
}

function distance(a,b) {
const x=idx(a),y=idx(b);
if(x<0||y<0)return 18;
const d=Math.abs(x-y);
return Math.min(d,37-d);
}

function direction(a,b) {
const x=idx(a),y=idx(b);
if(x<0||y<0)return 0;
const f=mod(y-x);
const r=mod(x-y);
return f<=r?f:-r;
}

function region(n) {
return REGION_NAMES.find(
s=>REGIONS[s].includes(n)
)||"ZERO";
}

const MIRROR=new Set();

for(const n of [11,12,13,21,22,23,31,32,33]) {
for(const x of neighbors(n,1))MIRROR.add(x);
}

function mirror(n) {
return MIRROR.has(n)?"ESPELHO":"ANTIESPELHO";
}

function jump(d) {
return d<=4?"CURTO":d<=9?"MÉDIO":"GRANDE";
}

/* ======================================================
 ESTADO
====================================================== */

function fresh() {
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

g1Trainer:true,
g1Mode:"AUTO",
g1Decision:null,
g1History:[],

g1Virtual:[],
g1Pending:[],
g1Stats:{},
g1VirtualTurns:0,

g1Recovery:[],
g1NumberStats:{},
g1DecisionHistory:[],

g1MotorHistory:[],
g1BehaviorHistory:[],

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
g1ranking:true,
g1numbers:true,
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

function read(key) {
try {
return JSON.parse(localStorage.getItem(key)||"null");
} catch(e) {
return null;
}
}

function validNumbers(a) {
return Array.isArray(a)
?a.filter(n=>Number.isInteger(n)&&n>=0&&n<=36)
:[];
}

let state=fresh();
let loadedFrom=null;

for(const key of [KEY,BACKUP_KEY,...OLD_KEYS]) {
const data=read(key);

if(data&&Array.isArray(data.history)) {
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

state.history=validNumbers(state.history);

for(const name of [
"sources",
"ledger",
"virtualRows",
"createdStrategies",
"trainerHistory",
"g1History",
"g1Virtual",
"g1Pending",
"g1Recovery",
"g1DecisionHistory",
"g1MotorHistory",
"g1BehaviorHistory"
]) {
if(!Array.isArray(state[name]))state[name]=[];
}

if(!state.g1Stats||typeof state.g1Stats!=="object") {
state.g1Stats={};
}

if(!state.g1NumberStats||typeof state.g1NumberStats!=="object") {
state.g1NumberStats={};
}

state.virtualCycles={};

let storageWarning=false;
let storageMessage="";

function storageSnapshot(level=0) {
return {
...state,
virtualCycles:{},
ledger:state.ledger.slice(
level===0?-1000:level===1?-300:-80
),
virtualRows:state.virtualRows.slice(
level===0?-3500:level===1?-1200:-300
),
g1Virtual:state.g1Virtual.slice(
level===0?-3500:level===1?-1200:-300
),
g1Recovery:state.g1Recovery.slice(
level===0?-3500:level===1?-1200:-300
),
g1DecisionHistory:state.g1DecisionHistory.slice(-500),
g1MotorHistory:state.g1MotorHistory.slice(-3500),
g1BehaviorHistory:state.g1BehaviorHistory.slice(-3500),
trainerHistory:state.trainerHistory.slice(-300),
g1History:state.g1History.slice(-1000)
};
}

function save() {
for(let level=0;level<=2;level++) {
try {
localStorage.setItem(
KEY,
JSON.stringify(storageSnapshot(level))
);

storageWarning=false;
storageMessage="";
return true;
} catch(e) {
storageMessage=String(e?.message||e);
}
}

try {
localStorage.setItem(
BACKUP_KEY,
JSON.stringify({
history:state.history,
sources:state.sources,
strategy:state.strategy,
rank:state.rank,
createdStrategies:state.createdStrategies,
g1:state.g1,
g1Trainer:state.g1Trainer
})
);
} catch(e) {}

storageWarning=true;
return false;
}

/* ======================================================
 ANÁLISE SEQUENCIAL
====================================================== */

function analyze(history) {
const h=history.slice(-45);
const transitions=[];

for(let i=1;i<h.length;i++) {
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

function streak(field) {
const last=transitions.at(-1);
if(!last)return {dir:0,length:0};

const dir=Math.sign(last[field]);
if(!dir)return {dir:0,length:0};

let length=0;

for(let i=transitions.length-1;i>=0;i--) {
if(Math.sign(transitions[i][field])!==dir)break;
length++;
}

return {dir,length};
}

const regions={};

for(const s of REGION_NAMES) {
let absence=0;

for(let i=history.length-1;i>=0;i--) {
if(region(history[i])===s)break;
absence++;
}

regions[s]={
absence,
recent:history.slice(-12).filter(
n=>region(n)===s
).length
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
 12 MOTORES
====================================================== */

function weightsFor(history,family,radius) {
const weights=Array(37).fill(.01);
const recent=history.slice(-50);

for(let k=0;k<recent.length;k++) {
const p=idx(recent[recent.length-1-k]);
const decay=Math.exp(-k/(radius*2.3));

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=6)weights[j]+=decay*(7-d)/7;
}
}

if(family.includes("DINAMICO")) {
for(let k=0;k<Math.min(radius+2,history.length);k++) {
const p=idx(history[history.length-1-k]);

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=3) {
weights[j]+=(4-d)/(k+2)*1.7;
}
}
}
}

if(family.startsWith("RX")) {
const length=Math.min(radius,history.length-2);

if(length>=2) {
const current=history.slice(-length);
const matches=[];

const start=Math.max(
0,
history.length-160-length
);

for(let i=start;i+length<history.length-1;i++) {
let score=0;

for(let j=0;j<length;j++) {
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

for(const match of matches.slice(0,12)) {
const p=idx(match.next);

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=3) {
weights[j]+=(4-d)*match.score*.45;
}
}
}
}
}

if(history.length>=3) {
const a=analyze(history);
const last=history.at(-1);

const nUp=a.last6.filter(
x=>x.numeric>0
).length;

const nDown=a.last6.filter(
x=>x.numeric<0
).length;

const numericBias=
(nUp-nDown)/Math.max(1,nUp+nDown);

const cw=a.last6.filter(
x=>x.physical>0
).length;

const ccw=a.last6.filter(
x=>x.physical<0
).length;

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

for(const n of W) {
const nd=n-last;
const pd=direction(last,n);
const d=Math.abs(pd);

let bonus=0;

if(
numericBias&&
Math.sign(nd)===Math.sign(numericBias)
) {
bonus+=.10*Math.abs(numericBias);
}

if(
a.numericStreak.length>=2&&
Math.sign(nd)===a.numericStreak.dir
) {
bonus+=.07;
}

if(
physicalBias&&
Math.sign(pd)===Math.sign(physicalBias)
) {
bonus+=.12*Math.abs(physicalBias);
}

if(
a.physicalStreak.length>=2&&
Math.sign(pd)===a.physicalStreak.dir
) {
bonus+=.07;
}

if(Math.abs(d-expected)<=2)bonus+=.09;
if(Math.abs(d-target)<=2)bonus+=.09;
if(a.acceleration>=3&&d>=10)bonus+=.07;
if(a.acceleration<=-3&&d<=5)bonus+=.07;

const change=mirror(n)!==mirror(last);
const rate=a.mirrorTransitions/
Math.max(1,a.last6.length);

bonus+=change
?.045*rate
:.045*(1-rate);

if(
a.mirrorDistance&&
Math.abs(d-a.mirrorDistance)<=2
) {
bonus+=.055;
}

if(a.mean3>=9) {
bonus+=.045/
(1+a.regions[region(n)].recent*.2);
}

weights[idx(n)]+=
bonus*strength*radius/5;
}
}

return weights;
}

/* ======================================================
 GEOMETRIA 28 NÚMEROS
====================================================== */

const FIVE=[];
const THREE=[];

for(let p=0;p<37;p++) {
for(const radius of [1,2]) {
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

function geometry(weights,mandatory=[]) {
const scored=b=>({
...b,
value:b.numbers.reduce(
(s,n)=>s+(weights[idx(n)]||0),0
)
});

const fives=FIVE.map(scored).sort(
(a,b)=>b.value-a.value
);

const threes=THREE.map(scored).sort(
(a,b)=>b.value-a.value
);

const allowed=threes.filter(
b=>mandatory.every(n=>b.numbers.includes(n))
);

let best=null;

for(const small of allowed) {
let beam=[{
blocks:[small],
mask:small.mask,
score:small.value
}];

for(let step=0;step<5;step++) {
const next=[];

for(const item of beam) {
for(const b of fives) {
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

for(const item of next) {
const key=item.mask.toString();

if(seen.has(key))continue;
seen.add(key);
beam.push(item);

if(beam.length>=5)break;
}

if(!beam.length)break;
}

for(const item of beam) {
if(item.blocks.length!==6)continue;

if(!best||item.score>best.score) {
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
centers5:blocks.filter(
b=>b.radius===2
).map(b=>b.center),
center3:blocks.find(
b=>b.radius===1
).center
};
}

function validPlay(play) {
if(
!play||
!Array.isArray(play.numbers)||
play.numbers.length!==28||
new Set(play.numbers).size!==28||
!Array.isArray(play.blocks)||
play.blocks.length!==6
)return false;

const five=play.blocks.filter(
b=>b.radius===2
);

const three=play.blocks.filter(
b=>b.radius===1
);

return five.length===5&&
three.length===1&&
play.blocks.every(b=>
Array.isArray(b.numbers)&&
b.numbers.length===b.radius*2+1&&
b.numbers.every(n=>
neighbors(b.center,b.radius).includes(n)
)
);
}

function uncovered(play) {
if(!validPlay(play))return [...W];

const covered=new Set(play.numbers);

return W.filter(n=>!covered.has(n));
}

function candidates(history) {
if(history.length<8)return [];

const result=[];

for(const family of FAMILIES) {
for(const radius of RADII) {
if(
family.startsWith("RX")&&
history.length<radius*2+4
)continue;

const weights=weightsFor(
history,family,radius
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

function getCandidates() {
const h=state.history.slice(-200);

const key=
state.history.length+":"+
h.slice(-30).join(",");

if(key===cacheKey)return cacheValue;

cacheKey=key;
cacheValue=candidates(h);

return cacheValue;
}

function invalidate() {
cacheKey=null;
}

/* ======================================================
 ESTRATÉGIAS
====================================================== */

function definitions() {
const defs=[];

for(const [id,name] of ORIGINALS) {
defs.push({
id:"ORIGINAL:"+id,
name,
type:"ORIGINAL",
rule:id
});
}

for(let rank=1;rank<=4;rank++) {
defs.push({
id:"RANK:"+rank,
name:"AUTO "+rank+"º",
type:"RANK",
rank
});
}

for(const config of ADAPTATIVES) {
defs.push({
id:"ADAPTIVE:"+config.id,
name:config.name,
type:"ADAPTIVE",
config
});
}

for(const c of state.createdStrategies) {
defs.push({
id:"CREATED:"+c.id,
name:c.name,
type:"CREATED",
config:c.config
});
}

return defs;
}

function recentMotorRate(key,window=12) {
const rows=state.ledger.filter(
r=>r.virtual?.some(v=>v.key===key)
).slice(-window);

let hits=0;

for(const row of rows) {
const v=row.virtual.find(
x=>x.key===key
);

if(v?.numbers.includes(row.number))hits++;
}

return rows.length?hits/rows.length:null;
}

function chooseMotor(def,cs,previous) {
if(!cs.length)return null;

const fixed=cs[
clamp(state.rank-1,0,cs.length-1)
];

if(def.type==="RANK") {
return cs[
clamp(def.rank-1,0,cs.length-1)
];
}

if(
def.type==="ADAPTIVE"||
def.type==="CREATED"
) {
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
)return old.c;

return best?.c||fixed;
}

if(def.rule==="GEO")return cs[0];

if(def.rule==="BEST") {
return [...cs].sort((a,b)=>
(recentMotorRate(b.key,20)??-.1)-
(recentMotorRate(a.key,20)??-.1)
||a.rank-b.rank
)[0];
}

if(def.rule==="STABLE") {
const old=cs.find(
c=>c.key===previous
);

return old&&old.rank<=5?old:fixed;
}

if(def.rule==="SWITCH") {
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
) {
const weights=Array(37).fill(0);

const selected=def.rule==="UNION"
?cs.slice(0,3):cs;

for(const c of selected) {
for(const n of c.play.numbers) {
weights[idx(n)]+=
def.rule==="UNION"
?1:1/(1+c.rank*.1);
}
}

const play=geometry(weights);

if(play) {
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

function snap(m) {
return m?{
key:m.key,
rank:m.rank,
score:m.score,
play:clone(m.play)
}:null;
}

function compactPlay(motor) {
if(!validPlay(motor?.play))return null;

return {
key:motor.key,
rank:motor.rank||0,
score:motor.score||0,
play:clone(motor.play)
};
}

/* ======================================================
 DEFESA 1: CONGELADA
====================================================== */

function frozenG1(original) {
return compactPlay(original);
}

/* ======================================================
 DEFESA 2: AJUSTE FINO
====================================================== */

function tuneG1(original,trigger) {
if(!validPlay(original?.play))return null;

const mandatory=neighbors(trigger,1);
const weights=Array(37).fill(.01);

for(const x of original.play.numbers) {
weights[idx(x)]+=100;
}

for(const x of mandatory) {
weights[idx(x)]+=100000;
}

const play=geometry(weights,mandatory);

if(!play)return compactPlay(original);

return {
key:original.key,
rank:original.rank||0,
score:play.score,
play,
g1:true,
trigger
};
}

/* ======================================================
 HISTÓRICO G1
====================================================== */

function recoveryRows(strategyId=null,limit=300) {
const rows=state.g1Recovery.filter(
r=>strategyId==null||
r.strategyId===strategyId
);

return rows.slice(-limit);
}

function recoveryMetrics(strategyId,mode=null,limit=100) {
const rows=recoveryRows(strategyId,limit).filter(
r=>mode==null||r.mode===mode
);

const hits=rows.filter(r=>r.hit).length;

return {
total:rows.length,
hits,
loss:rows.length-hits,
rate:rows.length?hits/rows.length:null
};
}

function actualG1Metrics(strategyId=null) {
const rows=state.g1History.filter(
r=>strategyId==null||
r.strategyId===strategyId
);

const hits=rows.filter(
r=>r.result==="GREEN G1"
).length;

return {
total:rows.length,
hits,
loss:rows.length-hits,
rate:rows.length?hits/rows.length:null
};
}

/* ======================================================
 NOVO V6.3.6:
 CONTADORES DE COMPORTAMENTO
====================================================== */

function emptyBehaviorCounts() {
return {
CONTINUIDADE:0,
DESLOCAMENTO:0,
RUPTURA:0
};
}

function behaviorMetrics(rows) {
const counts=emptyBehaviorCounts();

for(const row of rows) {
if(BEHAVIORS.includes(row.behavior)) {
counts[row.behavior]++;
}
}

const total=BEHAVIORS.reduce(
(s,b)=>s+counts[b],0
);

return {
total,
counts,
percentages:Object.fromEntries(
BEHAVIORS.map(b=>[
b,total?counts[b]/total:0
])
)
};
}

function behaviorHTML(rows) {
const m=behaviorMetrics(rows);

return `
<div class="behaviorGrid">

${BEHAVIORS.map(b=>`
<div class="behaviorBox ${
b==="RUPTURA"?"rupture":
b==="DESLOCAMENTO"?"displacement":
"continuity"
}">

<small>${b}</small>

<strong>${m.counts[b]}</strong>

<span>${pct(m.counts[b],m.total)}</span>

</div>
`).join("")}

</div>

<div class="muted">
TOTAL DE DECISÕES CLASSIFICADAS:
<b>${m.total}</b>
</div>
`;
}

function g1Ranking() {
const defs=definitions();

return defs.map(def=>{
const rows=recoveryRows(def.id,500);

const modes={};

for(const mode of G1_MODES) {
modes[mode]=recoveryMetrics(
def.id,mode,300
);
}

const actual=actualG1Metrics(def.id);

const best=G1_MODES.map(mode=>({
mode,
...modes[mode]
})).sort((a,b)=>{
const sa=(a.hits+28/37*12)/(a.total+12);
const sb=(b.hits+28/37*12)/(b.total+12);
return sb-sa;
})[0];

const decisions=state.g1BehaviorHistory.filter(
r=>r.strategyId===def.id
);

return {
id:def.id,
name:def.name,
total:rows.length,
modes,
best,
actualTotal:actual.total,
actualHits:actual.hits,
actualLoss:actual.loss,
behaviors:behaviorMetrics(decisions)
};
}).sort((a,b)=>{
const aa=a.best;
const bb=b.best;

const sa=(aa.hits+28/37*12)/(aa.total+12);
const sb=(bb.hits+28/37*12)/(bb.total+12);

return sb-sa||
b.total-a.total;
});
}

/* ======================================================
 LEITURA DOS DESCOBERTOS
====================================================== */

function uncoveredEvidence(
original,
trigger,
history,
strategyId
) {
const missing=uncovered(original.play);
const rows=recoveryRows(strategyId,180);
const globalRows=recoveryRows(null,300);

const scores=Array(37).fill(0);
const detail=[];

for(const n of W) {
const local=rows.filter(
r=>r.trigger===n
);

const global=globalRows.filter(
r=>r.trigger===n
);

const recent=history.slice(-36);
const recent12=history.slice(-12);

const frequency=recent.filter(
x=>x===n
).length;

const shortFrequency=recent12.filter(
x=>x===n
).length;

const physical=history.slice(-18).reduce(
(s,x,i)=>{
const d=distance(x,n);
return s+(d<=2?(3-d)/(1+i*.12):0);
},0
);

const missedLoss=rows.filter(
r=>!r.hit&&
Array.isArray(r.uncovered)&&
r.uncovered.includes(n)
).length;

const globalMissed=globalRows.filter(
r=>!r.hit&&
Array.isArray(r.uncovered)&&
r.uncovered.includes(n)
).length;

const localHit=local.filter(
r=>r.hit
).length;

const globalHit=global.filter(
r=>r.hit
).length;

const value=
frequency*.9+
shortFrequency*1.4+
physical*.22+
missedLoss*.35+
globalMissed*.10+
localHit*.12+
globalHit*.035;

scores[idx(n)]=value;

detail.push({
number:n,
missing:missing.includes(n),
frequency,
shortFrequency,
missedLoss,
globalMissed,
value
});
}

return {
missing,
scores,
detail:detail.sort(
(a,b)=>b.value-a.value
),
trigger,
strategyId
};
}

/* ======================================================
 CONTINUIDADE / DESLOCAMENTO / RUPTURA
====================================================== */

function behaviorReading(
original,
trigger,
history,
strategyId
) {
const recent=recoveryRows(strategyId,45);

const losses=recent.filter(r=>!r.hit);
const recent12=recent.slice(-12);
const recent6=recent.slice(-6);

const originalSet=new Set(
original.play.numbers
);

const outside=history.slice(-18).filter(
n=>!originalSet.has(n)
).length;

const outside6=history.slice(-6).filter(
n=>!originalSet.has(n)
).length;

const lossRate=recent12.length
?recent12.filter(r=>!r.hit).length/recent12.length
:0;

const shortLoss=recent6.length
?recent6.filter(r=>!r.hit).length/recent6.length
:0;

const uncoveredPressure=
history.length
?outside/Math.min(18,history.length)
:0;

const shortPressure=
history.length
?outside6/Math.min(6,history.length)
:0;

const consecutiveLoss=(()=>{
let count=0;

for(let i=recent.length-1;i>=0;i--) {
if(recent[i].hit)break;
count++;
}

return count;
})();

let behavior="CONTINUIDADE";

if(
consecutiveLoss>=3||
(shortLoss>=.60&&recent6.length>=5)||
(shortPressure>=.55&&outside6>=3)
) {
behavior="RUPTURA";
} else if(
lossRate>=.32||
shortPressure>=.35||
uncoveredPressure>=.30
) {
behavior="DESLOCAMENTO";
}

return {
behavior,
lossRate,
shortLoss,
outside,
outside6,
uncoveredPressure,
shortPressure,
consecutiveLoss,
sample:recent12.length,
losses:losses.length
};
}

/* ======================================================
 RECONSTRUÇÃO INDEPENDENTE
====================================================== */

function independentWeights(
original,
trigger,
history,
strategyId,
variant="AUTO"
) {
const evidence=uncoveredEvidence(
original,
trigger,
history,
strategyId
);

const reading=behaviorReading(
original,
trigger,
history,
strategyId
);

const behavior=variant==="AUTO"
?reading.behavior
:variant;

const weights=Array(37).fill(.10);
const originalSet=new Set(
original.play.numbers
);

const recent=history.slice(-60);
const recent24=history.slice(-24);
const recent8=history.slice(-8);

for(const n of W) {
const p=idx(n);

const frequency=recent.filter(
x=>x===n
).length;

const short=recent24.filter(
x=>x===n
).length;

const veryShort=recent8.filter(
x=>x===n
).length;

const uncoveredNow=
!originalSet.has(n);

let value=
frequency*.30+
short*.55+
veryShort*.85;

const historical=evidence.scores[p];

if(behavior==="CONTINUIDADE") {
value+=historical*.55;
value+=originalSet.has(n)?1.9:.45;
}

if(behavior==="DESLOCAMENTO") {
value+=historical*.95;
value+=uncoveredNow?2.5:.30;
}

if(behavior==="RUPTURA") {
value+=historical*1.25;
value+=uncoveredNow?4.5:0;
}

weights[p]+=value;
}

for(let k=0;k<recent.length;k++) {
const number=recent[recent.length-1-k];
const p=idx(number);

const decay=Math.exp(
-k/(behavior==="RUPTURA"?8:14)
);

const strength=
behavior==="CONTINUIDADE"?.45:
behavior==="DESLOCAMENTO"?.65:.85;

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=3) {
weights[j]+=
decay*strength*(4-d)/4;
}
}
}

const rows=recoveryRows(
strategyId,100
);

const global=recoveryRows(
null,180
);

for(const row of rows) {
if(row.hit)continue;

const age=Math.max(
0,state.history.length-row.turn
);

const decay=Math.exp(-age/80);

if(
Number.isInteger(row.outcome)&&
row.outcome>=0&&row.outcome<=36
) {
weights[idx(row.outcome)]+=
1.1*decay;
}

for(const n of row.uncovered||[]) {
if(n>=0&&n<=36) {
weights[idx(n)]+=.06*decay;
}
}
}

for(const row of global) {
if(row.hit)continue;

const age=Math.max(
0,state.history.length-row.turn
);

const decay=Math.exp(-age/100);

if(
Number.isInteger(row.outcome)&&
row.outcome>=0&&row.outcome<=36
) {
weights[idx(row.outcome)]+=
.20*decay;
}
}

for(const n of neighbors(trigger,2)) {
weights[idx(n)]+=
behavior==="RUPTURA"?.55:.35;
}

return {
weights,
behavior,
reading,
evidence
};
}

function reconstructIndependent(
original,
trigger,
history,
strategyId,
variant="AUTO"
) {
if(!validPlay(original?.play))return null;

const model=independentWeights(
original,
trigger,
history,
strategyId,
variant
);

const play=geometry(model.weights);

if(!validPlay(play))return null;

return {
key:"G1_INDEPENDENTE",
rank:0,
score:play.score,
play,
g1:true,
independent:true,
behavior:model.behavior,
trigger,
reading:model.reading
};
}

/* ======================================================
 OPÇÕES G1
====================================================== */

function buildG1Options(
original,
trigger,
history,
strategyId
) {
if(!validPlay(original?.play))return [];

const options=[];

const frozen=frozenG1(original);

options.push({
id:"CONGELADO",
mode:"CONGELADO",
key:frozen.key,
rank:frozen.rank||0,
motor:frozen
});

const fine=tuneG1(original,trigger);

if(validPlay(fine?.play)) {
options.push({
id:"AJUSTE FINO",
mode:"AJUSTE FINO",
key:fine.key,
rank:fine.rank||0,
motor:compactPlay(fine)
});
}

const independent=reconstructIndependent(
original,
trigger,
history,
strategyId
);

if(validPlay(independent?.play)) {
options.push({
id:"RECONSTRUÇÃO",
mode:"RECONSTRUÇÃO",
key:"G1_INDEPENDENTE",
rank:0,
behavior:independent.behavior,
motor:compactPlay(independent)
});
}

return options;
}

/* ======================================================
 ESTATÍSTICAS G1
====================================================== */

function g1StatKey(strategyId,optionId) {
return strategyId+"|"+optionId;
}

function emptyG1Stat() {
return {
total:0,
hits:0,
recent:[],
lossStreak:0,
maxLossStreak:0,
lastTurn:0
};
}

function g1Rate(values) {
return values.length
?values.reduce((a,b)=>a+b,0)/values.length
:null;
}

function g1OptionEvidence(
strategyId,
option
) {
const key=g1StatKey(
strategyId,
option.id
);

const stat=state.g1Stats[key]||
emptyG1Stat();

const recent=stat.recent||[];
const base=28/37;

function smooth(values,priorWeight) {
const n=values.length;
const hits=values.reduce((a,b)=>a+b,0);

return (
hits+base*priorWeight
)/(n+priorWeight);
}

const s3=smooth(recent.slice(-3),5);
const s12=smooth(recent.slice(-12),8);
const s30=smooth(recent.slice(-30),12);

const all=(
stat.hits+base*15
)/(stat.total+15);

const consistency=1-clamp(
(Math.abs(s3-s12)+Math.abs(s12-s30))/2,
0,1
);

const lossPenalty=
Math.min(stat.lossStreak,5)*.008;

const score=
s3*.15+
s12*.35+
s30*.30+
all*.15+
consistency*.05-
lossPenalty;

return {
score,
sample:stat.total,
hits:stat.hits,
r3:g1Rate(recent.slice(-3)),
r12:g1Rate(recent.slice(-12)),
r30:g1Rate(recent.slice(-30)),
lossStreak:stat.lossStreak,
consistency
};
}

/* ======================================================
 COMPARAÇÃO DAS DEFESAS
====================================================== */

function chooseBestG1(
original,
trigger,
history,
strategyId
) {
const options=buildG1Options(
original,
trigger,
history,
strategyId
);

if(!options.length)return null;

const originalSet=new Set(
original.play.numbers
);

const reading=behaviorReading(
original,
trigger,
history,
strategyId
);

const ranked=options.map(option=>{
const evidence=g1OptionEvidence(
strategyId,
option
);

const retained=option.motor.play.numbers.filter(
n=>originalSet.has(n)
).length;

const missing=uncovered(option.motor.play);

const recent=history.slice(-18);

const recentCoverage=recent.length
?recent.filter(
n=>option.motor.play.numbers.includes(n)
).length/recent.length
:28/37;

const recovery=recoveryMetrics(
strategyId,
option.mode,
100
);

const recoveryScore=(
recovery.hits+
(28/37)*12
)/(recovery.total+12);

let behaviorBonus=0;

if(reading.behavior==="CONTINUIDADE") {
if(option.mode==="CONGELADO") {
behaviorBonus=.012;
}
}

if(reading.behavior==="DESLOCAMENTO") {
if(option.mode==="AJUSTE FINO") {
behaviorBonus=.010;
}
if(option.mode==="RECONSTRUÇÃO") {
behaviorBonus=.012;
}
}

if(reading.behavior==="RUPTURA") {
if(option.mode==="RECONSTRUÇÃO") {
behaviorBonus=.022;
}
}

const score=
recoveryScore*.55+
evidence.score*.25+
recentCoverage*.15+
(retained/28)*.05+
behaviorBonus;

return {
...option,
evidence,
retained,
missing,
recentCoverage,
recovery,
score
};
});

ranked.sort((a,b)=>
b.score-a.score||
b.evidence.sample-a.evidence.sample||
b.retained-a.retained
);

const frozen=ranked.find(
x=>x.mode==="CONGELADO"
);

let chosen=ranked[0];

if(
frozen&&
chosen!==frozen&&
chosen.evidence.sample<8&&
chosen.score-frozen.score<.025
) {
chosen=frozen;
}

return {
mode:chosen.mode,
key:chosen.key,
rank:chosen.rank,
motor:clone(chosen.motor),
score:chosen.score,
strategyId,
trigger,
turn:state.history.length+1,
sample:chosen.evidence.sample,
behavior:reading.behavior,
reading,
uncovered:chosen.missing,
alternatives:ranked.map(x=>({
mode:x.mode,
key:x.key,
rank:x.rank,
score:x.score,
sample:x.evidence.sample,
hits:x.evidence.hits,
recoveryHits:x.recovery.hits,
recoveryTotal:x.recovery.total,
uncovered:x.missing
}))
};
}

/* ======================================================
 V6.3.6:
 REGISTRO DE DECISÃO DE COMPORTAMENTO
====================================================== */

function recordBehaviorDecision({
strategyId,
motorKey,
behavior,
mode,
trigger,
virtual,
turn
}) {
if(!BEHAVIORS.includes(behavior))return;

const row={
turn,
strategyId,
motorKey,
behavior,
mode,
trigger,
virtual:!!virtual
};

state.g1BehaviorHistory.push(row);

state.g1MotorHistory.push(row);
}

/* ======================================================
 DECISÃO REAL G1
====================================================== */

function activeDefinition() {
const defs=definitions();

if(state.strategy==="TRAINER") {
return defs.find(
d=>d.id===state.trainerChoice
)||defs[0];
}

if(state.strategy==="ADAPTIVE") {
return defs.find(
d=>d.id==="ADAPTIVE:"+state.activeAdaptive
)||defs[0];
}

if(state.strategy==="CREATED") {
return defs.find(
d=>d.id==="CREATED:"+state.activeCreated
)||defs[0];
}

return defs.find(
d=>d.id==="ORIGINAL:"+state.strategy
)||defs[0];
}

function chooseG1(
original,
trigger,
postHistory
) {
const strategyId=
state.cycle?.strategyId||
activeDefinition().id;

if(!state.g1Trainer) {
const motor=state.g1
?tuneG1(original,trigger)
:clone(original);

const reading=behaviorReading(
original,
trigger,
postHistory,
strategyId
);

state.g1Decision={
mode:state.g1?"AJUSTE FINO":"CONGELADO",
key:motor?.key||original?.key||"—",
rank:motor?.rank||0,
strategyId,
trigger,
turn:state.history.length+1,
trainer:false,
behavior:reading.behavior,
uncovered:uncovered(motor?.play)
};

recordBehaviorDecision({
strategyId,
motorKey:original.key,
behavior:reading.behavior,
mode:state.g1Decision.mode,
trigger,
virtual:false,
turn:state.history.length+1
});

return motor;
}

const decision=chooseBestG1(
original,
trigger,
postHistory,
strategyId
);

if(!decision) {
const fallback=clone(original);

state.g1Decision={
mode:"CONGELADO",
key:original.key,
rank:original.rank||0,
strategyId,
trigger,
trainer:true,
behavior:"CONTINUIDADE",
uncovered:uncovered(original.play)
};

return fallback;
}

state.g1Decision={
mode:decision.mode,
key:decision.key,
rank:decision.rank,
score:decision.score,
sample:decision.sample,
strategyId,
trigger,
turn:decision.turn,
trainer:true,
behavior:decision.behavior,
uncovered:decision.uncovered,
alternatives:decision.alternatives
};

state.g1DecisionHistory.push({
turn:decision.turn,
strategyId,
mode:decision.mode,
behavior:decision.behavior,
score:decision.score,
uncovered:decision.uncovered
});

recordBehaviorDecision({
strategyId,
motorKey:original.key,
behavior:decision.behavior,
mode:decision.mode,
trigger,
virtual:false,
turn:decision.turn
});

return clone(decision.motor);
}

/* ======================================================
 TREINADOR VIRTUAL G1
====================================================== */

function settleG1Pending(number) {
if(!state.g1Pending.length)return;

for(const pending of state.g1Pending) {
const hit=pending.numbers.includes(number);

const key=g1StatKey(
pending.strategyId,
pending.optionId
);

const stat=state.g1Stats[key]||
emptyG1Stat();

stat.total++;
stat.hits+=hit?1:0;
stat.recent.push(hit?1:0);

if(stat.recent.length>60)stat.recent.shift();

stat.lossStreak=hit
?0:stat.lossStreak+1;

stat.maxLossStreak=Math.max(
stat.maxLossStreak,
stat.lossStreak
);

stat.lastTurn=state.history.length+1;

state.g1Stats[key]=stat;

const row={
turn:state.history.length+1,
strategyId:pending.strategyId,
motorKey:pending.motorKey,
optionId:pending.optionId,
mode:pending.mode,
key:pending.key,
trigger:pending.trigger,
outcome:number,
hit,
uncovered:pending.uncovered,
behavior:pending.behavior||"—"
};

state.g1Virtual.push(row);
state.g1Recovery.push(row);
}

state.g1Pending=[];
state.g1VirtualTurns++;
}

function createG1Pending(
number,
virtualMisses
) {
const afterHistory=[
...state.history.slice(-199),
number
];

const pending=[];

for(const miss of virtualMisses) {
const options=buildG1Options(
miss.motor,
number,
afterHistory,
miss.strategyId
);

const reading=behaviorReading(
miss.motor,
number,
afterHistory,
miss.strategyId
);

for(const option of options) {
pending.push({
strategyId:miss.strategyId,
motorKey:miss.motor.key,
optionId:option.id,
mode:option.mode,
key:option.key,
trigger:number,
createdTurn:state.history.length+1,
numbers:[...option.motor.play.numbers],
uncovered:uncovered(option.motor.play),
behavior:reading.behavior
});
}
}

state.g1Pending=pending;
}

/* ======================================================
 SIMULAÇÃO VIRTUAL
====================================================== */

function profit(result) {
const unit=Number(state.stake)||1;
const g=Number(state.galeMultiplier)||1;

if(result==="GREEN")return 8*unit;

if(result==="GREEN G1") {
return (8*g-28)*unit;
}

if(result==="LOSS") {
return -28*(1+g)*unit;
}

return 0;
}

function virtualCycle(id) {
if(!state.virtualCycles[id]) {
state.virtualCycles[id]={
phase:"ENTRY",
frozen:null,
previous:null,
original:null,
decision:null
};
}

return state.virtualCycles[id];
}

function processVirtual(number,cs) {
const defs=definitions();
const misses=[];

for(const def of defs) {
const v=virtualCycle(def.id);

let motor=null;
let result="AGUARDANDO";
let closed=false;

if(v.phase==="ENTRY") {
const entry=snap(
chooseMotor(def,cs,v.previous)
);

motor=entry;

if(!motor)continue;

v.previous=motor.key;

if(motor.play.numbers.includes(number)) {
result="GREEN";
closed=true;
} else {
result="GALE";

const afterHistory=[
...state.history.slice(-199),
number
];

const decision=chooseBestG1(
motor,
number,
afterHistory,
def.id
);

v.original=clone(motor);
v.decision=decision;

v.frozen=decision?.motor||
tuneG1(motor,number)||
clone(motor);

v.phase="GALE";

misses.push({
strategyId:def.id,
motor:clone(motor)
});

const behavior=decision?.behavior||
behaviorReading(
motor,
number,
afterHistory,
def.id
).behavior;

recordBehaviorDecision({
strategyId:def.id,
motorKey:motor.key,
behavior,
mode:decision?.mode||"CONGELADO",
trigger:number,
virtual:true,
turn:state.history.length+1
});
}
} else {
motor=clone(v.frozen);

result=motor?.play.numbers.includes(number)
?"GREEN G1":"LOSS";

closed=true;

v.phase="ENTRY";
v.frozen=null;
v.original=null;
v.decision=null;
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

return misses;
}

/* ======================================================
 ESTABILIDADE
====================================================== */

function virtualMetrics(id,window) {
const rows=state.virtualRows.filter(
r=>r.strategy===id&&r.closed
).slice(-window);

let green=0;
let g1=0;
let loss=0;
let streak=0;
let maxLoss=0;
let net=0;

for(const r of rows) {
net+=r.profit;

if(r.result==="GREEN") {
green++;
streak=0;
}

if(r.result==="GREEN G1") {
g1++;
streak=0;
}

if(r.result==="LOSS") {
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

function stability(id) {
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
 TREINADOR GLOBAL
====================================================== */

let rankingCacheKey=null;
let rankingCache=null;

function trainerRanking(cs=getCandidates()) {
const key=
state.history.length+":"+
state.virtualRows.length+":"+
state.createdStrategies.length;

if(rankingCacheKey===key&&rankingCache) {
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

function trainerUpdate(cs=getCandidates()) {
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

if(previous) {
if(turns>=3||state.trainerPending) {
shouldChange=true;
reason="LIMITE DE 3 GIROS";
} else if(
turns>=1&&
best.id!==previous&&
best.score>(current?.score??0)+.035
) {
shouldChange=true;
reason="DESEMPENHO RECENTE";
}
}

if(!shouldChange)return;

const alternatives=previous
?ranking.rows.filter(r=>r.id!==previous)
:ranking.rows;

const chosen=alternatives[0]||best;

if(previous&&chosen.id!==previous) {
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
}

function activeMotor(cs) {
if(state.manual) {
return cs.find(
c=>c.key===state.manual
)||cs[0]||null;
}

const def=activeDefinition();

if(state.strategy==="TRAINER") {
return trainerRanking(cs).rows.find(
r=>r.id===state.trainerChoice
)?.motor||cs[0]||null;
}

return chooseMotor(
def,cs,state.previousMotor
);
}

/* ======================================================
 PROCESSAMENTO REAL
====================================================== */

function recordSpin(
number,
source="TEMPO REAL",
persist=true
) {
if(!Number.isInteger(number)||number<0||number>36) {
throw new Error("NÚMERO INVÁLIDO");
}

const cs=getCandidates();

const virtual=cs.map(c=>({
key:c.key,
rank:c.rank,
numbers:[...c.play.numbers]
}));

settleG1Pending(number);

if(
state.strategy==="TRAINER"&&
state.phase==="ENTRY"
) {
trainerUpdate(cs);
}

const def=activeDefinition();

let motor=null;
let result="AGUARDANDO";

const before=state.phase;
const cycleBefore=clone(state.cycle);
const decisionBefore=clone(state.g1Decision);

if(state.phase==="ENTRY") {
motor=snap(activeMotor(cs));

if(motor) {
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

if(state.secondHouse) {
state.frozen=clone(motor);
state.phase="SECOND_SKIP";
result="2ª CASA";
} else if(motor.play.numbers.includes(number)) {
result="GREEN";
state.phase="ENTRY";
state.cycle=null;
state.frozen=null;
} else {
result="GALE";
state.cycle.firstNumber=number;

const afterHistory=[
...state.history.slice(-199),
number
];

state.frozen=chooseG1(
motor,
number,
afterHistory
);

state.phase=state.galeSkip
?"GALE_SKIP":"GALE";
}
}
}

else if(state.phase==="SECOND_SKIP") {
motor=clone(state.frozen);
result="CASA PULADA";
state.phase="SECOND_ENTRY";
}

else if(state.phase==="SECOND_ENTRY") {
motor=clone(state.frozen);

if(motor?.play.numbers.includes(number)) {
result="GREEN";
state.phase="ENTRY";
state.cycle=null;
state.frozen=null;
} else {
result="GALE";
state.cycle.firstNumber=number;

const afterHistory=[
...state.history.slice(-199),
number
];

state.frozen=chooseG1(
motor,
number,
afterHistory
);

state.phase=state.cycle.options.galeSkip
?"GALE_SKIP":"GALE";
}
}

else if(state.phase==="GALE_SKIP") {
motor=clone(state.frozen);
result="GALE PULADO";
state.phase="GALE";
}

else if(state.phase==="GALE") {
motor=clone(state.frozen);

result=motor?.play.numbers.includes(number)
?"GREEN G1":"LOSS";

state.g1History.push({
turn:state.history.length+1,
strategyId:state.cycle?.strategyId||"",
motorKey:state.cycle?.original?.key||"",
mode:state.g1Decision?.mode||"—",
motor:state.g1Decision?.key||"—",
behavior:state.g1Decision?.behavior||"—",
trigger:state.cycle?.firstNumber,
outcome:number,
result,
uncovered:state.g1Decision?.uncovered||[]
});

state.phase="ENTRY";
state.cycle=null;
state.frozen=null;
state.g1Decision=null;
}

const virtualMisses=processVirtual(
number,cs
);

createG1Pending(
number,
virtualMisses
);

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

invalidate();
rankingCacheKey=null;

if(
state.strategy==="TRAINER"&&
!state.manual
) {
state.trainerTurns++;

if(state.phase==="ENTRY") {
trainerUpdate(getCandidates());
} else if(state.trainerTurns>=3) {
state.trainerPending=true;
}
}

if(persist)save();
}

/* ======================================================
 IMPORTAÇÃO / RECONSTRUÇÃO
====================================================== */

let importing=false;

async function rebuild(numbers,sources=null) {
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

const oldState=state;

try {
state=fresh();
Object.assign(state,options);

invalidate();
rankingCacheKey=null;

const clean=validNumbers(numbers);

for(let i=0;i<clean.length;i++) {
recordSpin(
clean[i],
sources?.[i]||"HISTÓRICO",
false
);

if(i%5===4) {
const status=$("status");

if(status) {
status.textContent=
"PROCESSANDO "+(i+1)+"/"+clean.length;
}

await new Promise(
resolve=>setTimeout(resolve,0)
);
}
}

save();
} catch(e) {
state=oldState;
invalidate();
rankingCacheKey=null;
showError(e);
} finally {
importing=false;
render();
}
}

async function undo() {
if(!state.history.length)return;

await rebuild(
state.history.slice(0,-1),
state.sources.slice(0,-1)
);
}

/* ======================================================
 V6.3.6:
 ESTATÍSTICAS DOS 12 MOTORES
====================================================== */

function motorG1Metrics(motorKey) {
const rows=state.g1Recovery.filter(
r=>r.motorKey===motorKey
);

const grouped=new Map();

for(const r of rows) {
const id=r.strategyId+"|"+r.turn+"|"+r.mode;

if(!grouped.has(id))grouped.set(id,r);
}

const unique=[...grouped.values()];

const modes={};

for(const mode of G1_MODES) {
const selected=unique.filter(
r=>r.mode===mode
);

const hits=selected.filter(r=>r.hit).length;

modes[mode]={
total:selected.length,
hits,
loss:selected.length-hits
};
}

const behaviors=behaviorMetrics(
state.g1MotorHistory.filter(
r=>r.motorKey===motorKey&&r.virtual
)
);

const galeEvents=new Set(
state.g1MotorHistory.filter(
r=>r.motorKey===motorKey&&r.virtual
).map(r=>r.strategyId+"|"+r.turn)
);

return {
gales:galeEvents.size,
modes,
behaviors
};
}

function motorActualMetrics(motorKey) {
const rows=state.g1History.filter(
r=>r.motorKey===motorKey
);

const hits=rows.filter(
r=>r.result==="GREEN G1"
).length;

return {
total:rows.length,
hits,
loss:rows.length-hits
};
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
margin-bottom:18px;
line-height:1.6
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
color:#fff;
text-align:center;
font-variant-numeric:tabular-nums
}

.center.short .centerNumber{
color:#111
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
color:#111
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

.g1card{
border:1px solid #476785;
border-radius:9px;
background:#142337;
padding:12px;
margin:9px 0
}

.g1card.active{
border:2px solid #46e8b5;
background:#10392f
}

.g1card h3{
font-size:13px;
margin:0 0 8px;
color:#65e4ff
}

.g1number{
display:inline-flex;
align-items:center;
justify-content:center;
min-width:37px;
min-height:37px;
border-radius:7px;
border:1px solid #6b829b;
background:#263b53;
font-size:17px;
font-weight:900;
margin:3px
}

.g1number.dangerNumber{
background:#63283b;
border-color:#ff657c
}

.behaviorGrid{
display:grid;
grid-template-columns:repeat(3,minmax(0,1fr));
gap:6px;
margin:10px 0
}

.behaviorBox{
border-radius:9px;
padding:10px 4px;
text-align:center;
border:1px solid #52647b;
background:#26364a
}

.behaviorBox small{
display:block;
font-size:9px;
font-weight:bold;
overflow-wrap:anywhere
}

.behaviorBox strong{
display:block;
font-size:26px;
margin:7px 0
}

.behaviorBox span{
font-size:12px;
font-weight:bold
}

.continuity{
border-color:#38c895;
background:#123c35
}

.displacement{
border-color:#e4bd4b;
background:#453b20
}

.rupture{
border-color:#ff6482;
background:#482632
}

.galeSummary{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:6px;
margin:10px 0
}

.galeItem{
background:#27394d;
border:1px solid #526a84;
border-radius:8px;
text-align:center;
padding:10px 4px
}

.galeItem small{
display:block;
font-size:9px
}

.galeItem strong{
display:block;
font-size:25px;
margin:6px 0
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

.g1number{
min-width:32px;
min-height:32px;
font-size:15px
}

.behaviorBox small{
font-size:8px
}
}

@media(max-width:380px){
.centerNumber{font-size:28px}
.centerInfo{font-size:7px}
}
`;

document.body.innerHTML=`
<style>${css}</style>

<main class="app">

<h1>ANÁLISE BETA V${VERSION}</h1>

<div class="sub">
12 MOTORES • TREINADOR GLOBAL •
TREINADOR G1 INDEPENDENTE • 28 NÚMEROS
<br>
CONTINUIDADE • DESLOCAMENTO • RUPTURA
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
["g1ranking","RANKING EXCLUSIVO DE GALE / LOSS"],
["g1numbers","DEFESAS G1 E NÚMEROS DESCOBERTOS"],
["lab","LABORATÓRIO"],
["motors","12 MOTORES + RUPTURA / QUANTIDADES"],
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
V6.3.6 — As três defesas são comparadas
somente quando uma estratégia entra em GALE.
Os resultados são registrados na rodada seguinte.
A reconstrução é independente dos 12 motores.
</div>

</main>
`;

/* ======================================================
 COMPONENTES
====================================================== */

function button(label,fn,parent,extra="") {
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
) {
state.strategy=rule;
state.activeAdaptive=adaptive;
state.activeCreated=created;
state.manual=null;

if(rule==="TRAINER") {
state.trainerChoice=null;
state.trainerMotor=null;
state.trainerTurns=0;
state.trainerPending=false;
trainerUpdate();
}

save();
render();
}

function buildStrategies() {
const root=$("strategies");
root.innerHTML="";

const groups=[
[
"TREINADOR",
[
["TREINADOR GLOBAL",
()=>changeStrategy("TRAINER"),
"TRAINER"]
]
],
[
"ORIGINAIS",
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

for(const [label,items] of groups) {
const group=document.createElement("div");
group.className="strategyGroup";

group.innerHTML=`
<div class="strategyLabel">${label}</div>
`;

const row=document.createElement("div");
row.className="row";

for(const [name,fn,key] of items) {
const b=button(
name,
fn,
row,
key==="TRAINER"?"trainer":""
);

b.dataset.choice=key;
}

group.appendChild(row);
root.appendChild(group);
}

const ranks=document.createElement("div");
ranks.className="row";

for(let i=1;i<=4;i++) {
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

if(state.createdStrategies.length) {
const group=document.createElement("div");
group.className="strategyGroup";

group.innerHTML=`
<div class="strategyLabel">PERSONALIZADAS</div>
`;

const row=document.createElement("div");
row.className="row";

for(const c of state.createdStrategies) {
const b=button(
c.name,
()=>changeStrategy(
"CREATED",null,c.id
),
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
]) {
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

for(let n=0;n<=36;n++) {
const b=document.createElement("button");

b.className="key"+(n===0?" zero":"");
b.textContent=n;

b.style.background=
n===0?"#087b50":
RED.has(n)?"#ac293f":"#12151b";

b.onclick=()=>{
if(importing)return;

try {
recordSpin(n);
render();
} catch(e) {
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

if(!numbers.length) {
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

for(const key of [
BACKUP_KEY,
...OLD_KEYS
]) {
const data=read(key);

if(data?.history?.length) {
old=data;
break;
}
}

if(!old) {
alert("NENHUM HISTÓRICO ANTERIOR ENCONTRADO.");
return;
}

if(!confirm(
"RECUPERAR "+old.history.length+" NÚMEROS?"
))return;

rebuild(old.history,old.sources);
};

$("undo").onclick=()=>{
if(importing)return;
undo();
};

$("clear").onclick=()=>{
if(importing)return;

if(!confirm(
"APAGAR O HISTÓRICO ATUAL?"
))return;

state=fresh();

invalidate();
rankingCacheKey=null;

buildStrategies();

save();
render();
};

document.addEventListener(
"click",
event=>{
const b=event.target.closest(
"[data-panel]"
);

if(!b)return;

const id=b.dataset.panel;

state.open[id]=!state.open[id];

save();
render();
}
);

/* ======================================================
 RENDERIZAÇÃO
====================================================== */

function showError(e) {
const status=$("status");

if(status) {
status.textContent=
"ERRO CONTROLADO: "+
String(e?.message||e);
}

console.error("ANÁLISE BETA:",e);
}

function sortedBlocks(play) {
if(!play)return [];

return [...play.blocks].sort((a,b)=>
REGION_NAMES.indexOf(region(a.center))-
REGION_NAMES.indexOf(region(b.center))
);
}

function centersHTML(play) {
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
${b.radius}
${b.radius===1?"VIZINHO":"VIZINHOS"}
</small>

</div>
`).join("");
}

function metrics(rows) {
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

return {
closed,green,g1,loss,net
};
}

function metricsHTML(rows) {
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

function galeSummaryHTML(m) {
return `
<div class="galeSummary">

<div class="galeItem">
<small>GALES NECESSÁRIOS</small>
<strong>${m.total}</strong>
</div>

<div class="galeItem">
<small>GREEN G1</small>
<strong class="good">${m.hits}</strong>
</div>

<div class="galeItem">
<small>LOSS</small>
<strong class="bad">${m.loss}</strong>
</div>

</div>

<div class="muted">
ACERTO: <b>${pct(m.hits,m.total)}</b>
•
ERRO: <b>${pct(m.loss,m.total)}</b>
</div>
`;
}

function trainerHTML() {
const ranking=trainerRanking();

const active=ranking.rows.find(
r=>r.id===state.trainerChoice
);

const best=ranking.best;

const real=actualG1Metrics();

const virtualDecisions=state.g1BehaviorHistory.filter(
r=>r.virtual
);

const realDecisions=state.g1BehaviorHistory.filter(
r=>!r.virtual
);

const totalVirtual=state.g1Virtual.length;

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

<b>TREINADOR GLOBAL G1 — V6.3.6</b>

<p>
STATUS:
<strong class="${state.g1Trainer?"good":"bad"}">
${state.g1Trainer?"ATIVADO":"DESATIVADO"}
</strong>
</p>

<p>
DEFESAS VIRTUAIS CONCLUÍDAS:
<strong>${totalVirtual}</strong>
</p>

<p>
PREVISÕES AGUARDANDO:
<strong>${state.g1Pending.length}</strong>
</p>

<p>
GIROS DE RECUPERAÇÃO AVALIADOS:
<strong>${state.g1VirtualTurns}</strong>
</p>

<div class="title">
GALES REAIS / GREEN G1 / LOSS
</div>

${galeSummaryHTML(real)}

<div class="title">
COMPORTAMENTO DO TREINADOR G1 REAL
</div>

${behaviorHTML(realDecisions)}

<div class="title">
COMPORTAMENTO DOS TREINADORES VIRTUAIS
</div>

${behaviorHTML(virtualDecisions)}

<p>
DEFESA ATUAL:
<strong>${esc(
state.g1Decision?.mode||"AGUARDANDO"
)}</strong>
</p>

<p>
COMPORTAMENTO ATUAL:
<strong>${esc(
state.g1Decision?.behavior||"AGUARDANDO"
)}</strong>
</p>

</div>

<div class="box">

<b>MELHOR AVALIAÇÃO DE ENTRADA</b>

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
:"SEM ALERTA COLETIVO ATIVO."}
</p>

</div>

<button class="virtualButton" id="activateTrainer">
ATIVAR TREINADOR GLOBAL
</button>

<div class="title">
RANKING DE ESTABILIDADE DE ENTRADA
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

<div class="title">
COMPORTAMENTO POR ESTRATÉGIA VIRTUAL
</div>

${ranking.rows.map(r=>{
const rows=virtualDecisions.filter(
x=>x.strategyId===r.id
);

const recovered=state.virtualRows.filter(
x=>x.strategy===r.id&&
["GREEN G1","LOSS"].includes(x.result)
);

const hits=recovered.filter(
x=>x.result==="GREEN G1"
).length;

return `
<div class="g1card">

<h3>${esc(r.name)}</h3>

${galeSummaryHTML({
total:recovered.length,
hits,
loss:recovered.length-hits
})}

${behaviorHTML(rows)}

</div>
`;
}).join("")}

<div class="title">ÚLTIMAS TROCAS</div>

${state.trainerHistory.slice(-12).reverse().map(x=>`
<div class="listrow">

GIRO ${x.turn} •
${esc(x.from||"INÍCIO")}
→ ${esc(x.to)}

<div class="muted">
${esc(x.reason)} • ${esc(x.motor)}
</div>

</div>
`).join("")}
`;
}

/* ======================================================
 RANKING G1 EXCLUSIVO
====================================================== */

function g1RankingHTML() {
const ranking=g1Ranking();

return `
<div class="box">

<b>RANKING EXCLUSIVO DE RECUPERAÇÃO</b>

<p>
NÃO CONSIDERA GREEN DE PRIMEIRA ENTRADA.
</p>

<p>
COMPARA SOMENTE:
CONGELADO • AJUSTE FINO • RECONSTRUÇÃO.
</p>

<p>
CADA ESTRATÉGIA REGISTRA O GALE
E AS TRÊS DEFESAS SÃO AVALIADAS
NO RESULTADO SEGUINTE.
</p>

</div>

<div class="title">
COMPORTAMENTO GLOBAL DOS GALES VIRTUAIS
</div>

${behaviorHTML(
state.g1BehaviorHistory.filter(r=>r.virtual)
)}

<div class="tablewrap">
<table>

<thead>
<tr>
<th>#</th>
<th>ESTRATÉGIA</th>
<th>GALES</th>
<th>MELHOR DEFESA</th>
<th>GREEN G1</th>
<th>LOSS</th>
<th>ACERTO</th>
<th>RUPTURAS</th>
</tr>
</thead>

<tbody>

${ranking.map((r,i)=>`
<tr>
<td>${i+1}</td>
<td>${esc(r.name)}</td>
<td>${r.best.total}</td>
<td>${esc(r.best.mode)}</td>
<td class="good">${r.best.hits}</td>
<td class="bad">${r.best.loss}</td>
<td>${pct(r.best.hits,r.best.total)}</td>
<td>${r.behaviors.counts.RUPTURA}</td>
</tr>
`).join("")}

</tbody>
</table>
</div>

<div class="title">
COMPARAÇÃO DAS TRÊS DEFESAS
</div>

${ranking.map(r=>`
<div class="g1card">

<h3>${esc(r.name)}</h3>

<div class="title">
CONTINUIDADE / DESLOCAMENTO / RUPTURA
</div>

${behaviorHTML(
state.g1BehaviorHistory.filter(
x=>x.strategyId===r.id&&x.virtual
)
)}

<div class="tablewrap">
<table>

<thead>
<tr>
<th>DEFESA</th>
<th>GALES</th>
<th>GREEN G1</th>
<th>LOSS</th>
<th>ACERTO</th>
<th>ERRO</th>
</tr>
</thead>

<tbody>

${G1_MODES.map(mode=>{
const m=r.modes[mode];

return `
<tr>
<td>${esc(mode)}</td>
<td>${m.total}</td>
<td class="good">${m.hits}</td>
<td class="bad">${m.loss}</td>
<td>${pct(m.hits,m.total)}</td>
<td>${pct(m.loss,m.total)}</td>
</tr>
`;
}).join("")}

</tbody>
</table>
</div>

<div class="title">
GALES REAIS
</div>

${galeSummaryHTML({
total:r.actualTotal,
hits:r.actualHits,
loss:r.actualLoss
})}

</div>
`).join("")}
`;
}

/* ======================================================
 DEFESAS E DESCOBERTOS
====================================================== */

function numberCloud(numbers,highlight=[]) {
const marked=new Set(highlight);

return `
<div class="numberCloud">
${numbers.map(n=>`
<span class="g1number ${
marked.has(n)?"dangerNumber":""
}">
${n}
</span>
`).join("")}
</div>
`;
}

function g1NumbersHTML() {
const cs=getCandidates();

const original=state.cycle?.original||
snap(activeMotor(cs));

if(!validPlay(original?.play)) {
return `
<div class="box">
AGUARDANDO HISTÓRICO SUFICIENTE.
</div>
`;
}

const strategyId=
state.cycle?.strategyId||
activeDefinition().id;

const trigger=
state.cycle?.firstNumber??
state.history.at(-1);

if(trigger==null) {
return `
<div class="box">
AGUARDANDO RESULTADOS.
</div>
`;
}

const history=state.history.slice(-200);

const reading=behaviorReading(
original,
trigger,
history,
strategyId
);

const evidence=uncoveredEvidence(
original,
trigger,
history,
strategyId
);

const options=buildG1Options(
original,
trigger,
history,
strategyId
);

const decision=chooseBestG1(
original,
trigger,
history,
strategyId
);

const activeMode=state.g1Decision?.mode||
decision?.mode;

const currentMissing=uncovered(original.play);

const real=actualG1Metrics(strategyId);

const behaviorRows=state.g1BehaviorHistory.filter(
r=>r.strategyId===strategyId&&!r.virtual
);

return `
<div class="box">

<b>LEITURA DE RECUPERAÇÃO G1 — V6.3.6</b>

<p>
ESTRATÉGIA:
<strong>${esc(
state.cycle?.strategy||
activeDefinition().name
)}</strong>
</p>

<p>
MOTOR DE ENTRADA:
<strong>${esc(original.key)}</strong>
</p>

<p>
COMPORTAMENTO IDENTIFICADO:
<strong>${esc(reading.behavior)}</strong>
</p>

<p>
LOSS RECENTE G1:
${pct(
Math.round(reading.lossRate*reading.sample),
reading.sample
)}
</p>

<p>
RESULTADOS FORA DA COBERTURA,
ÚLTIMOS 6:
${reading.outside6}
</p>

<p>
DEFESA SELECIONADA:
<strong>${esc(activeMode||"—")}</strong>
</p>

</div>

<div class="title">
GALES NECESSÁRIOS / ACERTOS / ERROS
</div>

${galeSummaryHTML(real)}

<div class="title">
CONTINUIDADE / DESLOCAMENTO / RUPTURA
</div>

${behaviorHTML(behaviorRows)}

<div class="title">
9 DESCOBERTOS DA ENTRADA
</div>

${numberCloud(currentMissing)}

<div class="title">
TRÊS DEFESAS AVALIADAS
</div>

${options.map(option=>{
const selected=
option.mode===activeMode;

const missing=uncovered(option.motor.play);

const evidenceScore=g1OptionEvidence(
strategyId,
option
);

return `
<div class="g1card ${selected?"active":""}">

<h3>
${esc(option.mode)}
${selected?" • SELECIONADA":""}
</h3>

<div class="muted">
${option.mode==="RECONSTRUÇÃO"
?"JOGADA NOVA • NÃO COPIA NENHUM MOTOR"
:option.mode==="AJUSTE FINO"
?"ALTERAÇÃO PARCIAL DA ENTRADA"
:"MANTÉM OS 28 NÚMEROS ORIGINAIS"}
</div>

<div class="title">
CENTROS
</div>

<div class="centers">
${centersHTML(option.motor.play)}
</div>

<div class="title">
9 NÚMEROS DESCOBERTOS
</div>

${numberCloud(
missing,
evidence.detail.filter(
x=>x.missedLoss>0
).map(x=>x.number)
)}

${galeSummaryHTML({
total:evidenceScore.sample,
hits:evidenceScore.hits,
loss:evidenceScore.sample-evidenceScore.hits
})}

</div>
`;
}).join("")}

<div class="title">
NÚMEROS COM MAIOR PRESSÃO HISTÓRICA
</div>

<div class="tablewrap">
<table>

<thead>
<tr>
<th>NÚMERO</th>
<th>DESCOBERTO AGORA</th>
<th>ÚLTIMOS 12</th>
<th>LOSS DESCOBERTO</th>
<th>PRESSÃO</th>
</tr>
</thead>

<tbody>

${evidence.detail.slice(0,20).map(x=>`
<tr>
<td><b>${x.number}</b></td>
<td>${x.missing?"SIM":"NÃO"}</td>
<td>${x.shortFrequency}</td>
<td>${x.missedLoss}</td>
<td>${fmt(x.value)}</td>
</tr>
`).join("")}

</tbody>
</table>
</div>

<div class="title">
ÚLTIMAS RECUPERAÇÕES REAIS
</div>

${state.g1History.slice(-15).reverse().map(r=>`
<div class="listrow">

<b>GIRO ${r.turn}</b>
•
${esc(r.mode)}
•
<span class="${
r.result==="LOSS"?"bad":"good"
}">
${esc(r.result)}
</span>

<div class="muted">
GATILHO:
${r.trigger}
•
RESULTADO:
${r.outcome}
•
${esc(r.behavior||"—")}
</div>

</div>
`).join("")}
`;
}

/* ======================================================
 SALTOS
====================================================== */

function jumpsHTML() {
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

/* ======================================================
 ESPELHOS
====================================================== */

function mirrorsHTML() {
const last=state.history.at(-1);

const near=last==null?[]:
W.filter(n=>
MIRROR.has(n)&&
distance(last,n)<=4
);

const far=last==null?[]:
W.filter(n=>
MIRROR.has(n)&&
distance(last,n)>=10
);

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

/* ======================================================
 LINHA DO TEMPO
====================================================== */

function timelineHTML() {
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

${r.g1Decision?`
<div class="muted">
G1:
${esc(r.g1Decision.mode||"—")}
•
${esc(r.g1Decision.behavior||"—")}
</div>
`:""}

</div>
`).join("");
}

/* ======================================================
 V6.3.6:
 PAINEL COMPLETO DOS 12 MOTORES
====================================================== */

function motorsHTML(cs) {
return `
<div class="box">

<b>12 MOTORES — TREINADOR G1 V6.3.6</b>

<p>
CADA MOTOR MOSTRA QUANTAS VEZES
FOI NECESSÁRIO GALE, QUANTOS ACERTOS
E ERROS OCORRERAM E QUANTAS DECISÕES
FORAM CONTINUIDADE, DESLOCAMENTO
OU RUPTURA.
</p>

</div>

<div class="row">

${cs.map(c=>`
<button class="btn" data-manual="${c.key}">
${esc(c.key)}
</button>
`).join("")}

</div>

${cs.map(c=>{
const m=motorG1Metrics(c.key);
const real=motorActualMetrics(c.key);

return `
<div class="g1card">

<h3>
${c.rank}º MOTOR ${esc(c.key)}
</h3>

<div class="muted">
CENTROS:
${sortedBlocks(c.play).map(
b=>b.center
).join(" • ")}
</div>

<div class="title">
GALES VIRTUAIS NECESSÁRIOS
</div>

<div class="galeSummary">
<div class="galeItem">
<small>GALES</small>
<strong>${m.gales}</strong>
</div>
<div class="galeItem">
<small>GREEN G1 REAL</small>
<strong class="good">${real.hits}</strong>
</div>
<div class="galeItem">
<small>LOSS REAL</small>
<strong class="bad">${real.loss}</strong>
</div>
</div>

<div class="muted">
GALES REAIS DESTE MOTOR:
${real.total}
•
ACERTO:
${pct(real.hits,real.total)}
•
ERRO:
${pct(real.loss,real.total)}
</div>

<div class="title">
CONTINUIDADE / DESLOCAMENTO / RUPTURA
</div>

${behaviorHTML(
state.g1MotorHistory.filter(
r=>r.motorKey===c.key&&r.virtual
)
)}

<div class="title">
DEFESAS VIRTUAIS DESTE MOTOR
</div>

<div class="tablewrap">
<table>
<thead>
<tr>
<th>DEFESA</th>
<th>GALES</th>
<th>GREEN G1</th>
<th>LOSS</th>
<th>ACERTO</th>
<th>ERRO</th>
</tr>
</thead>
<tbody>

${G1_MODES.map(mode=>{
const d=m.modes[mode];

return `
<tr>
<td>${esc(mode)}</td>
<td>${d.total}</td>
<td class="good">${d.hits}</td>
<td class="bad">${d.loss}</td>
<td>${pct(d.hits,d.total)}</td>
<td>${pct(d.loss,d.total)}</td>
</tr>
`;
}).join("")}

</tbody>
</table>
</div>

</div>
`;
}).join("")}
`;
}

/* ======================================================
 RENDER PRINCIPAL
====================================================== */

let renderPending=false;

function render() {
if(renderPending)return;

renderPending=true;

requestAnimationFrame(()=>{
renderPending=false;

try {
performRender();
} catch(e) {
showError(e);
}
});
}

function performRender() {
const cs=getCandidates();

if(
state.strategy==="TRAINER"&&
!state.trainerChoice&&
state.phase==="ENTRY"
) {
trainerUpdate(cs);
}

const def=activeDefinition();

const motor=state.frozen||
snap(activeMotor(cs));

const play=motor?.play||null;

$("status").textContent=
"V"+VERSION+" • "+
state.history.length+
" NÚMEROS • "+
cs.length+
"/12 MOTORES • "+
state.phase+
" • G1 VIRTUAL: "+
state.g1Virtual.length+
" • RUPTURAS: "+
behaviorMetrics(
state.g1BehaviorHistory.filter(r=>r.virtual)
).counts.RUPTURA+
(storageWarning
?" • FALHA AO SALVAR: "+storageMessage
:"");

for(const b of document.querySelectorAll(
"[data-choice]"
)) {
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
)) {
b.classList.toggle(
"active",
state.strategy==="FIXED"&&
state.rank===Number(b.dataset.rank)
);
}

for(const b of document.querySelectorAll(
"[data-option]"
)) {
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
" • "+state.g1Decision.key+
" • "+(state.g1Decision.behavior||"")
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
state.ledger.slice(-20).map(
r=>[r.turn,r.result]
)
);

$("last").innerHTML=last.map((n,i)=>{
const turn=
state.history.length-last.length+i+1;

const result=
resultMap.get(turn)||"HISTÓRICO";

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

if(state.open.general) {
$("general").innerHTML=`

<div class="title">HISTÓRICO</div>

${metricsHTML(
state.ledger.filter(
r=>r.source==="HISTÓRICO"
)
)}

<div class="title">TEMPO REAL</div>

${metricsHTML(
state.ledger.filter(
r=>r.source==="TEMPO REAL"
)
)}

<div class="title">TOTAL</div>

${metricsHTML(state.ledger)}

<div class="title">
GALES REAIS — TOTAL
</div>

${galeSummaryHTML(actualG1Metrics())}

<div class="title">
CONTINUIDADE / DESLOCAMENTO / RUPTURA
</div>

${behaviorHTML(
state.g1BehaviorHistory.filter(r=>!r.virtual)
)}

<div class="box">
NÚMEROS ARMAZENADOS:
<b>${state.history.length}</b>
</div>
`;
}

if(state.open.trainer) {
$("trainer").innerHTML=trainerHTML();

$("activateTrainer").onclick=()=>{
changeStrategy("TRAINER");
};
}

if(state.open.g1ranking) {
$("g1ranking").innerHTML=g1RankingHTML();
}

if(state.open.g1numbers) {
$("g1numbers").innerHTML=g1NumbersHTML();
}

if(state.open.lab) {
$("lab").innerHTML=`
<div class="box">
7 ESTRATÉGIAS ORIGINAIS •
12 ADAPTATIVAS •
4 POSIÇÕES AUTO •
ESTRATÉGIAS PERSONALIZADAS
</div>

<div class="box">
DEFESA G1:
CONGELADA • AJUSTE FINO •
RECONSTRUÇÃO INDEPENDENTE
</div>

<div class="title">
COMPORTAMENTO VIRTUAL ACUMULADO
</div>

${behaviorHTML(
state.g1BehaviorHistory.filter(r=>r.virtual)
)}

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

if(state.open.motors) {
$("motors").innerHTML=motorsHTML(cs);

for(const b of document.querySelectorAll(
"[data-manual]"
)) {
b.onclick=()=>{
state.manual=b.dataset.manual;

save();
render();
};
}
}

if(state.open.jumps) {
$("jumps").innerHTML=jumpsHTML();
}

if(state.open.mirrors) {
$("mirrors").innerHTML=mirrorsHTML();
}

if(state.open.timeline) {
$("timeline").innerHTML=timelineHTML();
}

for(const [id,open] of Object.entries(
state.open
)) {
const el=$(id);

if(el) {
el.classList.toggle("hide",!open);
}

const b=document.querySelector(
'[data-panel="'+id+'"]'
);

const span=b?.querySelector("span");

if(span) {
span.textContent=open?"−":"+";
}
}
}

/* ======================================================
 MIGRAÇÃO V6.3.5 -> V6.3.6

 REPROCESSA O HISTÓRICO ORIGINAL PARA
 RECONSTRUIR AS ESTATÍSTICAS VIRTUAIS,
 INCLUINDO RUPTURA E CONTINUIDADE.

 NÃO REUTILIZA RESULTADOS FUTUROS.
====================================================== */

async function initialize() {
if(
loadedFrom&&
loadedFrom!==KEY&&
loadedFrom!==BACKUP_KEY&&
state.history.length
) {
const numbers=[...state.history];
const sources=[...state.sources];

await rebuild(numbers,sources);
} else if(state.history.length) {
const numbers=[...state.history];
const sources=[...state.sources];

await rebuild(numbers,sources);
} else {
render();
}
}

/* ======================================================
 INICIALIZAÇÃO
====================================================== */

initialize();

})();
