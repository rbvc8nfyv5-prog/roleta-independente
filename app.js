(() => {
"use strict";

/*
=========================================================
                 ANÁLISE BETA V6.4.1
=========================================================

BASE: V6.4.0 / V6.3.9 FORNECIDA PELO USUÁRIO.

PRESERVADO:
- 12 motores e geometria de 28 números.
- 7 estratégias originais.
- 12 adaptativas e 4 posições AUTO.
- Estratégias personalizadas.
- Treinador Global original.
- Treinador Global Números da V6.3.9.
- Treinador Global Números 1.0.
- Treinador Global G1.
- Congelada, ajuste fino e reconstrução.
- Continuidade, deslocamento e ruptura.
- Saltos, direção, espelho e antiespelho.
- Histórico, linha do tempo e laboratório.
- Resultados manuais arquivados.
- Janela 70 + 10, respeitando o ciclo real aberto.

NOVO NA V6.4.1:
- Leitura física de trincas.
- Memória dos dois resultados anteriores.
- Três distâncias, cordas, área e ângulos.
- Retorno exato e parcial.
- Continuação e inversão com afastamento.
- Tratamento de repetições e trincas degeneradas.
- Pesos de triangulação nos 12 motores.
- Integração nas combinações dos treinadores.
- Desempenho virtual condicionado ao trajeto.
- Triangulação na seleção das defesas G1.
- Painel visual de triangulação.

A defesa CONGELADA mantém a geometria original.
Nenhuma combinação é recalculada durante seu ciclo real.

As linhas representam relações entre posições dos
resultados, não a trajetória real da bola.

Cobertura histórica não garante resultados futuros.
=========================================================
*/

const VERSION="6.4.1";
const KEY="ANALISE_BETA_V641";
const N10="NUMBER10";

const OLD_KEYS=[
"ANALISE_BETA_V640",
"ANALISE_BETA_V639",
"ANALISE_BETA_V638",
"ANALISE_BETA_V637",
"ANALISE_BETA_V636",
"ANALISE_BETA_V635",
"ANALISE_BETA_V634",
"ANALISE_BETA_V633"
];

const WINDOW=70;
const MANUAL_LIMIT=10;

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

const REGIONS={
TIERS:[27,13,36,11,30,8,23,10,5,24,16,33],
ORFAOS:[17,34,6,1,20,14,31,9],
VOISINS:[22,18,29,7,25,2,21,4,19],
ZERO:[28,12,35,3,26,0,32,15]
};

const FAMILIES=[
"NORMAL","DINAMICO","RX_NORMAL","RX_DINAMICO"
];

const RADII=[4,5,6];

const ORIGINALS=[
["FIXED","AUTO RANKING"],
["GEO","MELHOR GEOMETRIA"],
["BEST","MELHOR DESEMPENHO"],
["STABLE","ESTABILIDADE"],
["SWITCH","TROCA INTELIGENTE"],
["CONSENSUS","CONSENSO"],
["UNION","UNIÃO"]
];

const ADAPTATIVES=Array.from({length:12},(_,i)=>({
id:"A"+String(i+1).padStart(2,"0"),
name:"ADAPTATIVA "+String(i+1).padStart(2,"0"),
window:[10,10,10,20,20,20,30,30,20,30,20,30][i],
margin:[.05,.10,.15,.05,.10,.15,.05,.10,.08,.12,.10,.08][i],
maxRank:[12,12,12,12,12,12,12,12,12,6,4,8][i]
}));

const G1_MODES=[
"CONGELADA","AJUSTE FINO","RECONSTRUÇÃO"
];

const BEHAVIORS=[
"CONTINUIDADE","DESLOCAMENTO","RUPTURA"
];

const $=id=>document.getElementById(id);
const mod=n=>(n%37+37)%37;
const ix=n=>W.indexOf(n);
const avg=a=>a.length?a.reduce((s,n)=>s+n,0)/a.length:0;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const copy=x=>x==null?x:JSON.parse(JSON.stringify(x));
const fmt=n=>Number.isFinite(n)?n.toFixed(2).replace(".",","):"—";
const pct=(a,b)=>b?fmt(100*a/b)+"%":"—";

function esc(x) {
return String(x??"").replace(/[&<>"']/g,c=>({
"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));
}

function cleanNumbers(a) {
return Array.isArray(a)
?a.filter(n=>Number.isInteger(n)&&n>=0&&n<=36)
:[];
}

function neighbors(n,r) {
const p=ix(n);
if(p<0)return [];
return Array.from({length:2*r+1},(_,i)=>W[mod(p+i-r)]);
}

function distance(a,b) {
const x=ix(a),y=ix(b);
if(x<0||y<0)return 18;
const d=Math.abs(x-y);
return Math.min(d,37-d);
}

function direction(a,b) {
const x=ix(a),y=ix(b);
if(x<0||y<0)return 0;
const f=mod(y-x),r=mod(x-y);
return f<=r?f:-r;
}

function region(n) {
return Object.keys(REGIONS).find(
k=>REGIONS[k].includes(n)
)||"ZERO";
}

const MIRROR=new Set();

for(const n of [11,12,13,21,22,23,31,32,33]) {
for(const x of neighbors(n,1))MIRROR.add(x);
}

function mirror(n) {
return MIRROR.has(n)?"ESPELHO":"ANTIESPELHO";
}

/* ======================================================
 ESTADO E PERSISTÊNCIA
====================================================== */

function freshN10() {
return {
books:{},
archive:[],
pending:[],
events:[],
choice:null,
sequence:0,
viewTrigger:"CURRENT",
viewAll:false
};
}

function fresh() {
return {
history:[],
sources:[],
manualCount:0,
manualLog:[],
cyclesCompleted:0,
recalcPending:false,
migrationPending:false,

strategy:"TRAINER",
rank:3,
manual:null,
adaptive:"A05",
created:[],
activeCreated:null,

g1:true,
g1Trainer:true,
galeSkip:false,
secondHouse:false,

stake:1,
multiplier:1,

phase:"ENTRY",
cycle:null,
defense:null,
previous:null,

trainerChoice:null,
trainerTurns:0,
trainerChanges:0,
trainerPending:false,
trainerHistory:[],

numberChoice:null,
numberChanges:0,
numberHistory:[],
numberCombinations:[],
numberComparisons:[],

n10:freshN10(),

virtual:{},
entryRows:[],
g1Rows:[],
g1Pending:[],
realG1:[],
decisions:[],
ledger:[],

open:{
general:true,
trainer:true,
numbertrainer:true,
numbertrainer10:true,
triangulation:true,
g1ranking:true,
g1numbers:true,
motors:false,
jumps:false,
mirrors:false,
timeline:true,
lab:false
}
};
}

function read(key) {
try {
return JSON.parse(localStorage.getItem(key)||"null");
} catch {
return null;
}
}

function pack10(value) {
return JSON.parse(JSON.stringify(value,(key,item)=>{
if(key==="play"&&validPlay(item)) {
return {
shape10:signature10(item),
score:item.score
};
}
return item;
}));
}

function unpack10(value) {
if(!value||typeof value!=="object")return freshN10();

return JSON.parse(JSON.stringify(value),(key,item)=>{
if(item&&typeof item==="object"&&typeof item.shape10==="string") {
const blocks=item.shape10.split("|").map(part=>{
const [radius,center]=part.split(":").map(Number);
return {
center,
radius,
numbers:neighbors(center,radius)
};
});

const play={
blocks,
numbers:blocks.flatMap(b=>b.numbers),
score:item.score
};

if(!validPlay(play)) {
throw new Error("GEOMETRIA DO TREINADOR 1.0 INVÁLIDA.");
}

return play;
}

return item;
});
}

let state=fresh();
let busy=false;
let saveError="";
let legacyData=null;

const saved=read(KEY);

function normalizeState(data) {
const result={
...fresh(),
...data,
open:{...fresh().open,...(data.open||{})}
};

result.history=cleanNumbers(result.history).slice(-100);
result.manualCount=Math.max(0,Number(result.manualCount)||0);

for(const name of [
"manualLog","sources","created","trainerHistory",
"numberHistory","numberCombinations","numberComparisons",
"entryRows","g1Rows","g1Pending","realG1","decisions","ledger"
]) {
if(!Array.isArray(result[name]))result[name]=[];
}

if(!result.virtual||typeof result.virtual!=="object") {
result.virtual={};
}

try {
result.n10={
...freshN10(),
...unpack10(data.n10)
};

if(!result.n10.books||typeof result.n10.books!=="object") {
result.n10.books={};
}

for(const name of ["archive","pending","events"]) {
if(!Array.isArray(result.n10[name]))result.n10[name]=[];
}

} catch(e) {
result.n10=freshN10();
saveError=String(e.message||e);
}

return result;
}

if(saved&&Array.isArray(saved.history)) {
state=normalizeState(saved);
} else {
for(const key of OLD_KEYS) {
const data=read(key);

if(data?.history?.length) {
legacyData=data;
break;
}
}
}

function save() {
try {
const data={
...state,
n10:pack10(state.n10),
numberCombinations:state.numberCombinations.slice(-100),
numberComparisons:state.numberComparisons.slice(-300),
numberHistory:state.numberHistory.slice(-300),
entryRows:state.entryRows.slice(-4000),
g1Rows:state.g1Rows.slice(-5000),
ledger:state.ledger.slice(-300),
realG1:state.realG1.slice(-300),
decisions:state.decisions.slice(-300),
trainerHistory:state.trainerHistory.slice(-300)
};

localStorage.setItem(KEY,JSON.stringify(data));
saveError="";
return true;

} catch(e) {
saveError=String(e.message||e);
return false;
}
}

function settings() {
return {
strategy:state.strategy,
rank:state.rank,
manual:state.manual,
adaptive:state.adaptive,
created:copy(state.created),
activeCreated:state.activeCreated,
g1:state.g1,
g1Trainer:state.g1Trainer,
galeSkip:state.galeSkip,
secondHouse:state.secondHouse,
stake:state.stake,
multiplier:state.multiplier,
open:copy(state.open)
};
}

/* ======================================================
 GEOMETRIA ORIGINAL DE 28 NÚMEROS
====================================================== */

const FIVE=W.map(n=>({
center:n,
radius:2,
numbers:neighbors(n,2)
}));

const THREE=W.map(n=>({
center:n,
radius:1,
numbers:neighbors(n,1)
}));

for(const b of [...FIVE,...THREE]) {
b.mask=b.numbers.reduce(
(s,n)=>s|(1n<<BigInt(ix(n))),0n
);
}

function geometry(weights,mandatory=[]) {
const scoreBlock=b=>({
...b,
value:b.numbers.reduce(
(s,n)=>s+(weights[ix(n)]||0),0
)
});

const fives=FIVE.map(scoreBlock)
.sort((a,b)=>b.value-a.value);

const threes=THREE.map(scoreBlock)
.filter(b=>mandatory.every(n=>b.numbers.includes(n)))
.sort((a,b)=>b.value-a.value);

let best=null;

for(const small of threes) {
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
beam=[];

const seen=new Set();

for(const item of next) {
const key=String(item.mask);
if(seen.has(key))continue;

seen.add(key);
beam.push(item);

if(beam.length>=6)break;
}

if(!beam.length)break;
}

for(const item of beam) {
if(item.blocks.length!==6)continue;

if(!best||item.score>best.score)best=item;
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
blocks,
numbers,
score:best.score
};
}

function validPlay(play) {
return !!play&&
Array.isArray(play.numbers)&&
play.numbers.length===28&&
new Set(play.numbers).size===28&&
Array.isArray(play.blocks)&&
play.blocks.length===6&&
play.blocks.filter(b=>b.radius===2).length===5&&
play.blocks.filter(b=>b.radius===1).length===1;
}

function missing(play) {
if(!validPlay(play))return [...W];

const set=new Set(play.numbers);
return W.filter(n=>!set.has(n));
}

/* ======================================================
 TRIANGULAÇÃO V6.4.1

O histórico fornecido contém somente resultados conhecidos.
Os pesos não consultam o próximo resultado.

Convenção:
+ segue W.
- segue W no sentido inverso.
Sempre é usado o menor salto entre duas posições.

Ângulos e áreas utilizam uma circunferência de raio 1.
====================================================== */

const triangleCache=new Map();

function pointTriangle(n) {
const a=2*Math.PI*ix(n)/37;

return {
x:Math.sin(a),
y:Math.cos(a)
};
}

function angleTriangle(a,b,c) {
const u={
x:a.x-b.x,
y:a.y-b.y
};

const v={
x:c.x-b.x,
y:c.y-b.y
};

const d=
Math.hypot(u.x,u.y)*
Math.hypot(v.x,v.y);

if(d<1e-12)return null;

return Math.acos(
clamp((u.x*v.x+u.y*v.y)/d,-1,1)
)*180/Math.PI;
}

function triangleFeatures(a,b,c) {
const s1=direction(a,b);
const s2=direction(b,c);
const closure=distance(a,c);

const p=pointTriangle(a);
const q=pointTriangle(b);
const r=pointTriangle(c);

const area=Math.abs(
(q.x-p.x)*(r.y-p.y)-
(q.y-p.y)*(r.x-p.x)
)/2;

let type="MUDANÇA DE SETOR";

if(a===b&&b===c) {
type="REPETIÇÃO";

} else if(a===c) {
type="RETORNO EXATO";

} else if(b===c) {
type="REPETIÇÃO FINAL";

} else if(!s1) {
type="SAÍDA DA REPETIÇÃO";

} else if(Math.sign(s1)===Math.sign(s2)) {
type="CONTINUAÇÃO";

} else if(closure<Math.abs(s1)) {
type="RETORNO PARCIAL";

} else {
type="INVERSÃO COM AFASTAMENTO";
}

return {
a,b,c,
s1,s2,
closure,
area,
type,

chords:[
Math.hypot(p.x-q.x,p.y-q.y),
Math.hypot(q.x-r.x,q.y-r.y),
Math.hypot(p.x-r.x,p.y-r.y)
],

angles:[
angleTriangle(q,p,r),
angleTriangle(p,q,r),
angleTriangle(p,r,q)
],

degenerate:area<1e-10
};
}

function triangleContext(h) {
if(h.length<3)return "SEM TRINCA";

const f=triangleFeatures(...h.slice(-3));

return f.type+"|"+
Math.sign(f.s2)+"|"+
Math.floor(Math.abs(f.s2)/4);
}

function triangleAnalysis(h) {
const key=h.join(",");

if(triangleCache.has(key)) {
return triangleCache.get(key);
}

const triples=[];

for(let i=0;i+2<h.length;i++) {
triples.push({
...triangleFeatures(h[i],h[i+1],h[i+2]),
turn:i+3
});
}

const weights=Array(37).fill(1);
const counts={};
const last=triples.at(-1)||null;

for(const t of triples) {
counts[t.type]=(counts[t.type]||0)+1;
}

let matches=0;
let exactPairs=0;

if(h.length>=2) {
const a=h.at(-2);
const b=h.at(-1);
const jump=direction(a,b);

const candidates=W.map(
n=>triangleFeatures(a,b,n)
);

for(const t of triples) {
const signMatch=
Math.sign(t.s1)===Math.sign(jump);

const hopSimilarity=
Math.exp(-Math.abs(t.s1-jump)/4)*
(signMatch?1:.2);

const physicalContext=Math.exp(
-(distance(a,t.a)+distance(b,t.b))/10
);

const recency=Math.exp(
-(h.length-t.turn)/30
);

const exact=t.a===a&&t.b===b;

if(exact)exactPairs++;
if(hopSimilarity>.3)matches++;

for(let j=0;j<37;j++) {
const f=candidates[j];

const second=Math.exp(
-Math.abs(f.s2-t.s2)/3.5
);

const close=Math.exp(
-Math.abs(f.closure-t.closure)/4
);

const area=Math.exp(
-Math.abs(f.area-t.area)*2
);

const angle=
f.angles[1]==null||t.angles[1]==null
?(f.degenerate===t.degenerate?1:.2)
:Math.exp(
-Math.abs(f.angles[1]-t.angles[1])/30
);

const shape=f.type===t.type?1:.15;

weights[j]+=
recency*
(hopSimilarity*.7+physicalContext*.3)*
(
second*.40+
close*.20+
area*.10+
angle*.10+
shape*.20
);

if(exact) {
weights[j]+=
recency*2*
Math.exp(-distance(W[j],t.c)/1.8);
}
}
}
}

const mean=avg(weights)||1;

const result={
triples,
last,
weights:weights.map(x=>x/mean),
counts,
matches,
exactPairs,
context:triangleContext(h),
samples:triples.length
};

triangleCache.set(key,result);

if(triangleCache.size>120) {
triangleCache.delete(
triangleCache.keys().next().value
);
}

return result;
}

function applyTriangle(weights,h,strength=.28) {
const analysis=triangleAnalysis(h);

if(!analysis.samples)return weights;

const scale=avg(
weights.map(x=>Math.max(0,x))
)||1;

const reliability=Math.min(
1,analysis.samples/20
);

for(let j=0;j<37;j++) {
weights[j]=Math.max(
.001,
weights[j]+
scale*strength*reliability*
clamp(analysis.weights[j]-1,-.75,2)
);
}

return weights;
}

function triangleCoverage(play,h) {
if(!validPlay(play))return 0;

const weights=triangleAnalysis(h).weights;

return play.numbers.reduce(
(s,n)=>s+weights[ix(n)],0
)/weights.reduce((s,v)=>s+v,0);
}

function triangleContextMetrics(rows,h) {
const context=triangleContext(h);

const selected=rows.filter(
r=>r.triangleKey===context
);

const hits=selected.filter(
r=>r.result!=="LOSS"
).length;

return {
context,
total:selected.length,
hits,
loss:selected.length-hits,
score:
(hits+(28/37)*8)/
(selected.length+8)
};
}

/* ======================================================
 ANÁLISE SEQUENCIAL ORIGINAL
====================================================== */

function analyze(h) {
const transitions=[];

for(let i=Math.max(1,h.length-45);i<h.length;i++) {
const a=h[i-1];
const b=h[i];
const pd=direction(a,b);

transitions.push({
from:a,
to:b,
numeric:b-a,
physical:pd,
distance:Math.abs(pd),
mirrorFrom:mirror(a),
mirrorTo:mirror(b)
});
}

const last6=transitions.slice(-6);

function streak(field) {
const sign=Math.sign(
transitions.at(-1)?.[field]||0
);

let length=0;

if(sign) {
for(let i=transitions.length-1;i>=0;i--) {
if(Math.sign(transitions[i][field])!==sign)break;
length++;
}
}

return {dir:sign,length};
}

const regions={};

for(const name of Object.keys(REGIONS)) {
let absence=0;

for(let i=h.length-1;i>=0;i--) {
if(region(h[i])===name)break;
absence++;
}

regions[name]={
absence,
recent:h.slice(-12).filter(
n=>region(n)===name
).length
};
}

const last3=transitions.slice(-3);
const prev3=transitions.slice(-6,-3);

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
regions
};
}

/* ======================================================
 12 MOTORES + TRIANGULAÇÃO
====================================================== */

function weightsFor(h,family,radius) {
const weights=Array(37).fill(.01);
const recent=h.slice(-60);

for(let k=0;k<recent.length;k++) {
const p=ix(recent[recent.length-1-k]);
const decay=Math.exp(-k/(radius*2.3));

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(p-j),37-Math.abs(p-j)
);

if(d<=6)weights[j]+=decay*(7-d)/7;
}
}

if(family.includes("DINAMICO")) {
for(let k=0;k<Math.min(radius+2,h.length);k++) {
const p=ix(h[h.length-1-k]);

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(p-j),37-Math.abs(p-j)
);

if(d<=3)weights[j]+=(4-d)/(k+2)*1.7;
}
}
}

if(family.startsWith("RX")) {
const len=Math.min(radius,h.length-2);
const matches=[];

if(len>=2) {
for(let i=0;i+len<h.length-1;i++) {
let score=0;

for(let j=0;j<len;j++) {
score+=Math.max(
0,
6-distance(
h[h.length-len+j],
h[i+j]
)
)/6;
}

matches.push({
score:score/len,
next:h[i+len]
});
}

matches.sort((a,b)=>b.score-a.score);

for(const match of matches.slice(0,12)) {
const p=ix(match.next);

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(p-j),37-Math.abs(p-j)
);

if(d<=3) {
weights[j]+=(4-d)*match.score*.45;
}
}
}
}
}

if(h.length>=3) {
const a=analyze(h);
const last=h.at(-1);

const numericBias=
a.last6.filter(x=>x.numeric>0).length-
a.last6.filter(x=>x.numeric<0).length;

const physicalBias=
a.last6.filter(x=>x.physical>0).length-
a.last6.filter(x=>x.physical<0).length;

const expected=clamp(
Math.round(
avg(a.last6.map(x=>x.distance))
),1,18
);

for(const n of W) {
const pd=direction(last,n);
const d=Math.abs(pd);
let bonus=0;

if(
numericBias&&
Math.sign(n-last)===Math.sign(numericBias)
)bonus+=.10;

if(
physicalBias&&
Math.sign(pd)===Math.sign(physicalBias)
)bonus+=.12;

if(Math.abs(d-expected)<=2)bonus+=.09;

if(
a.numericStreak.length>=2&&
Math.sign(n-last)===a.numericStreak.dir
)bonus+=.07;

if(
a.physicalStreak.length>=2&&
Math.sign(pd)===a.physicalStreak.dir
)bonus+=.07;

if(a.acceleration>=3&&d>=10)bonus+=.07;
if(a.acceleration<=-3&&d<=5)bonus+=.07;

weights[ix(n)]+=bonus*radius/5;
}
}

/*
Todos os 12 motores recebem a camada de triangulação.
As diferenças originais de família e raio permanecem.
*/

return applyTriangle(
weights,
h,
.24+(radius-4)*.035+
(family.startsWith("RX")?.035:0)
);
}

function motors(h) {
if(h.length<8)return [];

const result=[];

for(const family of FAMILIES) {
for(const radius of RADII) {
if(
family.startsWith("RX")&&
h.length<radius*2+4
)continue;

const play=geometry(
weightsFor(h,family,radius)
);

if(!validPlay(play))continue;

result.push({
key:family+"_"+radius,
family,
radius,
score:play.score,
triangleScore:triangleCoverage(play,h),
triangleKey:triangleContext(h),
play
});
}
}

result.sort((a,b)=>b.score-a.score);
result.forEach((m,i)=>{m.rank=i+1;});

return result;
}

/* ======================================================
 TREINADOR GLOBAL NÚMEROS — BASE V6.3.9

Mantém comparação numérica das combinações históricas.
A triangulação participa da geração e da classificação.
Não utiliza GREEN/LOSS como critério deste treinador.
====================================================== */

function generateNumberCombination(h) {
if(h.length<8)return null;

const trigger=h.at(-1);
const weights=Array(37).fill(.02);
const recent=h.slice(-60);

for(let k=0;k<recent.length;k++) {
const number=recent[recent.length-1-k];
const p=ix(number);
const decay=Math.exp(-k/18);

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(p-j),37-Math.abs(p-j)
);

if(d<=5)weights[j]+=decay*(6-d)/6;
}
}

if(h.length>=2) {
const previous=h.at(-2);
const step=direction(previous,trigger);
const expected=mod(ix(trigger)+step);

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(expected-j),
37-Math.abs(expected-j)
);

if(d<=4)weights[j]+=(5-d)*.14;
}
}

for(let i=0;i<h.length-1;i++) {
if(h[i]!==trigger)continue;

const next=h[i+1];
const p=ix(next);
const age=h.length-1-i;
const decay=Math.exp(-age/28);

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(p-j),37-Math.abs(p-j)
);

if(d<=3) {
weights[j]+=decay*(4-d)/4*.9;
}
}
}

applyTriangle(weights,h,.30);

const play=geometry(weights);
if(!validPlay(play))return null;

return {
key:"NUMERO_GERADO_"+trigger,
name:"COMBINAÇÃO DO "+trigger,
trigger,
score:play.score,
triangleScore:triangleCoverage(play,h),
play
};
}

function registerNumberCombination(h,turn) {
const generated=generateNumberCombination(h);
if(!generated)return;

state.numberCombinations.push({
id:"NC_"+turn,
turn,
origin:generated.trigger,
motor:generated.key,
play:copy(generated.play),
centers:generated.play.blocks.map(b=>b.center),
covered:[...generated.play.numbers],
triangleKey:triangleContext(h)
});

if(state.numberCombinations.length>100) {
state.numberCombinations=
state.numberCombinations.slice(-100);
}
}

function numberTransitions(h,trigger) {
const rows=[];

for(let i=0;i<h.length-1;i++) {
if(h[i]!==trigger)continue;

rows.push({
next:h[i+1],
age:h.length-1-i,
turn:i+2,
triggerTurn:i+1
});
}

return rows;
}

function compareNumberCombination(record,trigger,h) {
const transitions=numberTransitions(h,trigger);
const covered=new Set(record.covered);

let matches=0;
let weightedMatches=0;
let totalWeight=0;

const matchedNumbers=[];
const missedNumbers=[];

for(const t of transitions) {
const hit=covered.has(t.next);
const weight=Math.exp(-t.age/35);

totalWeight+=weight;

if(hit) {
matches++;
weightedMatches+=weight;
matchedNumbers.push(t.next);
} else {
missedNumbers.push(t.next);
}
}

const total=transitions.length;
const base=28/37;

const historical=(matches+base*3)/(total+3);
const recent=(weightedMatches+base*2)/(totalWeight+2);

const numericalScore=
historical*.65+recent*.35;

const triangleScore=
triangleCoverage(record.play,h);

const score=
numericalScore*.80+
triangleScore*.20;

return {
...record,
trigger,
total,
matches,
misses:total-matches,
weightedMatches,
numericalScore,
triangleScore,
score,
matchedNumbers,
missedNumbers
};
}

function rankNumberCombinations(h,trigger=h.at(-1)) {
if(trigger==null)return [];

return state.numberCombinations
.filter(r=>validPlay(r.play))
.map(record=>
compareNumberCombination(record,trigger,h)
)
.sort((a,b)=>
b.score-a.score||
b.matches-a.matches||
b.turn-a.turn
);
}

function bestNumberCombination(h) {
if(h.length<8)return null;

const trigger=h.at(-1);
const best=rankNumberCombinations(h,trigger)[0];

if(!best)return null;

return {
key:"NUM_T"+best.turn+"_N"+best.origin,
name:"COMBINAÇÃO DO "+best.origin,
rank:0,
score:best.score,
triangleScore:best.triangleScore,
sourceNumber:best.origin,
sourceTurn:best.turn,
trigger,
matches:best.matches,
tests:best.total,
play:copy(best.play),
type:"NUMBER"
};
}

function updateNumberChoice() {
if(state.history.length<8) {
state.numberChoice=null;
return null;
}

const selected=bestNumberCombination(state.history);

if(!selected) {
state.numberChoice=null;
return null;
}

const old=state.numberChoice;

if(
old&&(
old.sourceTurn!==selected.sourceTurn||
old.trigger!==selected.trigger
)
)state.numberChanges++;

state.numberChoice={
trigger:selected.trigger,
sourceNumber:selected.sourceNumber,
sourceTurn:selected.sourceTurn,
motor:selected.key,
score:selected.score,
triangleScore:selected.triangleScore,
matches:selected.matches,
tests:selected.tests,
play:copy(selected.play)
};

return selected;
}

function recordNumberComparison(before,n,turn) {
const trigger=before.at(-1);
if(trigger==null)return;

const selected=bestNumberCombination(before);
if(!selected)return;

state.numberComparisons.push({
turn,
trigger,
sourceNumber:selected.sourceNumber,
sourceTurn:selected.sourceTurn,
next:n,
covered:selected.play.numbers.includes(n),
centers:selected.play.blocks.map(b=>b.center),
triangleKey:triangleContext(before)
});

if(state.numberComparisons.length>300) {
state.numberComparisons=
state.numberComparisons.slice(-300);
}
}

/* ======================================================
 ESTRATÉGIAS ORIGINAIS E CONTEXTO DE TRIANGULAÇÃO
====================================================== */

function definitions() {
return [
...ORIGINALS.map(([rule,name])=>({
id:"ORIGINAL:"+rule,
name,
rule,
type:"ORIGINAL"
})),

...Array.from({length:4},(_,i)=>({
id:"RANK:"+(i+1),
name:"AUTO "+(i+1)+"º",
rank:i+1,
type:"RANK"
})),

...ADAPTATIVES.map(config=>({
id:"ADAPTIVE:"+config.id,
name:config.name,
config,
type:"ADAPTIVE"
})),

...state.created.map(c=>({
id:"CREATED:"+c.id,
name:c.name,
config:c.config,
type:"CREATED"
}))
];
}

function motorRate(key,limit=12) {
const available=state.ledger.filter(
r=>r.motorHits&&key in r.motorHits
);

const rows=available.slice(-limit);

if(!rows.length)return .5;

const global=
rows.filter(r=>r.motorHits[key]).length/
rows.length;

const context=triangleContext(state.history);

const conditional=available
.slice(-70)
.filter(r=>r.triangleKey===context);

if(!conditional.length)return global;

const hits=conditional.filter(
r=>r.motorHits[key]
).length;

const local=
(hits+(28/37)*8)/
(conditional.length+8);

const weight=
.35*conditional.length/
(conditional.length+8);

return global*(1-weight)+local*weight;
}

function chooseMotor(def,cs,previous) {
if(!cs.length)return null;

const fixed=cs[
clamp(state.rank-1,0,cs.length-1)
];

if(def.rank) {
return cs[clamp(def.rank-1,0,cs.length-1)];
}

if(def.config) {
const c=def.config;

const ranked=cs
.filter(m=>m.rank<=c.maxRank)
.map(m=>({
motor:m,
score:
motorRate(m.key,3)*.55+
motorRate(m.key,c.window)*.45
}))
.sort((a,b)=>
b.score-a.score||
a.motor.rank-b.motor.rank
);

const best=ranked[0];
const old=ranked.find(
x=>x.motor.key===previous
);

if(
old&&best&&
best.score<old.score+c.margin
)return old.motor;

return best?.motor||fixed;
}

if(def.rule==="GEO")return cs[0];

if(def.rule==="BEST") {
return [...cs].sort((a,b)=>
motorRate(b.key,20)-motorRate(a.key,20)
)[0];
}

if(def.rule==="STABLE") {
return cs.find(
m=>m.key===previous&&m.rank<=5
)||fixed;
}

if(def.rule==="SWITCH") {
const old=cs.find(
m=>m.key===previous
)||fixed;

const best=[...cs].sort((a,b)=>
motorRate(b.key,12)-motorRate(a.key,12)
)[0];

return motorRate(best.key,12)>
motorRate(old.key,12)+.12
?best:old;
}

if(["CONSENSUS","UNION"].includes(def.rule)) {
const weights=Array(37).fill(0);

const selected=def.rule==="UNION"
?cs.slice(0,3):cs;

for(const m of selected) {
for(const n of m.play.numbers) {
weights[ix(n)]+=1/(1+m.rank*.1);
}
}

applyTriangle(weights,state.history,.20);

const play=geometry(weights);

if(play)return {
key:def.rule,
rank:0,
score:play.score,
triangleScore:triangleCoverage(play,state.history),
triangleKey:triangleContext(state.history),
play
};
}

return fixed;
}

/* ======================================================
 DEFESAS G1
====================================================== */

function fineG1(original,trigger,h=state.history) {
if(!validPlay(original?.play))return null;

const weights=Array(37).fill(.01);
const mandatory=neighbors(trigger,1);

for(const n of original.play.numbers) {
weights[ix(n)]+=100;
}

/*
A triangulação é aplicada antes do reforço obrigatório.
Os três números do ajuste fino continuam obrigatórios.
*/

applyTriangle(weights,h,.16);

for(const n of mandatory) {
weights[ix(n)]+=100000;
}

const play=geometry(weights,mandatory);

return play
?{
key:original.key,
rank:original.rank,
play,
triangleScore:triangleCoverage(play,h)
}
:copy(original);
}

function g1History(strategy=null,mode=null,limit=400) {
return state.g1Rows.filter(r=>
(strategy==null||r.strategy===strategy)&&
(mode==null||r.mode===mode)
).slice(-limit);
}

function uniqueGales(strategy=null,limit=100) {
const rows=g1History(strategy,null,5000);
const map=new Map();

for(const r of rows) {
const key=r.strategy+"|"+r.eventId;
if(!map.has(key))map.set(key,r);
}

return [...map.values()].slice(-limit);
}

function numberG1Rows(strategy,trigger,mode=null,limit=200) {
return state.g1Rows.filter(r=>
r.strategy===strategy&&
r.trigger===trigger&&
(mode==null||r.mode===mode)
).slice(-limit);
}

function numberG1Metrics(strategy,trigger,mode,limit=100) {
const rows=numberG1Rows(strategy,trigger,mode,limit);
const hits=rows.filter(r=>r.hit).length;

return {
total:rows.length,
hits,
loss:rows.length-hits,
rate:rows.length?hits/rows.length:null
};
}

function numberG1Events(strategy,trigger,limit=100) {
const rows=numberG1Rows(
strategy,trigger,null,1000
);

const map=new Map();

for(const row of rows) {
if(!map.has(row.eventId)) {
map.set(row.eventId,row);
}
}

return [...map.values()].slice(-limit);
}

/* ======================================================
 CONTINUIDADE / DESLOCAMENTO / RUPTURA
====================================================== */

function behaviorReading(original,h,strategy,trigger=null) {
const rows=uniqueGales(strategy,45);
const recent=rows.slice(-12);
const last6=rows.slice(-6);

const loss12=recent.filter(r=>!r.hit).length;
const loss6=last6.filter(r=>!r.hit).length;

const uncovered=new Set(missing(original.play));

const outside6=h.slice(-6)
.filter(n=>uncovered.has(n)).length;

let streak=0;

for(let i=rows.length-1;i>=0;i--) {
if(rows[i].hit)break;
streak++;
}

const numberRows=trigger==null
?[]:numberG1Events(strategy,trigger,20);

const numberRecent=numberRows.slice(-8);
const numberLoss=numberRecent.filter(r=>!r.hit).length;

let type="CONTINUIDADE";

if(
streak>=3||
(last6.length>=5&&loss6/last6.length>=.60)||
(h.length>=6&&outside6>=4)||
(numberRecent.length>=4&&numberLoss/numberRecent.length>=.60)
) {
type="RUPTURA";

} else if(
(recent.length>=5&&loss12/recent.length>=.32)||
outside6>=2||
(numberRecent.length>=3&&numberLoss/numberRecent.length>=.34)
) {
type="DESLOCAMENTO";
}

return {
type,
streak,
outside6,
loss12,
total12:recent.length,
loss6,
total6:last6.length,
numberTotal:numberRecent.length,
numberLoss,
numberHit:numberRecent.length-numberLoss,
triangle:triangleAnalysis(h).last?.type||"SEM TRINCA"
};
}

/* ======================================================
 RECONSTRUÇÃO INDEPENDENTE + TRIANGULAÇÃO
====================================================== */

function reconstructG1(original,trigger,h,strategy) {
if(!validPlay(original?.play))return null;

const reading=behaviorReading(
original,h,strategy,trigger
);

const weights=Array(37).fill(.1);
const recent=h.slice(-60);
const gales=g1History(strategy,null,180);
const transitions=numberTransitions(h,trigger);

for(const n of W) {
const f60=recent.filter(x=>x===n).length;
const f24=h.slice(-24).filter(x=>x===n).length;
const f8=h.slice(-8).filter(x=>x===n).length;

const losses=gales.filter(
r=>!r.hit&&r.outcome===n
).length;

const conditional=transitions.reduce(
(s,t)=>s+(
t.next===n?Math.exp(-t.age/35):0
),0
);

let value=
f60*.30+
f24*.55+
f8*.85+
losses*.35+
conditional*2.2;

if(reading.type==="DESLOCAMENTO") {
value+=f8*.35+conditional*.35;
}

if(reading.type==="RUPTURA") {
value+=f8*.60+losses*.45+conditional*.65;
}

weights[ix(n)]+=value;
}

for(let k=0;k<recent.length;k++) {
const p=ix(recent[recent.length-1-k]);

const decay=Math.exp(
-k/(reading.type==="RUPTURA"?8:14)
);

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(p-j),37-Math.abs(p-j)
);

if(d<=3) {
weights[j]+=decay*(4-d)/4*.65;
}
}
}

for(const n of neighbors(trigger,2)) {
weights[ix(n)]+=.4;
}

applyTriangle(weights,h,.35);

const play=geometry(weights);
if(!validPlay(play))return null;

return {
key:"G1_INDEPENDENTE",
rank:0,
play,
behavior:reading.type,
triangleScore:triangleCoverage(play,h)
};
}

function defenses(original,trigger,h,strategy) {
if(!validPlay(original?.play))return [];

const reading=behaviorReading(
original,h,strategy,trigger
);

const recon=reconstructG1(
original,trigger,h,strategy
);

return [
{
mode:"CONGELADA",
motor:copy(original),
behavior:reading.type
},
{
mode:"AJUSTE FINO",
motor:fineG1(original,trigger,h),
behavior:reading.type
},
...(recon?[{
mode:"RECONSTRUÇÃO",
motor:recon,
behavior:reading.type
}]:[])
];
}

function defenseMetrics(strategy,mode,limit=100) {
const rows=g1History(strategy,mode,limit);
const hits=rows.filter(r=>r.hit).length;

return {
total:rows.length,
hits,
loss:rows.length-hits,
rate:rows.length?hits/rows.length:null
};
}

function rankDefenses(options,strategy,h,trigger=null) {
return options.map(option=>{
const rows=g1History(strategy,option.mode,100);
const recent=rows.slice(-12);

const hits=rows.filter(r=>r.hit).length;
const hits12=recent.filter(r=>r.hit).length;
const base=28/37;

const historical=(hits+base*12)/(rows.length+12);
const short=(hits12+base*8)/(recent.length+8);

const coverage=h.length
?h.slice(-18).filter(
n=>option.motor.play.numbers.includes(n)
).length/Math.min(18,h.length)
:base;

const byNumber=trigger==null
?{total:0,hits:0,loss:0}
:numberG1Metrics(strategy,trigger,option.mode,100);

const conditional=
(byNumber.hits+base*8)/
(byNumber.total+8);

let bonus=0;

if(
option.behavior==="CONTINUIDADE"&&
option.mode==="CONGELADA"
)bonus=.012;

if(
option.behavior==="DESLOCAMENTO"&&
option.mode==="AJUSTE FINO"
)bonus=.010;

if(
option.behavior==="RUPTURA"&&
option.mode==="RECONSTRUÇÃO"
)bonus=.020;

const numberWeight=trigger==null
?0:Math.min(.48,byNumber.total/(byNumber.total+8));

const globalScore=
historical*.55+
short*.25+
coverage*.20;

const originalScore=
globalScore*(1-numberWeight)+
conditional*numberWeight+
bonus;

const triangleScore=
triangleCoverage(option.motor.play,h);

const context=triangleContext(h);

const contextRows=rows.filter(
r=>r.triangleKey===context
);

const contextHits=contextRows.filter(
r=>r.hit
).length;

const contextScore=
(contextHits+base*8)/
(contextRows.length+8);

const contextWeight=
.15*contextRows.length/
(contextRows.length+8);

const combined=
originalScore*.85+
triangleScore*.15;

const score=
combined*(1-contextWeight)+
contextScore*contextWeight;

return {
...option,
score,
triangleScore,
contextTotal:contextRows.length,
total:rows.length,
hits,
loss:rows.length-hits,
numberTotal:byNumber.total,
numberHits:byNumber.hits,
numberLoss:byNumber.loss,
numberScore:conditional,
uncovered:missing(option.motor.play)
};
}).sort((a,b)=>
b.score-a.score||
b.numberTotal-a.numberTotal
);
}

function chooseG1(original,trigger,h,strategy) {
const ranked=rankDefenses(
defenses(original,trigger,h,strategy),
strategy,h,trigger
);

if(!ranked.length)return null;

let chosen=ranked[0];

const frozen=ranked.find(
x=>x.mode==="CONGELADA"
);

if(
frozen&&chosen!==frozen&&
chosen.total<8&&chosen.numberTotal<4&&
chosen.score-frozen.score<.025
)chosen=frozen;

return {
motor:copy(chosen.motor),
mode:chosen.mode,
behavior:chosen.behavior,
score:chosen.score,
triangleScore:chosen.triangleScore,
triangleKey:triangleContext(h),
numberTotal:chosen.numberTotal,
numberHits:chosen.numberHits,
numberLoss:chosen.numberLoss,
uncovered:chosen.uncovered,

alternatives:ranked.map(x=>({
mode:x.mode,
score:x.score,
triangleScore:x.triangleScore,
contextTotal:x.contextTotal,
total:x.total,
hits:x.hits,
loss:x.loss,
numberTotal:x.numberTotal,
numberHits:x.numberHits,
numberLoss:x.numberLoss
}))
};
}

/* ======================================================
 TREINADOR GLOBAL NÚMEROS 1.0
====================================================== */

function signature10(play) {
return play.blocks
.map(b=>b.radius+":"+b.center)
.sort()
.join("|");
}

function book10(trigger) {
return state.n10.books[trigger]||
(state.n10.books[trigger]={records:{}});
}

function register10(trigger,motor,turn) {
if(!validPlay(motor?.play))return null;

const id=signature10(motor.play);
const book=book10(trigger);

return book.records[id]||(book.records[id]={
id,
trigger,
motor:copy(motor),
created:turn,
status:"TESTING",
green:0,
g1:0,
loss:0,
vg:0,
vg1:0,
vl:0,
last:0,
lastResult:null
});
}

function archive10(cs,h) {
const turn=h.length;
const origin=h.at(-1);

const seen=new Set(
state.n10.archive.map(r=>r.turn+"@"+r.id)
);

const generated=state.numberCombinations.find(
r=>r.turn===turn
);

const candidates=[
...cs,
...(generated?[{
key:generated.motor,
rank:0,
play:generated.play
}]:[])
];

for(const motor of candidates) {
if(!validPlay(motor.play))continue;

const id=signature10(motor.play);
const key=turn+"@"+id;

if(seen.has(key))continue;
seen.add(key);

state.n10.archive.push({
id,
turn,
origin,
motor:copy(motor)
});
}

state.n10.archive=state.n10.archive.slice(-1600);
}

function scoreRecord10(record,h) {
const base=28/37;

const forward=
(record.green+record.g1+base*8)/
(record.green+record.g1+record.loss+8);

const virtual=
(record.vg+record.vg1+base*8)/
(record.vg+record.vg1+record.vl+8);

const context=triangleContext(h);

const events=state.n10.events.filter(e=>
e.kind==="FORWARD"&&
e.trigger===record.trigger&&
e.recordId===record.id&&
e.triangleKey===context
).slice(-30);

const hits=events.filter(
e=>e.result!=="LOSS"
).length;

const contextual=
(hits+base*8)/
(events.length+8);

const triangle=triangleCoverage(record.motor.play,h);

return forward*.50+
virtual*.15+
triangle*.25+
contextual*.10;
}

function select10(h,cs) {
if(h.length<8)return null;

const trigger=h.at(-1);
const records=Object.values(book10(trigger).records);

const approved=records
.filter(r=>r.status==="APPROVED")
.sort((a,b)=>
scoreRecord10(b,h)-scoreRecord10(a,h)||
b.last-a.last
);

let selected=approved[0];

if(!selected) {
selected=records
.filter(r=>
r.status!=="REJECTED"&&
r.vg+r.vg1>0
)
.sort((a,b)=>
scoreRecord10(b,h)-scoreRecord10(a,h)||
b.last-a.last
)[0];
}

if(!selected) {
const primary=chooseMotor(
{rule:"FIXED"},cs,null
);

const candidates=[
primary,
...cs,
...state.n10.archive.slice()
.reverse().map(r=>r.motor)
].filter(Boolean);

for(const motor of candidates) {
const record=register10(
trigger,motor,h.length
);

if(record&&record.status!=="REJECTED") {
selected=record;
break;
}
}
}

if(!selected)return null;

return {
...copy(selected.motor),
key:"N10_"+trigger+"_"+selected.id,
trigger,
recordId:selected.id,
type:N10,
status:selected.status,
lastResult:selected.lastResult,
triangleScore:triangleCoverage(selected.motor.play,h),
triangleKey:triangleContext(h)
};
}

function prepare10(h,cs=motors(h)) {
if(h.length<8) {
state.n10.choice=null;
return null;
}

archive10(cs,h);
state.n10.choice=select10(h,cs);

return state.n10.choice;
}

function choice10() {
const selected=state.n10.choice;

if(
!selected||
selected.trigger!==state.history.at(-1)
)return null;

const record=book10(selected.trigger)
.records[selected.recordId];

return record?.status==="REJECTED"
?null:copy(selected);
}

function config10() {
return {
g1:state.g1,
g1Trainer:state.g1Trainer,
galeSkip:state.galeSkip,
secondHouse:state.secondHouse
};
}

function defense10(motor,n,h,config,cutoff=null) {
const rows=state.g1Rows;

if(cutoff!=null) {
state.g1Rows=rows.filter(r=>r.turn<cutoff);
}

try {
return config.g1Trainer
?chooseG1(motor,n,h,N10)
:{
motor:config.g1?fineG1(motor,n,h):copy(motor),
mode:config.g1?"AJUSTE FINO":"CONGELADA",
behavior:behaviorReading(motor,h,N10,n).type,
triangleKey:triangleContext(h)
};

} finally {
state.g1Rows=rows;
}
}

function options10(motor,n,h,cutoff) {
const rows=state.g1Rows;

state.g1Rows=rows.filter(r=>r.turn<cutoff);

try {
return defenses(motor,n,h,N10);

} finally {
state.g1Rows=rows;
}
}

function begin10(before,turn,source,cs) {
const selected=prepare10(before,cs);
if(!selected)return;

const actual=
source==="TEMPO REAL"&&
state.strategy===N10&&
!state.manual&&
state.phase==="ENTRY";

state.n10.pending.push({
id:"N10@"+(++state.n10.sequence),
turn,
trigger:before.at(-1),
recordId:selected.recordId,
entry:copy(selected),
history:[...before],
triangleKey:triangleContext(before),
config:config10(),
phase:state.secondHouse?"SECOND_SKIP":"ENTRY",
initialSkip:!!state.secondHouse,
results:[],
actual,
source,
defense:null,
options:null
});
}

function transition10(test,n,turn) {
test.results.push(n);

const h=[
...test.history,
...test.results
];

if(test.phase==="SECOND_SKIP") {
if(test.initialSkip) {
test.initialSkip=false;
return null;
}

test.phase="SECOND_ENTRY";
return null;
}

if(test.phase==="GALE_SKIP") {
test.phase="GALE";
return null;
}

if(test.phase==="GALE") {
return test.defense.play.numbers.includes(n)
?"GREEN G1":"LOSS";
}

if(test.entry.play.numbers.includes(n)) {
return "GREEN";
}

test.failureTurn=turn;
test.failureTrigger=n;

test.options=options10(
test.entry,n,h,turn
);

const decision=defense10(
test.entry,n,h,test.config,turn
);

test.defense=copy(
decision?.motor||test.entry
);

test.decision=copy(decision);

test.phase=test.config.galeSkip
?"GALE_SKIP":"GALE";

return null;
}

function simulate10(test,motor) {
const simulated={
...copy(test),
entry:copy(motor),
results:[],
phase:test.config.secondHouse
?"SECOND_SKIP":"ENTRY",
initialSkip:!!test.config.secondHouse,
defense:null,
options:null
};

let result=null;

for(let i=0;i<test.results.length;i++) {
result=transition10(
simulated,
test.results[i],
test.turn+i
);

if(result)break;
}

return result;
}

function alternatives10(test,turn) {
const seen=new Set([test.recordId]);

let tested=0;
let green=0;
let g1=0;
let loss=0;

for(const item of state.n10.archive) {
if(
item.turn>=test.turn||
seen.has(item.id)
)continue;

seen.add(item.id);

const record=register10(
test.trigger,item.motor,item.turn
);

if(!record||record.status==="REJECTED")continue;

const outcome=simulate10(test,item.motor);
if(!outcome)continue;

tested++;

if(outcome==="GREEN") {
record.vg++;
green++;

} else if(outcome==="GREEN G1") {
record.vg1++;
g1++;

} else {
record.vl++;
loss++;
record.status="REJECTED";
record.rejectedTurn=turn;
record.virtualRejected=true;
}

record.lastVirtual=outcome;
record.lastVirtualTurn=turn;
}

state.n10.events.push({
turn,
trigger:test.trigger,
kind:"RETROSPECTIVE",
virtual:true,
triangleKey:test.triangleKey,
tested,
green,
g1,
loss,
reference:test.id
});
}

function finish10(test,result,turn) {
const record=book10(test.trigger)
.records[test.recordId];

if(!record)return;

record.last=turn;
record.lastResult=result;

if(result==="LOSS") {
record.loss++;
record.status="REJECTED";
record.rejectedTurn=turn;

} else {
if(result==="GREEN")record.green++;
else record.g1++;

if(record.status!=="REJECTED") {
record.status="APPROVED";
}
}

state.n10.events.push({
turn,
trigger:test.trigger,
recordId:test.recordId,
kind:"FORWARD",
virtual:!test.actual,
source:test.source,
result,
profit:profit(result),
triangleKey:test.triangleKey,
defense:test.decision?.mode||null,
id:test.id
});

if(result==="LOSS") {
alternatives10(test,turn);
}
}

function settle10(n,turn) {
const remaining=[];

for(const test of state.n10.pending) {
const outcome=transition10(test,n,turn);

if(!outcome) {
remaining.push(test);
continue;
}

if(test.phase==="GALE"&&test.options) {
for(const option of test.options) {
state.g1Rows.push({
turn,
eventId:test.id,
strategy:N10,
mode:option.mode,
behavior:option.behavior,
trigger:test.failureTrigger,
outcome:n,
hit:option.motor.play.numbers.includes(n),
uncovered:missing(option.motor.play),
entryMotor:test.entry.key,
triangleKey:test.decision?.triangleKey||
test.triangleKey
});
}
}

finish10(test,outcome,turn);
}

state.n10.pending=remaining;
state.n10.events=state.n10.events.slice(-1200);
state.g1Rows=state.g1Rows.slice(-5000);
}

function recordStatus10(record) {
if(record.status==="REJECTED")return "REPROVADA";
if(record.status==="APPROVED")return "APROVADA";

return record.vg+record.vg1>0
?"EM TESTE • ALTERNATIVA VIRTUAL"
:"EM TESTE";
}

/* ======================================================
 TREINADOR GLOBAL ORIGINAL + VALIDAÇÃO POR TRAJETO
====================================================== */

function virtualCycle(id) {
return state.virtual[id]||
(state.virtual[id]={
phase:"ENTRY",
previous:null,
defense:null,
entry:null,
trigger:null,
entryTrigger:null,
triangleKey:null
});
}

function trainerRanking() {
return definitions().map(def=>{
const all=state.entryRows.filter(
r=>r.strategy===def.id&&r.closed
);

const rows=all.slice(-30);
const recent=rows.slice(-12);

const hits=rows.filter(
r=>r.result!=="LOSS"
).length;

const losses=recent.filter(
r=>r.result==="LOSS"
).length;

const originalScore=
(hits+8*(28/37))/
(rows.length+8)-
losses*.008;

const conditional=triangleContextMetrics(
all.slice(-120),state.history
);

const contextWeight=
.35*conditional.total/
(conditional.total+8);

const score=
originalScore*(1-contextWeight)+
conditional.score*contextWeight;

return {
...def,
score,
originalScore,
contextScore:conditional.score,
contextTotal:conditional.total,
contextHits:conditional.hits,
contextLoss:conditional.loss,
total:rows.length,
hits,
loss:rows.length-hits
};
}).sort((a,b)=>
b.score-a.score||
a.id.localeCompare(b.id)
);
}

function activeDefinition() {
const defs=definitions();

if(state.strategy===N10) {
return {
id:N10,
name:"TREINADOR GLOBAL NÚMEROS 1.0",
type:N10
};
}

if(state.strategy==="NUMBER") {
return {
id:"NUMBER",
name:"TREINADOR GLOBAL NÚMEROS",
type:"NUMBER"
};
}

if(state.strategy==="TRAINER") {
return defs.find(
d=>d.id===state.trainerChoice
)||defs[0];
}

if(state.strategy==="ADAPTIVE") {
return defs.find(
d=>d.id==="ADAPTIVE:"+state.adaptive
)||defs[0];
}

if(state.strategy==="CREATED") {
return defs.find(
d=>d.id===state.activeCreated
)||defs[0];
}

return defs.find(
d=>d.id==="ORIGINAL:"+state.strategy
)||defs[0];
}

function updateTrainer() {
if(state.phase!=="ENTRY"||state.manual)return;

const ranked=trainerRanking();

const current=ranked.find(
r=>r.id===state.trainerChoice
);

const best=ranked[0];
if(!best)return;

const shouldChange=
!current||
state.trainerTurns>=3||
state.trainerPending||
(
best.id!==current.id&&
best.score>current.score+.035
);

if(!shouldChange)return;

const selected=current
?ranked.find(r=>r.id!==current.id)||best
:best;

if(current&&current.id!==selected.id) {
state.trainerChanges++;
}

state.trainerChoice=selected.id;
state.trainerTurns=0;
state.trainerPending=false;

state.trainerHistory.push({
turn:state.history.length,
from:current?.id||"INICIAL",
to:selected.id,
score:selected.score,
triangleKey:triangleContext(state.history),
contextTotal:selected.contextTotal
});
}

/* ======================================================
 MOTOR ATIVO / RESULTADO FINANCEIRO
====================================================== */

function activeMotor(cs) {
if(state.manual) {
return cs.find(
m=>m.key===state.manual
)||cs[0]||null;
}

if(state.strategy===N10)return choice10();

if(state.strategy==="NUMBER") {
return bestNumberCombination(state.history);
}

return chooseMotor(
activeDefinition(),cs,state.previous
);
}

function profit(result) {
const unit=Number(state.stake)||1;
const g=Number(state.multiplier)||1;

if(result==="GREEN")return 8*unit;
if(result==="GREEN G1")return (8*g-28)*unit;
if(result==="LOSS")return -28*(1+g)*unit;

return 0;
}

/* ======================================================
 RESOLUÇÃO DOS GALES VIRTUAIS ORIGINAIS
====================================================== */

function settlePending(n) {
for(const pending of state.g1Pending) {
state.g1Rows.push({
turn:state.history.length+1,
eventId:pending.eventId,
strategy:pending.strategy,
mode:pending.mode,
behavior:pending.behavior,
trigger:pending.trigger,
outcome:n,
hit:pending.numbers.includes(n),
uncovered:pending.uncovered,
entryMotor:pending.entryMotor||null,
triangleKey:pending.triangleKey||"SEM TRINCA"
});
}

state.g1Pending=[];

if(state.g1Rows.length>5000) {
state.g1Rows=state.g1Rows.slice(-5000);
}
}

/* ======================================================
 PROCESSAMENTO CRONOLÓGICO
====================================================== */

function spin(n,source="HISTÓRICO") {
if(!Number.isInteger(n)||n<0||n>36) {
throw new Error("NÚMERO INVÁLIDO");
}

const before=[...state.history];
const triggerBefore=before.at(-1);
const cs=motors(before);
const defs=definitions();
const turn=before.length+1;
const phaseBefore=state.phase;
const cycleBefore=copy(state.cycle);
const numberBefore=bestNumberCombination(before);

const triangleKey=triangleContext(before);
const triangleBefore=triangleAnalysis(before).last;

let result="AGUARDANDO";
let played=null;

const after=[...before,n];

/*
Tudo que participa da entrada é preparado antes
de registrar ou avaliar o resultado N.
*/

begin10(before,turn,source,cs);

if(state.phase==="ENTRY")updateTrainer();

/* ENTRADA REAL */

if(state.phase==="ENTRY") {
const motor=activeMotor(cs);

if(motor) {
played=copy(motor);
state.previous=motor.key;

state.cycle={
strategy:activeDefinition().id,
original:copy(motor),
trigger:null,
decision:null,
entryTrigger:triggerBefore,
triangleKey
};

if(state.secondHouse) {
state.defense=copy(motor);
state.phase="SECOND_SKIP";
result="2ª CASA";

} else if(motor.play.numbers.includes(n)) {
result="GREEN";
state.cycle=null;

} else {
result="GALE";
state.cycle.trigger=n;

const strategy=state.cycle.strategy;

const decision=state.g1Trainer
?chooseG1(motor,n,after,strategy)
:{
motor:state.g1
?fineG1(motor,n,after):copy(motor),

mode:state.g1
?"AJUSTE FINO":"CONGELADA",

behavior:behaviorReading(
motor,after,strategy,n
).type,

triangleKey:triangleContext(after)
};

state.cycle.decision=decision;

state.defense=copy(
decision?.motor||motor
);

state.phase=state.galeSkip
?"GALE_SKIP":"GALE";

state.decisions.push({
turn,
strategy,
mode:decision?.mode||"CONGELADA",
behavior:decision?.behavior||"CONTINUIDADE",
trigger:n,
numberTests:decision?.numberTotal||0,
triangleKey:decision?.triangleKey
});
}
}

} else if(state.phase==="SECOND_SKIP") {
played=copy(state.defense);
result="CASA PULADA";
state.phase="SECOND_ENTRY";

} else if(state.phase==="SECOND_ENTRY") {
played=copy(state.defense);

if(played?.play.numbers.includes(n)) {
result="GREEN";
state.phase="ENTRY";
state.cycle=null;
state.defense=null;

} else {
result="GALE";
state.cycle.trigger=n;

const strategy=state.cycle.strategy;

const decision=state.g1Trainer
?chooseG1(played,n,after,strategy)
:{
motor:state.g1
?fineG1(played,n,after):copy(played),

mode:state.g1
?"AJUSTE FINO":"CONGELADA",

behavior:behaviorReading(
played,after,strategy,n
).type,

triangleKey:triangleContext(after)
};

state.cycle.decision=decision;

state.defense=copy(
decision?.motor||played
);

state.phase=state.galeSkip
?"GALE_SKIP":"GALE";

state.decisions.push({
turn,
strategy,
mode:decision?.mode||"CONGELADA",
behavior:decision?.behavior||"CONTINUIDADE",
trigger:n,
numberTests:decision?.numberTotal||0,
triangleKey:decision?.triangleKey
});
}

} else if(state.phase==="GALE_SKIP") {
played=copy(state.defense);
result="GALE PULADO";
state.phase="GALE";

} else if(state.phase==="GALE") {
played=copy(state.defense);

result=played?.play.numbers.includes(n)
?"GREEN G1":"LOSS";

state.realG1.push({
turn,
strategy:state.cycle?.strategy,
mode:state.cycle?.decision?.mode,
behavior:state.cycle?.decision?.behavior,
trigger:state.cycle?.trigger,
outcome:n,
result,
triangleKey:state.cycle?.triangleKey
});

state.phase="ENTRY";
state.cycle=null;
state.defense=null;
}

/* RESOLVE GALES VIRTUAIS ANTERIORES */

settlePending(n);

/* TREINAMENTO VIRTUAL ORIGINAL */

const pending=[];

const virtualDefs=[
...defs,
{
id:"NUMBER",
name:"TREINADOR GLOBAL NÚMEROS",
type:"NUMBER"
}
];

for(const def of virtualDefs) {
const virtual=virtualCycle(def.id);

let motor=null;
let virtualResult="AGUARDANDO";
let closed=false;

if(virtual.phase==="ENTRY") {
motor=def.type==="NUMBER"
?numberBefore
:chooseMotor(def,cs,virtual.previous);

if(!motor)continue;

motor=copy(motor);

virtual.previous=motor.key;
virtual.entryTrigger=triggerBefore;
virtual.triangleKey=triangleKey;

if(motor.play.numbers.includes(n)) {
virtualResult="GREEN";
closed=true;

state.entryRows.push({
turn,
strategy:def.id,
trigger:virtual.entryTrigger,
motor:motor.key,
result:"GREEN",
closed:true,
profit:profit("GREEN"),
triangleKey:virtual.triangleKey
});

virtual.entryTrigger=null;
virtual.triangleKey=null;

} else {
virtualResult="GALE";
virtual.phase="GALE";
virtual.entry=copy(motor);
virtual.trigger=n;

const options=defenses(
motor,n,after,def.id
);

const eventId=def.id+"@"+turn;
const defenseContext=triangleContext(after);

for(const option of options) {
pending.push({
eventId,
strategy:def.id,
mode:option.mode,
behavior:option.behavior,
trigger:n,
entryMotor:motor.key,
numbers:[...option.motor.play.numbers],
uncovered:missing(option.motor.play),
triangleKey:defenseContext
});
}

const decision=chooseG1(
motor,n,after,def.id
);

virtual.defense=
decision?.motor||
fineG1(motor,n,after)||
copy(motor);
}

} else {
motor=copy(virtual.defense);

virtualResult=motor?.play.numbers.includes(n)
?"GREEN G1":"LOSS";

closed=true;

state.entryRows.push({
turn,
strategy:def.id,
trigger:virtual.entryTrigger,
motor:virtual.entry?.key||null,
result:virtualResult,
closed:true,
profit:profit(virtualResult),
triangleKey:virtual.triangleKey
});

virtual.phase="ENTRY";
virtual.defense=null;
virtual.entry=null;
virtual.trigger=null;
virtual.entryTrigger=null;
virtual.triangleKey=null;
}
}

state.g1Pending=pending;

/* TREINADORES NUMÉRICOS INDEPENDENTES */

recordNumberComparison(before,n,turn);
settle10(n,turn);

/* REGISTRO DOS 12 MOTORES */

const motorHits={};

for(const motor of cs) {
motorHits[motor.key]=
motor.play.numbers.includes(n);
}

state.ledger.push({
turn,
number:n,
source,
trigger:triggerBefore,
strategy:
cycleBefore?.strategy||
activeDefinition().id,

motor:played?.key||"—",
phase:phaseBefore,
result,
profit:profit(result),
play:played?.play||null,

numberCandidate:
numberBefore?.sourceNumber??null,

numberCandidateTurn:
numberBefore?.sourceTurn??null,

triangleKey,
triangleType:triangleBefore?.type||"SEM TRINCA",
cycleTriangleKey:cycleBefore?.triangleKey||triangleKey,
motorHits
});

/*
Somente agora N passa a integrar o histórico conhecido.
*/

state.history.push(n);
state.sources.push(source);

registerNumberCombination(state.history,turn);
updateNumberChoice();
prepare10(state.history);

if(state.entryRows.length>4000) {
state.entryRows=state.entryRows.slice(-4000);
}

if(state.ledger.length>300) {
state.ledger=state.ledger.slice(-300);
}

state.trainerTurns++;

if(
state.phase!=="ENTRY"&&
state.trainerTurns>=3
)state.trainerPending=true;
}

/* ======================================================
 RECÁLCULO 70 + 10
====================================================== */

function waitFrame() {
return new Promise(resolve=>
requestAnimationFrame(()=>resolve())
);
}

function setBusy(value,message="") {
busy=value;

const overlay=$("overlay");
if(overlay)overlay.classList.toggle("show",value);

if($("overlayMessage")) {
$("overlayMessage").textContent=message;
}

for(const button of document.querySelectorAll(
".key,#import,#undo,#clear,#restore"
))button.disabled=value;
}

async function rebuild70(numbers,{
preserveManual=false,
incrementCycle=false,
customSettings=null,
customManualLog=null,
customCycles=null
}={}) {
if(busy)return;

const previous=state;
const clean=cleanNumbers(numbers).slice(-WINDOW);
const opts=customSettings||settings();

const manualLog=customManualLog!=null
?copy(customManualLog)
:preserveManual
?copy(state.manualLog):[];

const cycles=customCycles!=null
?customCycles
:preserveManual
?state.cyclesCompleted+(incrementCycle?1:0)
:0;

setBusy(
true,
"RECALCULANDO JANELA DE 70 NÚMEROS"
);

await waitFrame();

try {
state={
...fresh(),
...opts,
history:[],
sources:[],
manualLog,
manualCount:0,
cyclesCompleted:cycles,
recalcPending:false,
migrationPending:false
};

triangleCache.clear();

for(let i=0;i<clean.length;i++) {
spin(clean[i],"HISTÓRICO");

if(i%5===4||i===clean.length-1) {
const message=
"RECALCULANDO: "+
(i+1)+"/"+clean.length+
" NÚMEROS";

if($("overlayMessage")) {
$("overlayMessage").textContent=message;
}

if($("status")) {
$("status").textContent=message;
}

await new Promise(resolve=>
setTimeout(resolve,0)
);
}
}

save();

} catch(e) {
state=previous;
save();

alert(
"ERRO NO RECÁLCULO: "+
String(e.message||e)
);

} finally {
setBusy(false);
render();
}
}

function canRecalculate() {
return state.phase==="ENTRY"&&state.cycle===null;
}

async function checkRecalculation() {
if(busy)return;

if(
state.manualCount<MANUAL_LIMIT&&
!state.migrationPending
) {
state.recalcPending=false;
save();
return;
}

if(!canRecalculate()) {
state.recalcPending=true;
save();
render();
return;
}

const increment=
state.manualCount>=MANUAL_LIMIT;

state.recalcPending=false;

await rebuild70(
state.history.slice(-WINDOW),
{
preserveManual:true,
incrementCycle:increment
}
);
}

/* ======================================================
 ADICIONAR MANUAL
====================================================== */

async function addManual(n) {
if(busy)return;

if(state.history.length<8) {
alert("IMPORTE UM HISTÓRICO PRIMEIRO.");
return;
}

try {
spin(n,"TEMPO REAL");

const row=state.ledger.at(-1);

state.manualLog.push({
id:Date.now()+"_"+state.manualLog.length,
number:n,
result:row.result,
profit:row.profit,
strategy:row.strategy,
motor:row.motor,
phase:row.phase,
numberCandidate:row.numberCandidate,
triangleKey:row.triangleKey,
timestamp:Date.now()
});

state.manualCount++;

if(state.manualCount>=MANUAL_LIMIT) {
state.recalcPending=true;
}

save();
render();

await checkRecalculation();

} catch(e) {
alert(
"ERRO AO INSERIR NÚMERO: "+
String(e.message||e)
);
}
}

/* ======================================================
 IMPORTAR / APAGAR / ZERAR
====================================================== */

function parseInput(text) {
return (String(text).match(/\d+/g)||[])
.map(Number)
.filter(n=>
Number.isInteger(n)&&n>=0&&n<=36
);
}

async function importHistory(numbers) {
if(busy)return;

const clean=cleanNumbers(numbers);

if(!clean.length) {
alert("INFORME NÚMEROS DE 0 A 36.");
return;
}

if(!confirm(
"IMPORTAR "+clean.length+" NÚMEROS?\n\n"+
"O SISTEMA USARÁ OS ÚLTIMOS "+
Math.min(WINDOW,clean.length)+
" E APAGARÁ OS REGISTROS MANUAIS ANTERIORES."
))return;

$("paste").value="";

await rebuild70(
clean,
{preserveManual:false}
);
}

async function undo() {
if(busy)return;

if(state.manualCount<=0) {
alert(
"NÃO EXISTE LANÇAMENTO MANUAL "+
"NESTE CICLO PARA APAGAR."
);
return;
}

const previous=state;
const numbers=state.history.slice(0,-1);
const sources=state.sources.slice(0,-1);
const manualLog=state.manualLog.slice(0,-1);
const manualCount=state.manualCount-1;
const cycles=state.cyclesCompleted;
const migrationPending=state.migrationPending;
const opts=settings();

setBusy(true,"REFAZENDO ANÁLISES");
await waitFrame();

try {
state={
...fresh(),
...opts,
manualLog,
manualCount,
cyclesCompleted:cycles,
migrationPending,
recalcPending:
manualCount>=MANUAL_LIMIT||migrationPending
};

triangleCache.clear();

for(let i=0;i<numbers.length;i++) {
spin(
numbers[i],
sources[i]||"HISTÓRICO"
);

if(i%8===7) {
$("overlayMessage").textContent=
"REPROCESSANDO "+
(i+1)+"/"+numbers.length;

await new Promise(resolve=>
setTimeout(resolve,0)
);
}
}

save();

} catch(e) {
state=previous;
alert(String(e.message||e));

} finally {
setBusy(false);
render();
}
}

function clearAll() {
if(busy)return;

if(!confirm(
"ZERAR TUDO?\n\n"+
"ISSO APAGARÁ HISTÓRICO, TREINAMENTO, "+
"GREEN, GREEN G1 E LOSS MANUAIS."
))return;

state=fresh();
triangleCache.clear();
save();
render();
}

/* ======================================================
 COMPONENTES DA INTERFACE
====================================================== */

function button(label,action,parent,extra="") {
const element=document.createElement("button");

element.className="btn "+extra;
element.textContent=label;
element.onclick=action;

parent.appendChild(element);
return element;
}

function sortedBlocks(play) {
return validPlay(play)
?[...play.blocks].sort((a,b)=>
Object.keys(REGIONS).indexOf(region(a.center))-
Object.keys(REGIONS).indexOf(region(b.center))
):[];
}

function centersHTML(play) {
return sortedBlocks(play).map(block=>`
<div class="center ${block.radius===1?"short":""}">
<strong>${block.center}</strong>
<small>${region(block.center)}</small>
<small>
${block.radius}
${block.radius===1?"VIZINHO":"VIZINHOS"}
</small>
</div>
`).join("");
}

function cloud(numbers,highlight=[]) {
const marked=new Set(highlight);

return `
<div class="cloud">
${numbers.map(n=>`
<span class="${marked.has(n)?"danger":""}">
${n}
</span>
`).join("")}
</div>`;
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
total:closed.length,
green,g1,loss,net
};
}

function metricsHTML(rows) {
const value=metrics(rows);

return `
<div class="metrics">
${[
["CICLOS",value.total],
["GREEN",value.green],
["GREEN G1",value.g1],
["LOSS",value.loss],
["ACERTOS",pct(value.green+value.g1,value.total)],
["LÍQUIDO",fmt(value.net)]
].map(([label,number])=>`
<div class="metric">
<small>${label}</small>
<b>${number}</b>
</div>
`).join("")}
</div>`;
}

function breakdown(strategy=null,mode="CONGELADA") {
const rows=g1History(strategy,mode,500);

const out={
CONTINUIDADE:{total:0,hits:0},
DESLOCAMENTO:{total:0,hits:0},
RUPTURA:{total:0,hits:0}
};

for(const row of rows) {
const item=out[row.behavior];
if(!item)continue;

item.total++;
if(row.hit)item.hits++;
}

return out;
}

function breakdownHTML(strategy=null) {
const values=breakdown(strategy);

return `
<div class="tablewrap">
<table>
<thead>
<tr>
<th>COMPORTAMENTO</th>
<th>OCORRÊNCIAS</th>
<th>GREEN G1</th>
<th>LOSS</th>
<th>ACERTO</th>
</tr>
</thead>
<tbody>
${Object.entries(values).map(([name,x])=>`
<tr>
<td>${name}</td>
<td>${x.total}</td>
<td class="good">${x.hits}</td>
<td class="bad">${x.total-x.hits}</td>
<td>${pct(x.hits,x.total)}</td>
</tr>
`).join("")}
</tbody>
</table>
</div>`;
}

/* ======================================================
 PAINEL VISUAL DE TRIANGULAÇÃO
====================================================== */

function triangleSVG(features) {
if(!features)return "";

const position=n=>{
const p=pointTriangle(n);

return {
x:250+p.x*190,
y:250-p.y*190
};
};

const points=[
features.a,
features.b,
features.c
];

const p=position(features.a);
const q=position(features.b);
const r=position(features.c);

return `
<svg viewBox="0 0 500 500"
role="img"
aria-label="Triangulação dos últimos três resultados">

<defs>
<marker id="triangleArrowA"
markerWidth="8" markerHeight="8"
refX="6" refY="3" orient="auto">
<path d="M0,0 L6,3 L0,6 Z" fill="#57e4ff"/>
</marker>

<marker id="triangleArrowB"
markerWidth="8" markerHeight="8"
refX="6" refY="3" orient="auto">
<path d="M0,0 L6,3 L0,6 Z" fill="#ffd36a"/>
</marker>
</defs>

<circle cx="250" cy="250" r="190"
fill="#101e2d" stroke="#58718a" stroke-width="2"/>

${features.a!==features.c?`
<line x1="${p.x}" y1="${p.y}"
x2="${r.x}" y2="${r.y}"
stroke="#a7bdd4" stroke-width="2"
stroke-dasharray="7 5"/>
`:""}

${features.a!==features.b?`
<path d="M ${p.x} ${p.y}
Q ${(p.x+q.x)/2+7} ${(p.y+q.y)/2+7}
${q.x} ${q.y}"
fill="none" stroke="#57e4ff" stroke-width="4"
marker-end="url(#triangleArrowA)"/>
`:""}

${features.b!==features.c?`
<path d="M ${q.x} ${q.y}
Q ${(q.x+r.x)/2-7} ${(q.y+r.y)/2-7}
${r.x} ${r.y}"
fill="none" stroke="#ffd36a" stroke-width="4"
marker-end="url(#triangleArrowB)"/>
`:""}

${W.map(n=>{
const v=position(n);
const active=points.includes(n);

return `
<circle cx="${v.x}" cy="${v.y}"
r="14"
fill="${n===0?"#087b50":RED.has(n)?"#a92b43":"#253a50"}"
stroke="${active?"#ffe078":"#526d85"}"
stroke-width="${active?3:1}"/>

<text x="${v.x}" y="${v.y+4}"
fill="white" text-anchor="middle"
font-size="11" font-weight="bold">${n}</text>
`;
}).join("")}

<text x="250" y="241" fill="#bdd0e2"
text-anchor="middle" font-size="14">
${features.a} → ${features.b} → ${features.c}
</text>

<text x="250" y="265" fill="#57e4ff"
text-anchor="middle" font-size="11">
${esc(features.type)}
</text>
</svg>`;
}

function triangulationHTML() {
const h=state.history;
const analysis=triangleAnalysis(h);
const current=analysis.last;

if(!current) {
return `<div class="box">
AGUARDANDO PELO MENOS TRÊS RESULTADOS.
</div>`;
}

const ranked=W.map(n=>({
number:n,
weight:analysis.weights[ix(n)]
})).sort((a,b)=>b.weight-a.weight);

const exact=[];

const a=h.at(-2);
const b=h.at(-1);

for(let i=0;i+2<h.length;i++) {
if(h[i]===a&&h[i+1]===b) {
exact.push(h[i+2]);
}
}

const strategies=trainerRanking();

return `
<div class="box">
<b>TRIANGULAÇÃO INTEGRADA V6.4.1</b>

<p>
TRINCA CONHECIDA:
<strong>
${current.a} → ${current.b} → ${current.c}
</strong>
</p>

<p>
FORMA: <strong>${current.type}</strong>
</p>

<p>
SALTO A → B:
${current.s1>0?"+":""}${current.s1}
CASAS
</p>

<p>
SALTO B → C:
${current.s2>0?"+":""}${current.s2}
CASAS
</p>

<p>
DISTÂNCIA A → C:
<strong>${current.closure} CASAS</strong>
</p>

<p>
ÂNGULOS A / B / C:
${current.angles.map(
x=>x==null?"INDEFINIDO":fmt(x)+"°"
).join(" / ")}
</p>

<p>
ÁREA NO CÍRCULO UNITÁRIO:
${fmt(current.area)}
</p>

<p>
CORDAS AB / BC / AC:
${current.chords.map(fmt).join(" / ")}
</p>

<p>
${current.degenerate
?"TRINCA DEGENERADA: HÁ PONTOS REPETIDOS."
:"TRÊS PONTOS DISTINTOS FORMAM UM TRIÂNGULO."}
</p>
</div>

<div class="triangleDrawing">
${triangleSVG(current)}
</div>

<div class="muted">
CIANO: A → B.
AMARELO: B → C.
TRACEJADO: DISTÂNCIA ENTRE A E C.
AS LINHAS NÃO REPRESENTAM A TRAJETÓRIA REAL DA BOLA.
</div>

<div class="box">
<b>MEMÓRIA DOS DOIS ÚLTIMOS RESULTADOS</b>

<p>
CONTEXTO ATUAL:
<strong>${a} → ${b}</strong>
</p>

<p>
OCORRÊNCIAS ANTERIORES DESTE PAR:
${analysis.exactPairs}
</p>

<p>
TRINCAS HISTÓRICAS COM SALTO INICIAL SEMELHANTE:
${analysis.matches}
</p>

<p>
TOTAL DE TRINCAS CONHECIDAS:
${analysis.samples}
</p>

<p>
CONTEXTO DE VALIDAÇÃO:
${esc(analysis.context)}
</p>
</div>

<div class="title">
RESULTADOS CONHECIDOS DEPOIS DO PAR ${a} → ${b}
</div>

${exact.length
?cloud(exact)
:`<div class="muted">
AINDA NÃO HÁ OCORRÊNCIA EXATA COMPLETA.
A CAMADA USA SEMELHANÇA DE SALTOS E GEOMETRIA.
</div>`}

<div class="title">
PESOS RELATIVOS DE TRIANGULAÇÃO
</div>

<div class="tablewrap">
<table>
<thead>
<tr>
<th>#</th><th>NÚMERO</th><th>PESO RELATIVO</th>
</tr>
</thead>
<tbody>
${ranked.map((row,i)=>`
<tr>
<td>${i+1}</td>
<td>${row.number}</td>
<td>${fmt(row.weight)}</td>
</tr>
`).join("")}
</tbody>
</table>
</div>

<div class="muted">
PESO RELATIVO NÃO É PROBABILIDADE.
A MÉDIA DOS 37 PESOS É 1.
ESSES PESOS PARTICIPAM DA GEOMETRIA DOS MOTORES.
</div>

<div class="title">
VALIDAÇÃO VIRTUAL DAS ESTRATÉGIAS NO CONTEXTO ATUAL
</div>

<div class="tablewrap">
<table>
<thead>
<tr>
<th>ESTRATÉGIA</th>
<th>CICLOS NO CONTEXTO</th>
<th>ACERTOS</th>
<th>LOSS</th>
<th>ÍNDICE COMBINADO</th>
</tr>
</thead>
<tbody>
${strategies.map(row=>`
<tr>
<td>${esc(row.name)}</td>
<td>${row.contextTotal}</td>
<td class="good">${row.contextHits}</td>
<td class="bad">${row.contextLoss}</td>
<td>${pct(row.score,1)}</td>
</tr>
`).join("")}
</tbody>
</table>
</div>

<div class="title">
FORMAS OBSERVADAS NA JANELA
</div>

${Object.entries(analysis.counts).map(([type,count])=>`
<div class="listrow">
${esc(type)} • ${count}
</div>
`).join("")}

<div class="title">
ÚLTIMAS TRINCAS CONHECIDAS
</div>

<div class="tablewrap">
<table>
<thead>
<tr>
<th>GIRO</th><th>TRINCA</th>
<th>FORMA</th><th>AB</th><th>BC</th><th>AC</th><th>ÁREA</th>
</tr>
</thead>
<tbody>
${analysis.triples.slice(-25).reverse().map(t=>`
<tr>
<td>${t.turn}</td>
<td>${t.a} → ${t.b} → ${t.c}</td>
<td>${esc(t.type)}</td>
<td>${t.s1}</td>
<td>${t.s2}</td>
<td>${t.closure}</td>
<td>${fmt(t.area)}</td>
</tr>
`).join("")}
</tbody>
</table>
</div>

<div class="box">
A VALIDAÇÃO UTILIZA COMBINAÇÕES FORMADAS ANTES DO RESULTADO.
O CONTEXTO É REGISTRADO NA ABERTURA DO CICLO.
O RESULTADO FINAL SÓ ENTRA NA COMPARAÇÃO APÓS O ENCERRAMENTO.
</div>
`;
}

/* ======================================================
 PAINEL DO TREINADOR GLOBAL NÚMEROS 1.0
====================================================== */

function card10(record) {
const rejected=record.status==="REJECTED";
const approved=record.status==="APPROVED";

const pending=state.n10.pending.filter(p=>
p.trigger===record.trigger&&
p.recordId===record.id
);

return `
<div class="g1card ${approved?"selected":""}">
<b class="${rejected?"bad":approved?"good":""}">
GATILHO ${record.trigger} • ${recordStatus10(record)}
</b>

<div class="muted">
MOTOR DE ORIGEM: ${esc(record.motor.key)}
• GERADA NO GIRO ${record.created}
</div>

<div class="play10">
<div class="centers">
${centersHTML(record.motor.play)}
</div>

${rejected?`
<div class="reject10">
NÃO JOGAR
<small>
COMBINAÇÃO REPROVADA PARA O GATILHO ${record.trigger}
</small>
</div>
`:""}
</div>

<div class="muted">
28 COBERTOS:
${record.motor.play.numbers.join(" • ")}
</div>

<div class="muted">
9 DESCOBERTOS:
${missing(record.motor.play).join(" • ")}
</div>

<div class="muted">
TESTES PROSPECTIVOS:
GREEN ${record.green}
• GREEN G1 ${record.g1}
• LOSS ${record.loss}
</div>

<div class="muted">
RETROSPECTIVOS VIRTUAIS:
GREEN ${record.vg}
• GREEN G1 ${record.vg1}
• LOSS ${record.vl}
</div>

<div class="muted">
COBERTURA DOS PESOS ATUAIS DE TRIANGULAÇÃO:
${pct(triangleCoverage(record.motor.play,state.history),1)}
</div>

${record.lastResult?`
<div class="muted">
ÚLTIMO CICLO:
<b>${esc(record.lastResult)}</b>
• GIRO ${record.last}
</div>
`:""}

${record.lastVirtual?`
<div class="muted">
ÚLTIMO RETROSPECTIVO VIRTUAL:
${esc(record.lastVirtual)}
• GIRO ${record.lastVirtualTurn}
</div>
`:""}

${pending.length?`
<div class="muted">
TESTES ABERTOS:
${pending.map(p=>
`${p.actual?"REAL":"VIRTUAL"} ${esc(p.phase)} • ENTRADA ${p.turn}`
).join(" / ")}
</div>
`:""}

${record.lastResult==="GREEN G1"?`
<div class="muted">
A APROVAÇÃO FOI DO CICLO COM DEFESA G1.
A ENTRADA ORIGINAL NÃO COBRIU O PRIMEIRO RESULTADO.
</div>
`:""}
</div>`;
}

function numberTrainer10HTML() {
const current=state.history.at(-1);

if(current==null||state.history.length<8) {
return `<div class="box">AGUARDANDO HISTÓRICO.</div>`;
}

const trigger=state.n10.viewTrigger==="CURRENT"
?current:Number(state.n10.viewTrigger);

const records=Object.values(book10(trigger).records);

const approved=records.filter(
r=>r.status==="APPROVED"
);

const rejected=records.filter(
r=>r.status==="REJECTED"
);

const testing=records.filter(
r=>r.status==="TESTING"
);

const selected=state.n10.choice;

const selectedRecord=selected
?book10(selected.trigger).records[selected.recordId]
:null;

const forward=state.n10.events.filter(
e=>e.kind==="FORWARD"
);

const real=forward.filter(e=>!e.virtual);
const virtual=forward.filter(e=>e.virtual);

const events=state.n10.events
.filter(e=>e.trigger===trigger)
.slice(-35).reverse();

const order={
APPROVED:0,
TESTING:1,
REJECTED:2
};

const ranked=[...records].sort((a,b)=>
order[a.status]-order[b.status]||
scoreRecord10(b,state.history)-scoreRecord10(a,state.history)||
Math.max(b.last||0,b.lastVirtualTurn||0)-
Math.max(a.last||0,a.lastVirtualTurn||0)
);

const visible=state.n10.viewAll
?ranked:ranked.slice(0,60);

return `
<div class="box">
<b>TREINADOR GLOBAL NÚMEROS 1.0</b>

<p>
STATUS:
<strong class="${state.strategy===N10&&!state.manual?"good":"bad"}">
${state.strategy===N10&&!state.manual
?"CONTROLANDO A JOGADA"
:"TREINAMENTO VIRTUAL INDEPENDENTE"}
</strong>
</p>

<p>
GATILHO ATUAL:
<strong>${current}</strong>
</p>

<p>
PRÓXIMA COMBINAÇÃO:
<strong>
${selectedRecord
?recordStatus10(selectedRecord)
:"SEM COMBINAÇÃO ELEGÍVEL"}
</strong>
</p>

<p>
APROVAÇÃO, BLOQUEIO POR GATILHO E TRIANGULAÇÃO
PARTICIPAM DA SELEÇÃO.
</p>

<p>
ALTERNATIVAS RETROSPECTIVAS CONTINUAM VIRTUAIS
E EM TESTE ATÉ VALIDAÇÃO PROSPECTIVA.
</p>
</div>

<div class="title">
COMBINAÇÃO ATUAL DO GATILHO ${current}
</div>

${selectedRecord
?card10(selectedRecord)
:`<div class="box bad">
SEM GEOMETRIA ELEGÍVEL.
AGUARDANDO NOVA COMBINAÇÃO DOS MOTORES NORMAIS.
REPROVADAS NÃO SERÃO REUTILIZADAS.
</div>`}

<div class="title">
CICLOS REAIS DO NOVO TREINADOR NA JANELA
</div>
${metricsHTML(real)}

<div class="title">
CICLOS PROSPECTIVOS VIRTUAIS • LÍQUIDO SIMULADO
</div>
${metricsHTML(virtual)}

<div class="title">
CONSULTAR HISTÓRICO POR GATILHO
</div>

<div class="row">
<select id="trigger10">

<option value="CURRENT"
${state.n10.viewTrigger==="CURRENT"?"selected":""}>
ACOMPANHAR NÚMERO ATUAL
</option>

${Array.from({length:37},(_,n)=>`
<option value="${n}" ${
String(state.n10.viewTrigger)===String(n)
?"selected":""
}>
GATILHO ${n}
</option>
`).join("")}

</select>

<button class="btn" id="all10">
${state.n10.viewAll
?"MOSTRAR 60 PRIMEIRAS"
:"MOSTRAR TODAS AS COMBINAÇÕES"}
</button>
</div>

<div class="box">
GATILHO ${trigger}
• APROVADAS ${approved.length}
• EM TESTE ${testing.length}
• REPROVADAS ${rejected.length}
</div>

<div class="title">
RESUMO DOS 37 GATILHOS
</div>

<div class="tablewrap">
<table>
<thead>
<tr>
<th>GATILHO</th>
<th>APROVADAS</th>
<th>EM TESTE</th>
<th>REPROVADAS</th>
<th>ABERTOS</th>
</tr>
</thead>
<tbody>

${Array.from({length:37},(_,n)=>{
const rows=Object.values(
state.n10.books[n]?.records||{}
);

return `
<tr class="${n===trigger?"toprow":""}">
<td>
<button class="btn" data-trigger10="${n}">
${n}
</button>
</td>
<td class="good">
${rows.filter(r=>r.status==="APPROVED").length}
</td>
<td>
${rows.filter(r=>r.status==="TESTING").length}
</td>
<td class="bad">
${rows.filter(r=>r.status==="REJECTED").length}
</td>
<td>
${state.n10.pending.filter(p=>p.trigger===n).length}
</td>
</tr>`;
}).join("")}

</tbody>
</table>
</div>

<div class="title">
COMBINAÇÕES DO GATILHO ${trigger}
• EXIBINDO ${visible.length}/${records.length}
</div>

${visible.map(card10).join("")||
`<div class="box">
AINDA NÃO HÁ COMBINAÇÃO TESTADA PARA ESTE GATILHO.
</div>`}

<div class="title">
EVENTOS DO GATILHO ${trigger}
</div>

${events.map(e=>e.kind==="RETROSPECTIVE"?`
<div class="listrow">
<b>RETROSPECTIVO VIRTUAL • GIRO ${e.turn}</b>
<div class="muted">
ALTERNATIVAS ${e.tested}
• GREEN ${e.green}
• GREEN G1 ${e.g1}
• LOSS ${e.loss}
• SEM APOSTA REAL
</div>
</div>
`:`
<div class="listrow">
<b>
${e.virtual?"PROSPECTIVO VIRTUAL":"CICLO REAL"}
• GIRO ${e.turn}
</b>

• <strong class="${e.result==="LOSS"?"bad":"good"}">
${esc(e.result)}
</strong>

<div class="muted">
${e.defense?"DEFESA "+esc(e.defense):"ENTRADA"}
• ${esc(e.source)}
</div>

<div class="muted">
TRIANGULAÇÃO:
${esc(e.triangleKey||"SEM CONTEXTO")}
</div>
</div>
`).join("")}

<div class="muted">
O BLOQUEIO É POR GATILHO E GEOMETRIA COMPLETA.
MUDAR O NOME DO MOTOR NÃO LIBERA A MESMA GEOMETRIA REPROVADA.
O RECÁLCULO REINICIA O APRENDIZADO DA JANELA.
</div>
`;
}

/* ======================================================
 PAINEL TREINADOR GLOBAL NÚMEROS — BASE V6.3.9
====================================================== */

function numberTrainerHTML() {
const h=state.history;

if(h.length<8) {
return `<div class="box">AGUARDANDO HISTÓRICO.</div>`;
}

const trigger=h.at(-1);
const ranked=rankNumberCombinations(h,trigger);
const pairs=numberTransitions(h,trigger);
const selected=ranked[0];
const generated=state.numberCombinations;

const uniqueOrigins=new Set(
generated.map(x=>x.origin)
);

const comparisons=state.numberComparisons.slice(-20);

return `
<div class="box">
<b>
TREINADOR GLOBAL NÚMEROS
• BASE V6.3.9 + TRIANGULAÇÃO
</b>

<p>
STATUS:
<strong class="${state.strategy==="NUMBER"?"good":"bad"}">
${state.strategy==="NUMBER"
?"CONTROLANDO A JOGADA":"ANÁLISE VIRTUAL"}
</strong>
</p>

<p>NÚMERO ATUAL: <strong>${trigger}</strong></p>

<p>
COMBINAÇÕES GERADAS NA JANELA:
<strong>${generated.length}</strong>
</p>

<p>
NÚMEROS DE ORIGEM DIFERENTES:
<strong>${uniqueOrigins.size}</strong>
</p>

<p>
COMBINAÇÕES COMPARADAS PARA O ${trigger}:
<strong>${ranked.length}</strong>
</p>

<p>
OCORRÊNCIAS ANTERIORES COM RESULTADO SEGUINTE:
<strong>${pairs.length}</strong>
</p>

<p>
MELHOR COMBINAÇÃO:
<strong>
${selected
?"GERADA PELO NÚMERO "+selected.origin
:"AGUARDANDO"}
</strong>
</p>

<p>
GIRO EM QUE FOI GERADA:
<strong>${selected?.turn??"—"}</strong>
</p>

<p>
COBERTURA DAS TRANSIÇÕES:
<strong>
${selected?selected.matches+"/"+selected.total:"—"}
</strong>
</p>

<p>
ÍNDICE COMPARATIVO:
<strong>
${selected?pct(selected.score,1):"—"}
</strong>
</p>

<p>
COBERTURA DOS PESOS DE TRIANGULAÇÃO:
<strong>
${selected?pct(selected.triangleScore,1):"—"}
</strong>
</p>

<p>TROCAS: ${state.numberChanges}</p>
</div>

<div class="title">
RANKING DAS COMBINAÇÕES PARA O NÚMERO ${trigger}
</div>

<div class="tablewrap">
<table>
<thead>
<tr>
<th>#</th>
<th>GERADA POR</th>
<th>GIRO</th>
<th>TRANSIÇÕES</th>
<th>COBERTAS</th>
<th>FORA</th>
<th>TRIANGULAÇÃO</th>
<th>ÍNDICE</th>
</tr>
</thead>
<tbody>

${ranked.map((r,i)=>`
<tr class="${i===0?"toprow":""}">
<td>${i+1}</td>
<td><strong>${r.origin}</strong></td>
<td>${r.turn}</td>
<td>${r.total}</td>
<td class="good">${r.matches}</td>
<td class="bad">${r.misses}</td>
<td>${pct(r.triangleScore,1)}</td>
<td>${pct(r.score,1)}</td>
</tr>
`).join("")}

</tbody>
</table>
</div>

<div class="title">
JOGADA ESCOLHIDA:
COMBINAÇÃO GERADA PELO NÚMERO ${selected?.origin??"—"}
</div>

<div class="centers">
${centersHTML(selected?.play)}
</div>

<div class="title">28 NÚMEROS COBERTOS</div>
${cloud(selected?.covered||[])}

<div class="title">9 DESCOBERTOS</div>
${cloud(missing(selected?.play))}

<div class="title">
RESULTADOS QUE VIERAM DEPOIS DO ${trigger}
</div>
${cloud(pairs.map(x=>x.next))}

<div class="title">
COMBINAÇÕES GERADAS CRONOLOGICAMENTE
</div>

<div class="tablewrap">
<table>
<thead>
<tr>
<th>GIRO</th>
<th>NÚMERO</th>
<th>6 CENTROS GERADOS</th>
</tr>
</thead>
<tbody>

${generated.slice().reverse().map(r=>`
<tr>
<td>${r.turn}</td>
<td><strong>${r.origin}</strong></td>
<td>${r.centers.join(" • ")}</td>
</tr>
`).join("")}

</tbody>
</table>
</div>

<div class="title">
ÚLTIMAS COMPARAÇÕES VIRTUAIS
</div>

${comparisons.slice().reverse().map(r=>`
<div class="listrow">
GATILHO ${r.trigger}
• COMBINAÇÃO DO ${r.sourceNumber}
• GIRO ${r.sourceTurn}
• RESULTADO ${r.next}

• <strong class="${r.covered?"good":"bad"}">
${r.covered?"COBERTO":"FORA"}
</strong>
</div>
`).join("")}

<div class="muted">
A SELEÇÃO CONTINUA NUMÉRICA:
TRANSIÇÕES DO GATILHO E PESOS DE TRIANGULAÇÃO.
ESTE TREINADOR NÃO USA GREEN/LOSS COMO CRITÉRIO.
OS ÍNDICES SÃO COMPARATIVOS HISTÓRICOS.
</div>
`;
}

/* ======================================================
 PAINEL TREINADOR GLOBAL ORIGINAL
====================================================== */

function trainerHTML() {
const ranked=trainerRanking();

const active=ranked.find(
r=>r.id===state.trainerChoice
);

const real=state.realG1.length;

const hits=state.realG1.filter(
r=>r.result==="GREEN G1"
).length;

const virtualGales=uniqueGales(null,5000);

return `
<div class="box">
<b>TREINADOR GLOBAL ORIGINAL + TRIANGULAÇÃO</b>

<p>
STATUS:
<strong class="${state.strategy==="TRAINER"?"good":"bad"}">
${state.strategy==="TRAINER"
?"CONTROLANDO A JOGADA":"ANÁLISE VIRTUAL"}
</strong>
</p>

<p>ESTRATÉGIAS: ${ranked.length}</p>

<p>
ATIVA:
${esc(active?.name||"AGUARDANDO")}
</p>

<p>GIROS DESDE A TROCA: ${state.trainerTurns}</p>
<p>TROCAS: ${state.trainerChanges}</p>

<p>
${state.trainerPending
?"TROCA PENDENTE — FECHAR GALE"
:"AVALIAÇÃO A CADA GIRO"}
</p>

<p>
CONTEXTO:
${esc(triangleContext(state.history))}
</p>

<p>
CICLOS DA ESTRATÉGIA ATIVA NESTE CONTEXTO:
${active?.contextTotal||0}
</p>

<p>
O RANKING COMBINA O HISTÓRICO VIRTUAL ORIGINAL
COM RESULTADOS ANTERIORES NO MESMO TIPO DE TRAJETO.
</p>

<p>
NÃO UTILIZA AS APROVAÇÕES DOS TREINADORES NUMÉRICOS.
</p>
</div>

<div class="box">
<b>TREINADOR GLOBAL G1</b>

<p>
STATUS:
<strong class="${state.g1Trainer?"good":"bad"}">
${state.g1Trainer?"ATIVADO":"DESATIVADO"}
</strong>
</p>

<p>GALES REAIS NA JANELA: ${real}</p>
<p>GREEN G1: ${hits}</p>
<p>LOSS: ${real-hits}</p>
<p>APROVEITAMENTO: ${pct(hits,real)}</p>
<p>GALES VIRTUAIS: ${virtualGales.length}</p>
<p>RUPTURAS: ${breakdown().RUPTURA.total}</p>
</div>

<div class="title">
RANKING DAS ESTRATÉGIAS
</div>

<div class="tablewrap">
<table>
<thead>
<tr>
<th>#</th>
<th>ESTRATÉGIA</th>
<th>CICLOS</th>
<th>ACERTOS</th>
<th>LOSS</th>
<th>TESTES NO TRAJETO</th>
<th>ÍNDICE</th>
</tr>
</thead>
<tbody>

${ranked.map((r,i)=>`
<tr>
<td>${i+1}</td>
<td>${esc(r.name)}</td>
<td>${r.total}</td>
<td>${r.hits}</td>
<td>${r.loss}</td>
<td>${r.contextTotal}</td>
<td>${pct(r.score,1)}</td>
</tr>
`).join("")}

</tbody>
</table>
</div>

<div class="title">
ÚLTIMAS TROCAS
</div>

${state.trainerHistory.slice(-12).reverse().map(x=>`
<div class="listrow">
GIRO ${x.turn}
• ${esc(x.from)} → ${esc(x.to)}

<div class="muted">
${esc(x.triangleKey||"SEM CONTEXTO")}
</div>
</div>
`).join("")}
`;
}

/* ======================================================
 RANKING EXCLUSIVO G1
====================================================== */

function g1RankingHTML() {
const ranked=[
...definitions(),
{id:"NUMBER",name:"TREINADOR GLOBAL NÚMEROS"},
{id:N10,name:"TREINADOR GLOBAL NÚMEROS 1.0"}
].map(def=>{
const modes=G1_MODES.map(mode=>({
mode,
...defenseMetrics(def.id,mode,300)
}));

const best=[...modes].sort((a,b)=>{
const base=28/37;

const sa=(a.hits+base*12)/(a.total+12);
const sb=(b.hits+base*12)/(b.total+12);

return sb-sa;
})[0];

return {...def,modes,best};

}).sort((a,b)=>{
const base=28/37;

const sa=
(a.best.hits+base*12)/(a.best.total+12);

const sb=
(b.best.hits+base*12)/(b.best.total+12);

return sb-sa;
});

return `
<div class="box">
<b>RANKING EXCLUSIVO DE G1</b>

<p>APENAS ENTRADAS QUE CHEGARAM AO GALE.</p>
<p>AS TRÊS DEFESAS SÃO TESTADAS NO MESMO RESULTADO.</p>
<p>CADA GALE É CONTADO UMA VEZ NO TOTAL DE EVENTOS.</p>
<p>A SELEÇÃO ATUAL TAMBÉM CONSIDERA TRIANGULAÇÃO.</p>
</div>

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
</tr>
</thead>
<tbody>

${ranked.map((r,i)=>`
<tr>
<td>${i+1}</td>
<td>${esc(r.name)}</td>
<td>${uniqueGales(r.id,500).length}</td>
<td>${esc(r.best.mode)}</td>
<td class="good">${r.best.hits}</td>
<td class="bad">${r.best.loss}</td>
<td>${pct(r.best.hits,r.best.total)}</td>
</tr>
`).join("")}

</tbody>
</table>
</div>

<div class="title">
CONTINUIDADE / DESLOCAMENTO / RUPTURA
</div>

${breakdownHTML()}

<div class="title">
COMPARAÇÃO DAS TRÊS DEFESAS
</div>

${ranked.map(r=>`
<div class="box">
<b>${esc(r.name)}</b>

<div class="tablewrap">
<table>
<thead>
<tr>
<th>DEFESA</th>
<th>GALES</th>
<th>GREEN G1</th>
<th>LOSS</th>
<th>ACERTO</th>
</tr>
</thead>
<tbody>

${r.modes.map(m=>`
<tr>
<td>${esc(m.mode)}</td>
<td>${m.total}</td>
<td class="good">${m.hits}</td>
<td class="bad">${m.loss}</td>
<td>${pct(m.hits,m.total)}</td>
</tr>
`).join("")}

</tbody>
</table>
</div>
</div>
`).join("")}
`;
}

/* ======================================================
 G1 POR NÚMERO
====================================================== */

function g1NumbersHTML() {
const cs=motors(state.history);

const original=
state.cycle?.original||
activeMotor(cs);

if(!validPlay(original?.play)) {
return `<div class="box">AGUARDANDO HISTÓRICO.</div>`;
}

const strategy=
state.cycle?.strategy||
activeDefinition().id;

const trigger=
state.cycle?.trigger??
state.history.at(-1);

if(trigger==null)return "";

const reading=behaviorReading(
original,state.history,strategy,trigger
);

const options=defenses(
original,trigger,state.history,strategy
);

const decision=
state.cycle?.decision||
chooseG1(
original,trigger,state.history,strategy
);

const numberGales=numberG1Events(
strategy,trigger,100
);

return `
<div class="box">
<b>TREINADOR GLOBAL G1 POR NÚMERO</b>

<p>
STATUS:
<strong class="${state.g1Trainer?"good":"bad"}">
${state.g1Trainer?"ATIVO":"DESLIGADO"}
</strong>
</p>

<p>ESTRATÉGIA: ${esc(strategy)}</p>
<p>MOTOR: ${esc(original.key)}</p>

<p>
NÚMERO GATILHO:
<strong>${trigger}</strong>
</p>

<p>
COMPORTAMENTO:
<strong>${reading.type}</strong>
</p>

<p>
TRIANGULAÇÃO:
<strong>${esc(reading.triangle)}</strong>
</p>

<p>GALES VIRTUAIS DESTE NÚMERO: ${numberGales.length}</p>
<p>GREEN G1 DO NÚMERO: ${reading.numberHit}</p>
<p>LOSS DO NÚMERO: ${reading.numberLoss}</p>

<p>
LOSS ÚLTIMOS 12 GALES:
${reading.loss12}/${reading.total12}
</p>

<p>
LOSS ÚLTIMOS 6 GALES:
${reading.loss6}/${reading.total6}
</p>

<p>
RESULTADOS FORA DA COBERTURA, ÚLTIMOS 6:
${reading.outside6}
</p>

<p>SEQUÊNCIA DE LOSS: ${reading.streak}</p>

<p>
DEFESA ESCOLHIDA:
<strong>${esc(decision?.mode||"—")}</strong>
</p>
</div>

<div class="title">
COMPARAÇÃO DAS DEFESAS PARA O NÚMERO ${trigger}
</div>

<div class="tablewrap">
<table>
<thead>
<tr>
<th>DEFESA</th>
<th>TESTES Nº</th>
<th>GREEN G1</th>
<th>LOSS</th>
<th>ACERTO</th>
</tr>
</thead>
<tbody>

${G1_MODES.map(mode=>{
const m=numberG1Metrics(
strategy,trigger,mode,100
);

return `
<tr>
<td>${esc(mode)}</td>
<td>${m.total}</td>
<td class="good">${m.hits}</td>
<td class="bad">${m.loss}</td>
<td>${pct(m.hits,m.total)}</td>
</tr>`;
}).join("")}

</tbody>
</table>
</div>

<div class="title">
9 DESCOBERTOS DA ENTRADA
</div>

${cloud(missing(original.play))}

${options.map(option=>{
const m=defenseMetrics(
strategy,option.mode,100
);

const nm=numberG1Metrics(
strategy,trigger,option.mode,100
);

return `
<div class="g1card ${
decision?.mode===option.mode?"selected":""
}">
<b>${esc(option.mode)}</b>

<div class="centers">
${centersHTML(option.motor.play)}
</div>

<div class="muted">
28 COBERTOS • 9 DESCOBERTOS
</div>

${cloud(missing(option.motor.play))}

<div class="muted">
GLOBAL:
GALES ${m.total}
• GREEN G1 ${m.hits}
• LOSS ${m.loss}
• ACERTO ${pct(m.hits,m.total)}
</div>

<div class="muted">
NÚMERO ${trigger}:
GALES ${nm.total}
• GREEN G1 ${nm.hits}
• LOSS ${nm.loss}
• ACERTO ${pct(nm.hits,nm.total)}
</div>

<div class="muted">
COBERTURA DOS PESOS DE TRIANGULAÇÃO:
${pct(triangleCoverage(option.motor.play,state.history),1)}
</div>
</div>`;
}).join("")}

<div class="title">
CONTINUIDADE / DESLOCAMENTO / RUPTURA
</div>

${breakdownHTML(strategy)}

<div class="title">
ÚLTIMOS GALES REAIS DA JANELA
</div>

${state.realG1.slice(-12).reverse().map(r=>`
<div class="listrow">
GIRO ${r.turn}
• NÚMERO ${r.trigger}
• ${esc(r.mode)}
• <b>${esc(r.result)}</b>
• ${esc(r.behavior)}
</div>
`).join("")}
`;
}

/* ======================================================
 SALTOS / ESPELHO / LINHA DO TEMPO
====================================================== */

function jumpsHTML() {
const analysis=analyze(state.history);

return `
<div class="box">
<b>SALTOS E DIREÇÃO</b>

<p>
NUMÉRICO:
${analysis.numericStreak.dir>0
?"CRESCENTE"
:analysis.numericStreak.dir<0
?"DECRESCENTE":"MISTO"}
• ${analysis.numericStreak.length} PASSOS
</p>

<p>
FÍSICO:
${analysis.physicalStreak.dir>0
?"HORÁRIO"
:analysis.physicalStreak.dir<0
?"ANTI-HORÁRIO":"MISTO"}
• ${analysis.physicalStreak.length} PASSOS
</p>

<p>MÉDIA ÚLTIMOS 3: ${fmt(analysis.mean3)}</p>
<p>MÉDIA ANTERIOR: ${fmt(analysis.previous3)}</p>
<p>VARIAÇÃO: ${fmt(analysis.acceleration)}</p>

<p>
A DIREÇÃO FÍSICA É A CONVENÇÃO DO MENOR SALTO EM W,
NÃO UMA MEDIÇÃO DO MOVIMENTO DA BOLA.
</p>
</div>

<div class="title">
AUSÊNCIA POR REGIÃO
</div>

${Object.entries(analysis.regions).map(([name,x])=>`
<div class="listrow">
${name}
• AUSÊNCIA: ${x.absence}
• ÚLTIMOS 12: ${x.recent}
</div>
`).join("")}

<div class="title">
ÚLTIMAS TRANSIÇÕES
</div>

${analysis.transitions.slice(-12).reverse().map(x=>`
<div class="listrow">
${x.from} → ${x.to}
• ${x.distance} CASAS
• ${x.physical>0
?"HORÁRIO"
:x.physical<0?"ANTI-HORÁRIO":"PARADO"}
</div>
`).join("")}
`;
}

function mirrorsHTML() {
const recent=state.history.slice(-20);
const last=state.history.at(-1);

const near=last==null
?[]:W.filter(
n=>MIRROR.has(n)&&distance(last,n)<=4
);

const far=last==null
?[]:W.filter(
n=>MIRROR.has(n)&&distance(last,n)>=10
);

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
${cloud(near)}

<div class="title">ESPELHOS DISTANTES</div>
${cloud(far)}

<div class="title">TODOS OS ESPELHOS</div>
${cloud(W.filter(n=>MIRROR.has(n)))}

<div class="title">ANTIESPELHOS</div>
${cloud(W.filter(n=>!MIRROR.has(n)))}
`;
}

function timelineHTML() {
return state.ledger.slice(-60).reverse().map(r=>`
<div class="listrow">
<b>GIRO ${r.turn}</b>
• ${r.number}
• ${esc(r.result)}

<div class="muted">
GATILHO ${r.trigger??"—"}
• ${esc(r.strategy)}
• ${esc(r.motor)}
• ${region(r.number)}
• ${mirror(r.number)}
</div>

<div class="muted">
TRIANGULAÇÃO ANTES DO RESULTADO:
${esc(r.triangleKey||"SEM CONTEXTO")}
</div>

${r.numberCandidate!=null?`
<div class="muted">
TREINADOR NÚMEROS:
COMBINAÇÃO DO ${r.numberCandidate}
• GERADA NO GIRO ${r.numberCandidateTurn}
</div>
`:""}
</div>
`).join("");
}

/* ======================================================
 CSS
====================================================== */

const css=`
*{box-sizing:border-box}
body{
margin:0;
background:#101720;
color:#f4f7fb;
font-family:Arial,sans-serif;
font-size:13px
}
.app{max-width:1100px;margin:auto;padding:12px}
h1{
font-size:24px;
text-align:center;
color:#59e5ff;
margin:15px 0 5px
}
.sub{
text-align:center;
font-size:11px;
color:#b3c7d9;
line-height:1.7;
margin-bottom:15px
}
.panel{
background:#1d2938;
border:1px solid #405a73;
border-radius:11px;
padding:12px;
margin:10px 0
}
.title{
color:#47e1f8;
font-size:12px;
font-weight:bold;
margin:13px 0
}
.row{
display:flex;
flex-wrap:wrap;
gap:6px;
margin:9px 0
}
.btn{
background:#304359;
border:1px solid #708aa6;
border-radius:7px;
color:white;
padding:10px;
font-size:11px;
font-weight:bold;
cursor:pointer
}
.btn.active{
background:#087e9c;
border-color:#4eeaff
}
.btn.trainer{
background:#263f4c;
border-color:#4d8191
}
.btn.trainer.active,
.btn.trainer.on{
background:#086c4d;
border:2px solid #42ffb0;
color:white;
box-shadow:
0 0 13px #27e99a77,
inset 0 0 8px #27e99a33
}
.btn.number.active{
background:#705200;
border:2px solid #ffdf60;
color:white;
box-shadow:
0 0 16px #ffce3677,
inset 0 0 8px #ffce3633
}
.btn.number10.active{
background:#512884;
border:2px solid #d6a3ff;
box-shadow:0 0 16px #ae67ff77
}
.btn:disabled,
.key:disabled{
opacity:.35;
cursor:not-allowed
}
textarea{
width:100%;
height:88px;
padding:10px;
border-radius:8px;
background:#0c1623;
border:1px solid #62758b;
color:white
}
.status{
font-size:12px;
color:#b5d7e8;
padding:9px 0
}
.progress{
background:#101e2c;
border:1px solid #476581;
border-radius:9px;
padding:12px;
margin:10px 0
}
.progress strong{
font-size:25px;
color:#59e5ff
}
.progress.waiting{
border:2px solid #ffd15c;
background:#42351b
}
.progress.waiting strong{color:#ffd15c}
.bar{
height:12px;
background:#34475a;
border-radius:20px;
overflow:hidden;
margin:10px 0
}
.barfill{
height:100%;
background:#31dca9;
transition:width .2s
}
.barfill.waiting{background:#ffd15c}
.centers{
display:grid;
grid-template-columns:repeat(6,minmax(0,1fr));
gap:5px;
margin:12px 0
}
.center{
min-height:86px;
min-width:0;
padding:8px 2px;
border:2px solid #20d7f4;
border-radius:9px;
background:#086c91;
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
gap:5px;
text-align:center
}
.center.short{
background:#d2a62b;
border-color:#ffe28a;
color:#111
}
.center strong{
font-size:clamp(27px,5vw,43px);
line-height:1;
font-weight:900
}
.center small{
font-size:9px;
font-weight:bold
}
.keys{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:5px
}
.key{
height:44px;
border:1px solid #71849b;
border-radius:7px;
color:white;
font-size:16px;
font-weight:bold;
cursor:pointer
}
.key.zero{grid-column:span 6}
.history{
display:flex;
flex-wrap:wrap;
gap:5px
}
.chip{
min-width:47px;
padding:8px;
border:2px solid #667f99;
border-radius:7px;
text-align:center
}
.chip b{display:block;font-size:18px}
.chip small{font-size:9px}
.chip.green{border:3px solid #29e99a}
.chip.loss{border:3px solid #ff416e}
.chip.gale{border:3px solid #ffe045}
.metrics{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:6px
}
.metric{
background:#293c51;
border-radius:8px;
padding:11px 5px;
text-align:center
}
.metric small{
display:block;
font-size:9px;
color:#bbd0e2
}
.metric b{
display:block;
font-size:22px;
margin-top:5px
}
.good{color:#4ee4a4}
.bad{color:#ff778c}
.box{
background:#132235;
border:1px solid #46617d;
border-radius:9px;
padding:12px;
margin:9px 0;
line-height:1.7
}
.g1card{
background:#142438;
border:1px solid #55728f;
border-radius:9px;
padding:12px;
margin:9px 0
}
.g1card.selected{
border:2px solid #38e6aa;
background:#10382e
}
.cloud{
display:flex;
flex-wrap:wrap;
gap:5px;
margin:9px 0
}
.cloud span{
display:inline-flex;
min-width:36px;
height:36px;
align-items:center;
justify-content:center;
background:#2b4058;
border:1px solid #64829f;
border-radius:7px;
font-weight:bold
}
.cloud span.danger{
background:#69283e;
border-color:#ff6989
}
.tablewrap{overflow:auto}
table{
width:100%;
min-width:610px;
border-collapse:collapse;
font-size:11px
}
td,th{
padding:9px;
text-align:left;
border-bottom:1px solid #41556e
}
th{color:#57def4}
tr.toprow{background:#184a3d}
.listrow{
border-bottom:1px solid #35485d;
padding:9px 2px;
font-size:11px;
line-height:1.7
}
.muted{
color:#b1c7d9;
font-size:11px;
line-height:1.7;
overflow-wrap:anywhere
}
.head{
width:100%;
background:#2c4056;
color:white;
border:1px solid #66829f;
border-radius:8px;
padding:12px;
font-weight:bold;
text-align:left;
cursor:pointer;
display:flex;
justify-content:space-between;
gap:8px
}
.hide{display:none}
input[type=number]{
width:110px;
padding:9px;
background:#101b2a;
color:white;
border:1px solid #637b95;
border-radius:7px
}
select{
padding:10px;
background:#101b2a;
color:white;
border:1px solid #8d6eb0;
border-radius:7px;
max-width:100%
}
.play10{
position:relative;
min-height:86px
}
#centers{position:relative}
.reject10{
position:absolute;
left:0;
right:0;
top:50%;
transform:translateY(-50%);
z-index:3;
background:#d20b2b;
color:white;
border:2px solid #ff8c9c;
text-align:center;
font-size:clamp(19px,5vw,31px);
font-weight:900;
padding:8px 4px;
box-shadow:0 3px 18px #000b;
pointer-events:none
}
.reject10 small{
display:block;
font-size:10px;
line-height:1.4;
margin-top:3px
}
.triangleDrawing{
max-width:540px;
margin:10px auto
}
.triangleDrawing svg{
display:block;
width:100%;
height:auto
}
#overlay{
display:none;
position:fixed;
inset:0;
background:rgba(5,12,20,.96);
z-index:999999;
align-items:center;
justify-content:center;
padding:20px
}
#overlay.show{display:flex}
.overlayBox{
width:min(440px,100%);
background:#1d3143;
border:2px solid #3ce6bc;
border-radius:16px;
padding:30px 20px;
text-align:center;
box-shadow:0 0 35px #18a57b55
}
.spinner{
width:60px;
height:60px;
margin:20px auto;
border:6px solid #36536b;
border-top-color:#3ce6bc;
border-radius:50%;
animation:spin .8s linear infinite
}
@keyframes spin{
to{transform:rotate(360deg)}
}
@media(max-width:600px){
.center{min-height:79px}
.center strong{font-size:clamp(25px,7vw,37px)}
.center small{font-size:8px}
.btn{font-size:10px;padding:9px}
}
`;

/* ======================================================
 ESTRUTURA DA TELA
====================================================== */

document.body.innerHTML=`
<style>${css}</style>

<div id="overlay">
<div class="overlayBox">

<h2>ANÁLISE BETA V${VERSION}</h2>

<div class="spinner"></div>

<h2>RECALCULANDO ANÁLISES</h2>

<p id="overlayMessage">
PREPARANDO NOVA JANELA DE 70 NÚMEROS
</p>

<div class="muted">
REINICIANDO OS 12 MOTORES,
TRIANGULAÇÃO, TREINADOR GLOBAL,
TREINADORES NUMÉRICOS, G1 E DEFESAS.
</div>

<div class="muted">
OS REGISTROS MANUAIS PERMANECEM ARQUIVADOS.
</div>

</div>
</div>

<main class="app">

<h1>ANÁLISE BETA V${VERSION}</h1>

<div class="sub">
12 MOTORES • 28 NÚMEROS • TRIANGULAÇÃO INTEGRADA
<br>
7 ORIGINAIS • 12 ADAPTATIVAS • 4 AUTO • PERSONALIZADAS
<br>
TREINADOR GLOBAL • DOIS TREINADORES NUMÉRICOS • G1
<br>
JANELA 70 + 10
<br>
RECÁLCULO SOMENTE APÓS ENCERRAR O CICLO REAL
</div>

<section class="panel">

<div class="title">IMPORTAR HISTÓRICO</div>

<textarea id="paste"
placeholder="Cole os números do mais antigo ao mais recente"></textarea>

<div class="row">
<button class="btn" id="import">IMPORTAR</button>
<button class="btn" id="restore">RECUPERAR HISTÓRICO</button>
<button class="btn" id="undo">APAGAR ÚLTIMO MANUAL</button>
<button class="btn" id="clear">ZERAR TUDO</button>
</div>

<div class="status" id="status"></div>

<div class="progress" id="progressPanel">

<div class="muted">
LANÇAMENTOS MANUAIS DO CICLO
</div>

<strong id="counter">0 / 10</strong>

<div class="bar">
<div class="barfill" id="barfill"></div>
</div>

<div class="muted" id="windowInfo"></div>
<div class="muted" id="recalcStatus"></div>

</div>
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
<div class="title">ÚLTIMOS 14 NÚMEROS</div>
<div class="history" id="last"></div>
</section>

${[
["general","RESULTADO GERAL"],
["trainer","TREINADOR GLOBAL"],
["numbertrainer","TREINADOR GLOBAL NÚMEROS"],
["numbertrainer10","TREINADOR GLOBAL NÚMEROS 1.0"],
["triangulation","TRIANGULAÇÃO / TRINCAS / RETORNOS"],
["g1ranking","RANKING EXCLUSIVO G1 / RUPTURA"],
["g1numbers","TREINADOR GLOBAL G1 POR NÚMERO / DEFESAS"],
["motors","12 MOTORES"],
["jumps","SALTOS E DIREÇÃO"],
["mirrors","ESPELHO / ANTIESPELHO"],
["timeline","LINHA DO TEMPO"],
["lab","LABORATÓRIO"]
].map(([id,title])=>`
<section class="panel">
<button class="head" data-panel="${id}">
${title}
<span>−</span>
</button>

<div id="${id}"></div>
</section>
`).join("")}

<section class="panel">

<div class="title">FICHAS</div>

<div class="row">

<label>
VALOR DA FICHA
<input id="stake"
type="number" min=".01" step=".01">
</label>

<label>
MULTIPLICADOR G1
<input id="multiplier"
type="number" min=".01" step=".01">
</label>

</div>
</section>

<div class="box">
A CADA 10 LANÇAMENTOS MANUAIS,
O SISTEMA RECALCULA OS 70 NÚMEROS MAIS RECENTES.

SE EXISTIR GALE OU OUTRA ETAPA REAL PENDENTE,
AGUARDA O ENCERRAMENTO DO CICLO.

MOTORES, TRIANGULAÇÃO E TREINADORES
SÃO REPROCESSADOS CRONOLOGICAMENTE.

OS REGISTROS MANUAIS ANTERIORES
PERMANECEM ARQUIVADOS.

AS LEITURAS SÃO HISTÓRICAS E COMPARATIVAS.
</div>

</main>
`;

/* ======================================================
 BOTÕES DAS ESTRATÉGIAS
====================================================== */

function changeStrategy(
strategy,adaptive=null,created=null
) {
if(busy)return;

if(!canRecalculate()) {
alert(
"AGUARDE ENCERRAR O CICLO ATUAL "+
"ANTES DE TROCAR A ESTRATÉGIA."
);
return;
}

state.strategy=strategy;
state.adaptive=adaptive||state.adaptive;
state.activeCreated=created;
state.manual=null;

if(
strategy==="TRAINER"&&
!state.trainerChoice
)updateTrainer();

if(strategy==="NUMBER")updateNumberChoice();
if(strategy===N10)prepare10(state.history);

save();
render();
}

function buildStrategies() {
const root=$("strategies");
root.innerHTML="";

const groups=[
[
"TREINADORES INDEPENDENTES",
[
{
label:"TREINADOR GLOBAL",
id:"TRAINER",
action:()=>changeStrategy("TRAINER")
},
{
label:"TREINADOR GLOBAL NÚMEROS",
id:"NUMBER",
action:()=>changeStrategy("NUMBER")
},
{
label:"TREINADOR GLOBAL NÚMEROS 1.0",
id:N10,
action:()=>changeStrategy(N10)
}
]
],
[
"ORIGINAIS",
ORIGINALS.map(([id,name])=>({
label:name,
id,
action:()=>changeStrategy(id)
}))
],
[
"12 ADAPTATIVAS",
ADAPTATIVES.map(config=>({
label:config.name,
id:config.id,
action:()=>changeStrategy(
"ADAPTIVE",config.id
)
}))
]
];

for(const [label,items] of groups) {
const group=document.createElement("div");

group.innerHTML=`
<div class="title">${label}</div>
`;

const row=document.createElement("div");
row.className="row";

for(const item of items) {
const element=button(
item.label,
item.action,
row,
item.id==="TRAINER"?"trainer":
item.id==="NUMBER"?"number":
item.id===N10?"number10":""
);

element.dataset.choice=item.id;
}

group.appendChild(row);
root.appendChild(group);
}

const rankRow=document.createElement("div");
rankRow.className="row";

for(let i=1;i<=4;i++) {
const element=button(
"AUTO "+i+"º",
()=>{
if(busy)return;

if(!canRecalculate()) {
alert("AGUARDE ENCERRAR O CICLO ATUAL.");
return;
}

state.rank=i;
changeStrategy("FIXED");
},
rankRow
);

element.dataset.rank=i;
}

root.appendChild(rankRow);

if(state.created.length) {
const group=document.createElement("div");

group.innerHTML=`
<div class="title">
ESTRATÉGIAS PERSONALIZADAS
</div>
`;

const row=document.createElement("div");
row.className="row";

for(const custom of state.created) {
const element=button(
custom.name,
()=>changeStrategy(
"CREATED",null,"CREATED:"+custom.id
),
row
);

element.dataset.created=custom.id;
}

group.appendChild(row);
root.appendChild(group);
}
}

/* ======================================================
 OPÇÕES G1
====================================================== */

const OPTIONS=[
["g1Trainer","TREINADOR GLOBAL G1"],
["g1","G1 AJUSTE FINO"],
["galeSkip","GALE 2ª RODADA"],
["secondHouse","2ª CASA"]
];

for(const [field,label] of OPTIONS) {
const element=button(
label,
()=>{
if(busy)return;

if(!canRecalculate()) {
alert(
"AGUARDE ENCERRAR O CICLO "+
"ANTES DE ALTERAR O G1."
);
return;
}

state[field]=!state[field];
save();
render();
},
$("options"),
field==="g1Trainer"?"trainer":""
);

element.dataset.option=field;
}

/* ======================================================
 TECLADO
====================================================== */

for(let n=0;n<=36;n++) {
const element=document.createElement("button");

element.className=
"key"+(n===0?" zero":"");

element.textContent=n;

element.style.background=
n===0?"#087b50":
RED.has(n)?"#ac293f":"#12151b";

element.onclick=()=>addManual(n);

$("keys").appendChild(element);
}

/* ======================================================
 AÇÕES
====================================================== */

$("import").onclick=()=>{
importHistory(
parseInput($("paste").value)
);
};

$("restore").onclick=async()=>{
if(busy)return;

let found=null;

for(const key of [KEY,...OLD_KEYS]) {
const data=read(key);

if(data?.history?.length) {
found=data;
break;
}
}

if(!found) {
alert(
"NENHUM HISTÓRICO ANTERIOR ENCONTRADO."
);
return;
}

await importHistory(
cleanNumbers(found.history)
);
};

$("undo").onclick=undo;
$("clear").onclick=clearAll;

$("stake").onchange=()=>{
state.stake=Math.max(
.01,
Number($("stake").value)||1
);

save();
render();
};

$("multiplier").onchange=()=>{
state.multiplier=Math.max(
.01,
Number($("multiplier").value)||1
);

save();
render();
};

document.addEventListener("click",event=>{
const element=event.target.closest(
"[data-panel]"
);

if(!element)return;

const id=element.dataset.panel;

state.open[id]=!state.open[id];

save();
render();
});

/* ======================================================
 RENDERIZAÇÃO
====================================================== */

function render() {
try {
performRender();

} catch(e) {
console.error("ANÁLISE BETA:",e);

if($("status")) {
$("status").textContent=
"ERRO: "+String(e.message||e);
}
}
}

function performRender() {
buildStrategies();

const cs=motors(state.history);
const definition=activeDefinition();

const motor=
state.defense||
activeMotor(cs);

const play=motor?.play||null;

const waiting=
(
state.manualCount>=MANUAL_LIMIT||
state.migrationPending
)&&!canRecalculate();

$("status").textContent=
state.history.length+
" NÚMEROS NA JANELA • "+
cs.length+"/12 MOTORES • "+
state.phase+
" • TRIANGULAÇÃO ATIVA"+
(saveError
?" • FALHA AO SALVAR: "+saveError
:"");

$("counter").textContent=
state.manualCount+" / "+MANUAL_LIMIT;

$("barfill").style.width=
Math.min(
100,
100*state.manualCount/MANUAL_LIMIT
)+"%";

$("progressPanel").classList.toggle(
"waiting",waiting
);

$("barfill").classList.toggle(
"waiting",waiting
);

$("windowInfo").textContent=
"JANELA BASE: 70 NÚMEROS • "+
"MANUAIS RESTANTES: "+
Math.max(
0,MANUAL_LIMIT-state.manualCount
)+
" • RECÁLCULOS CONCLUÍDOS: "+
state.cyclesCompleted;

$("recalcStatus").textContent=
state.migrationPending
?"ATUALIZAÇÃO DA JANELA PENDENTE — "+
"AGUARDANDO ENCERRAR O CICLO REAL"
:waiting
?"RECÁLCULO PENDENTE — "+
"AGUARDANDO ENCERRAR "+state.phase
:state.manualCount>=MANUAL_LIMIT
?"RECÁLCULO PRONTO"
:"PRÓXIMO RECÁLCULO AO COMPLETAR "+
MANUAL_LIMIT+" MANUAIS E FECHAR O CICLO";

for(const element of document.querySelectorAll(
"[data-choice]"
)) {
const choice=element.dataset.choice;

const active=
state.strategy==="TRAINER"
?choice==="TRAINER":
state.strategy==="NUMBER"
?choice==="NUMBER":
state.strategy===N10
?choice===N10:
state.strategy==="ADAPTIVE"
?choice===state.adaptive:
choice===state.strategy;

element.classList.toggle(
"active",active
);
}

for(const element of document.querySelectorAll(
"[data-rank]"
)) {
element.classList.toggle(
"active",
state.strategy==="FIXED"&&
state.rank===Number(element.dataset.rank)
);
}

for(const element of document.querySelectorAll(
"[data-option]"
)) {
const active=
!!state[element.dataset.option];

element.classList.toggle("active",active);

element.classList.toggle(
"on",
active&&
element.dataset.option==="g1Trainer"
);
}

for(const element of document.querySelectorAll(
"[data-created]"
)) {
element.classList.toggle(
"active",
state.strategy==="CREATED"&&
state.activeCreated===
"CREATED:"+element.dataset.created
);
}

const strategyLabel=
state.cycle?.strategy||
definition.name;

const entry10=
state.cycle?.original||motor;

const record10=
entry10?.type===N10&&entry10.recordId
?state.n10.books[entry10.trigger]
?.records[entry10.recordId]
:null;

$("selected").textContent=
strategyLabel+
" • MOTOR "+
(motor?.key||"AGUARDANDO")+
" • "+state.phase+
(
state.cycle?.decision
?" • G1 "+state.cycle.decision.mode+
" • "+state.cycle.decision.behavior
:""
)+
(
state.strategy==="NUMBER"
?" • JOGADA INDEPENDENTE POR NÚMERO"
:""
)+
(
state.strategy===N10
?" • "+
(record10
?recordStatus10(record10)
:"SEM COMBINAÇÃO ELEGÍVEL")
:""
)+
" • TRAJETO "+
(
triangleAnalysis(state.history)
.last?.type||"SEM TRINCA"
);

$("centers").innerHTML=
centersHTML(play)+
(
record10?.status==="REJECTED"
?`
<div class="reject10">
NÃO JOGAR
<small>
REPROVADA PARA O GATILHO ${record10.trigger}
${state.cycle
?" • CICLO ATUAL PERMANECE CONGELADO ATÉ ENCERRAR"
:""}
</small>
</div>
`
:""
);

$("coverage").textContent=play
?"28 COBERTOS • 9 DESCOBERTOS: "+
missing(play).join(" • ")
:state.history.length<8
?"IMPORTE PELO MENOS 8 NÚMEROS."
:state.strategy===N10
?"SEM GEOMETRIA ELEGÍVEL. REPROVADAS NÃO SERÃO REUTILIZADAS."
:"AGUARDANDO COMBINAÇÃO.";

const last=state.history.slice(-14);
const start=state.history.length-last.length;

$("last").innerHTML=last.map((n,i)=>{
const turn=start+i+1;

const row=state.ledger.find(
r=>r.turn===turn
);

const result=row?.result||"HISTÓRICO";

const cls=result==="LOSS"
?"loss"
:result.startsWith("GREEN")
?"green"
:result==="GALE"
?"gale":"";

return `
<div class="chip ${cls}"
style="background:${
n===0?"#087b50":
RED.has(n)?"#a72740":"#14181f"
}">
<b>${n}</b>
<small>${esc(result)}</small>
</div>
`;
}).reverse().join("");

/* RESULTADO GERAL */

if(state.open.general) {
$("general").innerHTML=`
<div class="title">
RESULTADOS DO HISTÓRICO ATUAL
</div>

${metricsHTML(
state.ledger.filter(
r=>r.source==="HISTÓRICO"
)
)}

<div class="title">
RESULTADOS MANUAIS ARQUIVADOS
</div>

${metricsHTML(state.manualLog)}

<div class="box">
<b>REGISTROS MANUAIS:</b>
${state.manualLog.length}

<p>
GREEN, GREEN G1 E LOSS
PERMANECEM ARQUIVADOS APÓS O RECÁLCULO.
</p>

<p>
NÃO SÃO USADOS COMO TREINAMENTO
DA NOVA JANELA.
</p>
</div>

<div class="title">
ÚLTIMOS RESULTADOS MANUAIS
</div>

${state.manualLog.slice(-25).reverse().map(r=>`
<div class="listrow">
<b>${r.number}</b>

• <strong class="${
r.result==="LOSS"?"bad":"good"
}">
${esc(r.result)}
</strong>

• ${esc(r.motor)}
• ${fmt(r.profit)}
</div>
`).join("")}
`;
}

/* TREINADORES */

if(state.open.trainer) {
$("trainer").innerHTML=trainerHTML();
}

if(state.open.numbertrainer) {
$("numbertrainer").innerHTML=
numberTrainerHTML();
}

if(state.open.numbertrainer10) {
$("numbertrainer10").innerHTML=
numberTrainer10HTML();

if($("trigger10")) {
$("trigger10").onchange=()=>{
if(busy)return;

state.n10.viewTrigger=
$("trigger10").value;

save();
render();
};
}

if($("all10")) {
$("all10").onclick=()=>{
if(busy)return;

state.n10.viewAll=
!state.n10.viewAll;

save();
render();
};
}

for(const element of document.querySelectorAll(
"[data-trigger10]"
)) {
element.onclick=()=>{
if(busy)return;

state.n10.viewTrigger=
element.dataset.trigger10;

save();
render();
};
}
}

if(state.open.triangulation) {
$("triangulation").innerHTML=
triangulationHTML();
}

if(state.open.g1ranking) {
$("g1ranking").innerHTML=
g1RankingHTML();
}

if(state.open.g1numbers) {
$("g1numbers").innerHTML=
g1NumbersHTML();
}

/* 12 MOTORES */

if(state.open.motors) {
$("motors").innerHTML=`
<div class="row">

${cs.map(candidate=>`
<button class="btn"
data-manual="${candidate.key}">
${esc(candidate.key)}
</button>
`).join("")}

</div>

${cs.map(candidate=>`
<div class="listrow">
<b>
${candidate.rank}º ${esc(candidate.key)}
</b>
• ${fmt(candidate.score)}

<div class="muted">
CENTROS:
${sortedBlocks(candidate.play)
.map(block=>block.center)
.join(" • ")}
</div>

<div class="muted">
HISTÓRICO VIRTUAL:
${state.ledger.filter(
r=>r.motorHits&&candidate.key in r.motorHits
).length}
TESTES
• ÍNDICE ${pct(motorRate(candidate.key,70),1)}
</div>

<div class="muted">
TRIANGULAÇÃO:
${pct(candidate.triangleScore,1)}
• ${esc(candidate.triangleKey)}
</div>
</div>
`).join("")}
`;

for(const element of document.querySelectorAll(
"[data-manual]"
)) {
element.classList.toggle(
"active",
state.manual===element.dataset.manual
);

element.onclick=()=>{
if(busy)return;

if(!canRecalculate()) {
alert("AGUARDE ENCERRAR O CICLO.");
return;
}

state.manual=element.dataset.manual;
save();
render();
};
}
}

/* DEMAIS PAINÉIS */

if(state.open.jumps) {
$("jumps").innerHTML=jumpsHTML();
}

if(state.open.mirrors) {
$("mirrors").innerHTML=mirrorsHTML();
}

if(state.open.timeline) {
$("timeline").innerHTML=timelineHTML();
}

if(state.open.lab) {
$("lab").innerHTML=`
<div class="box">
7 ORIGINAIS •
12 ADAPTATIVAS •
4 POSIÇÕES AUTO •
PERSONALIZADAS
</div>

<div class="box">
TRIANGULAÇÃO:
MEMÓRIA DE PARES,
TRINCAS,
SALTOS,
RETORNO À ORIGEM,
CORDAS,
ÁREA E ÂNGULOS.
</div>

<div class="box">
OS 12 MOTORES RECEBEM OS PESOS DA TRIANGULAÇÃO.
CONSENSO E UNIÃO TAMBÉM RECEBEM A CAMADA.
ADAPTATIVAS E PERSONALIZADAS USAM OS MOTORES INTEGRADOS
E O DESEMPENHO CONDICIONADO AO TRAJETO.
</div>

<div class="box">
TREINADOR GLOBAL:
RANKING VIRTUAL DAS ESTRATÉGIAS
COM VALIDAÇÃO NO CONTEXTO DE TRIANGULAÇÃO.
</div>

<div class="box">
TREINADOR GLOBAL NÚMEROS:
COMBINAÇÕES HISTÓRICAS POR NÚMERO,
COBERTURA DAS TRANSIÇÕES
E PESOS DE TRIANGULAÇÃO.
SEM GREEN/LOSS COMO CRITÉRIO.
</div>

<div class="box">
TREINADOR GLOBAL NÚMEROS 1.0:
APROVAÇÃO POR GREEN OU GREEN G1,
BLOQUEIO POR GATILHO,
TARJA NÃO JOGAR,
ALTERNATIVAS VIRTUAIS IMEDIATAS
E SELEÇÃO COM TRIANGULAÇÃO.
</div>

<div class="box">
G1:
CONGELADA,
AJUSTE FINO
E RECONSTRUÇÃO INDEPENDENTE.

A CONGELADA PRESERVA A COMBINAÇÃO DA ENTRADA.
A TRIANGULAÇÃO PARTICIPA DA COMPARAÇÃO DAS DEFESAS.
</div>

<div class="box">
REPROCESSAMENTO:
70 NÚMEROS + 10 MANUAIS.
AGUARDA ENCERRAR O CICLO REAL.
</div>

<button class="btn trainer" id="create">
CRIAR CÓPIA DA MELHOR ADAPTATIVA
</button>
`;

$("create").onclick=()=>{
if(busy)return;

const best=trainerRanking().find(
r=>r.type==="ADAPTIVE"
);

if(!best)return;

state.created.push({
id:"CUSTOM_"+Date.now(),
name:
"ESTRATÉGIA VIRTUAL "+
(state.created.length+1),
config:copy(best.config)
});

save();
render();
};
}

/* ABRIR / FECHAR PAINÉIS */

for(const [id,open] of Object.entries(state.open)) {
const element=$(id);

if(element) {
element.classList.toggle("hide",!open);
}

const header=document.querySelector(
'[data-panel="'+id+'"]'
);

const span=header?.querySelector("span");

if(span)span.textContent=open?"−":"+";
}

$("stake").value=state.stake;
$("multiplier").value=state.multiplier;
}

/* ======================================================
 MIGRAÇÃO

Se houver um ciclo real aberto na versão anterior,
ele é preservado. A reconstrução da janela só ocorre
depois do encerramento desse ciclo.
====================================================== */

async function migrateLegacy() {
if(!legacyData)return;

const old=legacyData;
legacyData=null;

const phase=old.phase||"ENTRY";

if(phase!=="ENTRY"||old.cycle) {
state=normalizeState(old);
state.migrationPending=true;
state.recalcPending=true;

if(
state.history.length>=8&&
!state.n10.choice
)prepare10(state.history);

save();
render();
return;
}

const opts={
...settings(),
strategy:old.strategy||"TRAINER",
rank:old.rank||3,
manual:old.manual||null,
adaptive:old.adaptive||"A05",
created:copy(old.created||[]),
activeCreated:old.activeCreated||null,
g1:old.g1!==false,
g1Trainer:old.g1Trainer!==false,
galeSkip:!!old.galeSkip,
secondHouse:!!old.secondHouse,
stake:Number(old.stake)||1,
multiplier:Number(old.multiplier)||1,
open:{
...fresh().open,
...(old.open||{})
}
};

await rebuild70(
cleanNumbers(old.history),
{
preserveManual:true,
customSettings:opts,
customManualLog:old.manualLog||[],
customCycles:Number(old.cyclesCompleted)||0
}
);
}

/* ======================================================
 INICIALIZAÇÃO
====================================================== */

if(
state.history.length>=8&&
!state.n10.choice
)prepare10(state.history);

render();

if(legacyData) {
setTimeout(()=>{
migrateLegacy();
},0);

} else if(
state.manualCount>=MANUAL_LIMIT||
state.recalcPending||
state.migrationPending
) {
setTimeout(()=>{
checkRecalculation();
},0);
}

})();
